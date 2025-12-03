package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware verifica que venga un token de Clerk
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Obtener el header "Authorization"
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "No se proporcionó token de autorización"})
			return
		}

		// 2. Verificar formato "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Formato de token inválido"})
			return
		}

		tokenString := parts[1]

		// 3. (AQUÍ IRÍA LA VALIDACIÓN CRIPTOGRÁFICA DE CLERK)
		// Por hoy, para el MVP, validaremos que el token no esté vacío.
		// En el siguiente paso implementaremos la validación real con la llave pública de Clerk.
		if len(tokenString) < 10 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			return
		}

		// Si pasa, guardamos el token en el contexto por si lo necesitamos
		c.Set("clerk_token", tokenString)
		
		c.Next()
	}
}