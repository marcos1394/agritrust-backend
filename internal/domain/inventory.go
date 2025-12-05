package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Product: El catálogo maestro de cosas que compramos (SKUs)
type Product struct {
	ID       uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	TenantID uuid.UUID `gorm:"type:uuid;not null;index" json:"tenant_id"`

	Name     string `gorm:"size:255;not null" json:"name"`
	SKU      string `gorm:"size:50;index" json:"sku"` // Código de barras
	Category string `json:"category"`                 // Chemical, PackingMaterial, Fuel, SparePart
	Unit     string `json:"unit"`                     // L, Kg, Piece, Sack

	// Control de Stock
	CurrentStock  float64 `json:"current_stock"`
	MinStockLevel float64 `json:"min_stock_level"`                    // Para alertas de reorden
	AvgCost       float64 `gorm:"type:decimal(15,2)" json:"avg_cost"` // Costo promedio ponderado

	// Relación con Químicos (Si es un agroquímico)
	ChemicalID *uuid.UUID `json:"chemical_id,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// StockMovement: Kardex (Entradas y Salidas)
type StockMovement struct {
	ID       uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	TenantID uuid.UUID `gorm:"type:uuid;not null;index" json:"tenant_id"`

	ProductID uuid.UUID `gorm:"type:uuid;not null;index" json:"product_id"`
	Product   Product   `json:"product,omitempty"`

	Type        string  `json:"type"` // IN (Compra), OUT (Consumo), ADJ (Ajuste)
	Quantity    float64 `json:"quantity"`
	CostPerUnit float64 `json:"cost_per_unit"` // Solo relevante en entradas

	ReferenceID string `json:"reference_id"` // ID de la Aplicación de campo o Factura de compra
	Reason      string `json:"reason"`       // "Aplicación Lote A", "Compra Factura 500"

	CreatedAt time.Time `json:"created_at"`
}

func (p *Product) BeforeCreate(tx *gorm.DB) (err error) {
	p.ID = uuid.New()
	return
}
func (m *StockMovement) BeforeCreate(tx *gorm.DB) (err error) {
	m.ID = uuid.New()
	return
}
