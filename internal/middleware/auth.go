package middleware

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Tu Clave Pública de Clerk (PEGA AQUÍ EL CONTENIDO SI ESTÁS EN LOCAL Y NO QUIERES LIDIAR CON ENV)
// En producción, esto debe leerse de os.Getenv("CLERK_PEM_PUBLIC_KEY")
const HARDCODED_PEM_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtH6qtcH9e9/A1XiHw8tR
OTlGpxckeQeEZFHC/TiHwDLVjj3uHyiPIh+OjUaLse4nk8+2jmejaM9/HVM16shi
FrO/Tvxzfw01D8exRfmpBvf5o9dD0I9nIDbNnjDr2XoI5E8dWrmB8QkJvVYEwqJX
BAmBzldWRHI5GrXStaLawEnfff1SQ6GlMWYgnWnxd/KgIMUc+eFcZl+vcEhIhR1h
mzZcSBsowebD2rfJ3eNxNaFWB2BP3ekRAuaUYgGXG5lpnWpWKdph+NBQ/sRb566j
VnyJSNqK9tb7jrHAeflHAyKKoDPO9n0OWHZgWmCyG3tVKRcqEOdL+AxM/rCJSqRt
hQIDAQAB
-----END PUBLIC KEY-----
`

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Falta token de autorización"})
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Formato Bearer inválido"})
			return
		}

		tokenString := parts[1]

		// 1. Parsear y Validar el Token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validar que el algoritmo sea RSA (RS256)
			if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("método de firma inesperado: %v", token.Header["alg"])
			}

			// 2. Obtener la Clave Pública (Prioridad: Variable de Entorno -> Hardcoded)
			pemString := os.Getenv("CLERK_PEM_PUBLIC_KEY")
			if pemString == "" {
				pemString = HARDCODED_PEM_KEY
			}

			return parseRSAPublicKey(pemString)
		})

		if err != nil || !token.Valid {
			fmt.Println("Error validando token:", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido o expirado"})
			return
		}

		// 3. Extraer Datos del Usuario (Claims)
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			// A. ID de Usuario
			if sub, ok := claims["sub"].(string); ok {
				c.Set("clerk_user_id", sub)
			}

			// B. Extracción de ROL (Estándar de Clerk)
			// Clerk guarda la metadata pública a veces plana o anidada.
			// Generalmente viene en "public_metadata" -> "role"
			if metadata, ok := claims["public_metadata"].(map[string]interface{}); ok {
				if role, ok := metadata["role"].(string); ok {
					c.Set("user_role", role) // Guardamos "admin" u "operator"
				}
			} else {
				// Si no tiene rol, asumimos el más bajo
				c.Set("user_role", "operator")
			}
		}

		c.Next()
	}
}

// Helper para convertir el string PEM a objeto RSA Public Key
func parseRSAPublicKey(pemStr string) (*rsa.PublicKey, error) {
	block, _ := pem.Decode([]byte(pemStr))
	if block == nil {
		return nil, errors.New("falló al parsear bloque PEM")
	}
	pub, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	switch pub := pub.(type) {
	case *rsa.PublicKey:
		return pub, nil
	default:
		return nil, errors.New("la clave no es tipo RSA")
	}
}
