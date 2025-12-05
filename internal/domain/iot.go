package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Device: El hardware físico (Sensor o Válvula)
type Device struct {
	ID       uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	TenantID uuid.UUID `gorm:"type:uuid;not null;index" json:"tenant_id"`
	FarmID   uuid.UUID `gorm:"type:uuid;not null;index" json:"farm_id"`

	Name   string `gorm:"size:100" json:"name"`
	Type   string `json:"type"`   // moisture_sensor, flow_meter, valve
	Status string `json:"status"` // online, offline, error

	// Configuración de Alertas
	MinThreshold float64 `json:"min_threshold"` // Ej: Humedad mínima 30%
	MaxThreshold float64 `json:"max_threshold"` // Ej: Humedad máxima 80%

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TelemetryData: El dato crudo que manda el sensor cada 10 mins
type TelemetryData struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	DeviceID  uuid.UUID `gorm:"type:uuid;not null;index" json:"device_id"`
	Value     float64   `json:"value"` // El dato (ej: 45.5 % humedad)
	Timestamp time.Time `gorm:"index" json:"timestamp"`
}

func (d *Device) BeforeCreate(tx *gorm.DB) (err error) {
	d.ID = uuid.New()
	return
}
func (t *TelemetryData) BeforeCreate(tx *gorm.DB) (err error) {
	t.ID = uuid.New()
	return
}
