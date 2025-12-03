package database

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Connect inicializa la conexión a PostgreSQL
func Connect() *gorm.DB {
	// 1. Intentamos leer la variable de entorno (Nube - Render)
	dsn := os.Getenv("DATABASE_URL")

	// 2. Si está vacía, usamos la local (Desarrollo - Codespaces)
	if dsn == "" {
		dsn = "host=localhost user=agritrust_user password=secret_password dbname=agritrust_db port=5432 sslmode=disable"
		fmt.Println("⚠️ Usando configuración LOCAL de base de datos")
	} else {
		fmt.Println("☁️ Usando configuración CLOUD de base de datos")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Error fatal conectando a la base de datos:", err)
	}

	return db
}
