package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Supplier: A quién le compramos (Proveedores)
type Supplier struct {
	ID            uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	TenantID      uuid.UUID `gorm:"type:uuid;not null;index" json:"tenant_id"`
	
	Name          string    `gorm:"size:255;not null" json:"name"`
	TaxID         string    `json:"tax_id"` // RFC / VAT ID
	ContactName   string    `json:"contact_name"`
	Email         string    `json:"email"`
	Phone         string    `json:"phone"`
	CreditDays    int       `json:"credit_days"` // Días de crédito (Ej: 30, 60)
	
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// PurchaseOrder: El documento formal de pedido (PO)
type PurchaseOrder struct {
	ID            uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	TenantID      uuid.UUID `gorm:"type:uuid;not null;index" json:"tenant_id"`
	
	OrderNumber   string    `gorm:"uniqueIndex" json:"order_number"` // Ej: PO-2025-001
	SupplierID    uuid.UUID `gorm:"type:uuid;not null;index" json:"supplier_id"`
	Supplier      Supplier  `json:"supplier,omitempty"`
	
	Status        string    `json:"status"` // draft, ordered, received, cancelled
	TotalAmount   float64   `gorm:"type:decimal(15,2)" json:"total_amount"`
	Notes         string    `json:"notes"`
	
	OrderDate     time.Time `json:"order_date"`
	ExpectedDate  time.Time `json:"expected_date"`
	
	// Detalle de los items (Relación 1:N)
	Items         []PurchaseOrderItem `gorm:"foreignKey:PurchaseOrderID" json:"items,omitempty"`

	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// PurchaseOrderItem: Renglones de la orden
type PurchaseOrderItem struct {
	ID              uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	PurchaseOrderID uuid.UUID `gorm:"type:uuid;not null;index" json:"purchase_order_id"`
	
	ProductID       uuid.UUID `gorm:"type:uuid;not null;index" json:"product_id"`
	Product         Product   `json:"product,omitempty"` // Relación con Inventario
	
	Quantity        float64   `json:"quantity"`
	UnitCost        float64   `json:"unit_cost"`
	Subtotal        float64   `json:"subtotal"`
}

// Hooks para UUIDs
func (s *Supplier) BeforeCreate(tx *gorm.DB) (err error) { s.ID = uuid.New(); return }
func (p *PurchaseOrder) BeforeCreate(tx *gorm.DB) (err error) { p.ID = uuid.New(); return }
func (i *PurchaseOrderItem) BeforeCreate(tx *gorm.DB) (err error) { i.ID = uuid.New(); return }
