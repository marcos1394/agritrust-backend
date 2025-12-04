package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Farm struct {
	ID uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	// Esta es la clave del SaaS: Todo rancho pertenece a una empresa
	TenantID      uuid.UUID `gorm:"type:uuid;not null;index" json:"tenant_id"`
	Name          string    `gorm:"size:255;not null" json:"name"`
	TotalArea     float64   `json:"total_area"`                          // Hectáreas totales
	Location      string    `json:"location"`                            // Coordenadas o dirección simple por ahora
	OwnershipType string    `gorm:"default:'own'" json:"ownership_type"` // own, rented, litigation
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (f *Farm) BeforeCreate(tx *gorm.DB) (err error) {
	f.ID = uuid.New()
	return
}
