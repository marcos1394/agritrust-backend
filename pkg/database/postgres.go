package database

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Connect inicializa la conexión a PostgreSQL
func Connect() *gorm.DB {
	// Configuración hardcodeada por ahora (luego usaremos variables de entorno)
	// Estos datos coinciden con tu docker-compose.yml
	dsn := "host=localhost user=agritrust_user password=secret_password dbname=agritrust_db port=5432 sslmode=disable"

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Error fatal conectando a la base de datos:", err)
	}

	fmt.Println("✅ Conexión a PostgreSQL exitosa")
	return db
}