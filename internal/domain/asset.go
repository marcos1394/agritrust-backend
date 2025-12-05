package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Asset: El vehículo o maquinaria
type Asset struct {
	ID            uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	TenantID      uuid.UUID `gorm:"type:uuid;not null;index" json:"tenant_id"`
	
	Name          string    `gorm:"size:255;not null" json:"name"` // Ej: Tractor John Deere 6120
	Type          string    `json:"type"` // tractor, truck, pump, implement
	Brand         string    `json:"brand"`
	Model         string    `json:"model"`
	SerialNumber  string    `json:"serial_number"`
	
	// Estado Operativo
	Status        string    `json:"status"` // active, in_shop, broken_down
	
	// Control de Uso (Odómetro/Horómetro)
	UsageUnit     string    `json:"usage_unit"` // hours, km
	CurrentUsage  float64   `json:"current_usage"` // Lectura actual (Ej: 4500 hrs)
	
	// Configuración de Mantenimiento
	ServiceInterval float64 `json:"service_interval"` // Cada cuánto se da servicio (Ej: cada 200 hrs)
	NextServiceAt   float64 `json:"next_service_at"`  // A qué lectura toca el siguiente (Ej: a las 4600 hrs)

	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// MaintenanceLog: Bitácora de taller
type MaintenanceLog struct {
	ID            uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	TenantID      uuid.UUID `gorm:"type:uuid;not null;index" json:"tenant_id"`
	AssetID       uuid.UUID `gorm:"type:uuid;not null;index" json:"asset_id"`
	
	ServiceDate   time.Time `json:"service_date"`
	Type          string    `json:"type"` // preventive, corrective
	Description   string    `json:"description"` // "Cambio de aceite y filtros"
	Cost          float64   `json:"cost"`
	UsageAtService float64  `json:"usage_at_service"` // A qué kilometraje se hizo
	
	MechanicName  string    `json:"mechanic_name"`
	
	CreatedAt     time.Time `json:"created_at"`
}

func (a *Asset) BeforeCreate(tx *gorm.DB) (err error) {
	a.ID = uuid.New()
	return
}
func (m *MaintenanceLog) BeforeCreate(tx *gorm.DB) (err error) {
	m.ID = uuid.New()
	return
}