package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ---------------------------------------------------------
// 1. ESTRUCTURAS BASE (Season y Categorías)
// ---------------------------------------------------------

// Season: El Ciclo Agrícola (Ej: "Tomate 2025")
type Season struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	TenantID  uuid.UUID `gorm:"type:uuid;not null;index" json:"tenant_id"`
	
	Name      string    `gorm:"size:100;not null" json:"name"`
	StartDate time.Time `gorm:"not null" json:"start_date"`
	EndDate   time.Time `gorm:"not null" json:"end_date"`
	Active    bool      `gorm:"default:true" json:"active"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// CostCategory: Plan de Cuentas (Jerárquico)
// Ej: Padre="Nutrición", Hija="Fertilizantes Nitrogenados"
type CostCategory struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	TenantID  uuid.UUID `gorm:"type:uuid;not null;index" json:"tenant_id"`
	
	Name      string    `gorm:"size:100;not null" json:"name"`
	Code      string    `gorm:"size:20" json:"code"` // Ej: "NUT-001"
	Color     string    `gorm:"size:7;default:'#10b981'" json:"color"` // Hex para gráficas

	// Jerarquía (Self-Referencing)
	ParentID  *uuid.UUID     `gorm:"type:uuid;index" json:"parent_id"`
	Children  []CostCategory `gorm:"foreignKey:ParentID" json:"children,omitempty"`
}

// ---------------------------------------------------------
// 2. EL PLAN (Presupuesto)
// ---------------------------------------------------------

// Budget: La meta financiera ("Cuánto planeo gastar")
type Budget struct {
	ID             uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	TenantID       uuid.UUID `gorm:"type:uuid;not null;index" json:"tenant_id"`
	
	// Relaciones
	SeasonID       uuid.UUID `gorm:"type:uuid;not null;index" json:"season_id"`
	FarmID         uuid.UUID `gorm:"type:uuid;not null;index" json:"farm_id"`
	CostCategoryID uuid.UUID `gorm:"type:uuid;not null;index" json:"cost_category_id"`
	
	// Datos
	Month          int       `gorm:"not null" json:"month"` // 1-12
	Year           int       `gorm:"not null" json:"year"`  // 2025
	Amount         float64   `gorm:"type:decimal(15,2);not null" json:"amount"`
	
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// ---------------------------------------------------------
// 3. LA REALIDAD (Gastos) - ¡NUEVO!
// ---------------------------------------------------------

// Expense: Dinero real saliendo de la caja
type Expense struct {
	ID             uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	TenantID       uuid.UUID `gorm:"type:uuid;not null;index" json:"tenant_id"`
	
	// Contexto
	SeasonID       uuid.UUID `gorm:"type:uuid;not null;index" json:"season_id"`
	FarmID         uuid.UUID `gorm:"type:uuid;not null;index" json:"farm_id"`
	CostCategoryID uuid.UUID `gorm:"type:uuid;not null;index" json:"cost_category_id"`
	
	// Detalle del Gasto
	Description    string    `json:"description"` // Ej: "Factura F-2034 Proveedor X"
	ExpenseDate    time.Time `json:"expense_date"`
	Amount         float64   `gorm:"type:decimal(15,2);not null" json:"amount"`
	
	// Evidencia (Foto de la factura o ticket)
	ReceiptURL     string    `json:"receipt_url"` 
	
	CreatedAt      time.Time `json:"created_at"`
}

// ---------------------------------------------------------
// HOOKS (Generadores de UUID)
// ---------------------------------------------------------

func (s *Season) BeforeCreate(tx *gorm.DB) (err error) {
	s.ID = uuid.New()
	return
}
func (c *CostCategory) BeforeCreate(tx *gorm.DB) (err error) {
	c.ID = uuid.New()
	return
}
func (b *Budget) BeforeCreate(tx *gorm.DB) (err error) {
	b.ID = uuid.New()
	return
}
func (e *Expense) BeforeCreate(tx *gorm.DB) (err error) {
	e.ID = uuid.New()
	return
}