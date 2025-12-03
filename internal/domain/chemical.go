package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Chemical struct {
	ID               uuid.UUID  `gorm:"type:uuid;primary_key;" json:"id"`
	TenantID         *uuid.UUID `gorm:"type:uuid;index" json:"tenant_id,omitempty"` // Si es null, es un químico global del sistema
	Name             string     `gorm:"size:255;not null" json:"name"`
	ActiveIngredient string     `gorm:"size:255" json:"active_ingredient"`
	IsBanned         bool       `gorm:"default:false" json:"is_banned"` // El switch de la muerte 💀
	BannedMarkets    string     `json:"banned_markets"`                 // ej: "EU, USA, JAPAN"
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

func (c *Chemical) BeforeCreate(tx *gorm.DB) (err error) {
	c.ID = uuid.New()
	return
}
