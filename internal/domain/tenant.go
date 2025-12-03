package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Tenant representa a una Agrícola (Cliente del SaaS)
type Tenant struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	Name      string    `gorm:"size:255;not null" json:"name"`
	RFC       string    `gorm:"size:13;unique" json:"rfc"`   // Contexto México
	Plan      string    `gorm:"default:'basic'" json:"plan"` // basic, pro, enterprise
	Active    bool      `gorm:"default:true" json:"active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// BeforeCreate es un Hook de GORM para generar el UUID automáticamente antes de guardar
func (t *Tenant) BeforeCreate(tx *gorm.DB) (err error) {
	t.ID = uuid.New()
	return
}
