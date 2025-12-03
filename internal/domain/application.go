package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ApplicationRecord struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	TenantID   uuid.UUID `gorm:"type:uuid;not null;index" json:"tenant_id"`
	FarmID     uuid.UUID `gorm:"type:uuid;not null;index" json:"farm_id"`
	ChemicalID uuid.UUID `gorm:"type:uuid;not null" json:"chemical_id"`

	// Datos de la operación
	Dosage    float64   `json:"dosage"`                          // Cantidad aplicada
	Unit      string    `json:"unit"`                            // L, Kg, mL
	AppliedAt time.Time `json:"applied_at"`                      // Cuándo sucedió en la vida real
	Status    string    `gorm:"default:'pending'" json:"status"` // pending, approved, rejected

	// Auditoría
	Notes     string    `json:"notes"`
	CreatedAt time.Time `json:"created_at"`
}

func (a *ApplicationRecord) BeforeCreate(tx *gorm.DB) (err error) {
	a.ID = uuid.New()
	return
}
