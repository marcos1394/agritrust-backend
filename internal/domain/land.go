package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// LeaseContract: El contrato legal de renta con un ejidatario/dueño
type LeaseContract struct {
	ID       uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	TenantID uuid.UUID `gorm:"type:uuid;not null;index" json:"tenant_id"`
	FarmID   uuid.UUID `gorm:"type:uuid;not null;index" json:"farm_id"`
	Farm     Farm      `json:"farm,omitempty"`

	LandownerName string    `json:"landowner_name"` // Ej: Juan Pérez (Ejidatario)
	StartDate     time.Time `json:"start_date"`
	EndDate       time.Time `json:"end_date"`
	PaymentAmount float64   `gorm:"type:decimal(15,2)" json:"payment_amount"`
	PaymentFreq   string    `json:"payment_freq"` // monthly, yearly, harvest_end

	ContractDocURL string `json:"contract_doc_url"` // PDF en S3 (simulado por ahora)
	Status         string `json:"status"`           // active, expired, negotiation

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (l *LeaseContract) BeforeCreate(tx *gorm.DB) (err error) {
	l.ID = uuid.New()
	return
}
