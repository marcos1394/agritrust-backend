package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Shipment: El camión que sale hacia el cliente
type Shipment struct {
	ID            uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	TenantID      uuid.UUID `gorm:"type:uuid;index" json:"tenant_id"`
	CustomerName  string    `json:"customer_name"` // Ej: "Whole Foods Market"
	Destination   string    `json:"destination"`   // Ej: "McAllen, TX"
	DepartureTime time.Time `json:"departure_time"`
	TruckPlate    string    `json:"truck_plate"`
	Status        string    `json:"status"` // shipped, delivered, rejected, partially_rejected

	// Relación: Un envío tiene muchos Bins (Simplificado para MVP)
	// En un sistema real usaríamos una tabla intermedia ShipmentItems
	Bins []Bin `gorm:"foreignKey:ShipmentID" json:"bins,omitempty"`
}

// Claim: La "Defensa" - Cuando el cliente descuenta dinero
type Claim struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	TenantID   uuid.UUID `gorm:"type:uuid;index" json:"tenant_id"`
	ShipmentID uuid.UUID `gorm:"type:uuid;index" json:"shipment_id"`

	ClaimDate time.Time `json:"claim_date"`
	Reason    string    `json:"reason"`     // Decay, Mold, Wrong Size
	AmountUSD float64   `json:"amount_usd"` // Dinero que nos quieren quitar

	EvidenceURL   string `json:"evidence_url"`   // Foto que manda el cliente
	InternalNotes string `json:"internal_notes"` // "La foto del cliente parece falsa"
	Status        string `json:"status"`         // open, disputed, accepted
}

func (s *Shipment) BeforeCreate(tx *gorm.DB) (err error) {
	s.ID = uuid.New()
	return
}
func (c *Claim) BeforeCreate(tx *gorm.DB) (err error) {
	c.ID = uuid.New()
	return
}
