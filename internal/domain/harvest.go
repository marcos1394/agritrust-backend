package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Crop: Define qué está sembrado en el rancho
type Crop struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	TenantID     uuid.UUID `gorm:"type:uuid;index" json:"tenant_id"`
	FarmID       uuid.UUID `gorm:"type:uuid;index" json:"farm_id"`
	Name         string    `json:"name"` // Ej: Tomate Saladette
	Variety      string    `json:"variety"`
	PlantingDate time.Time `json:"planting_date"`
	Status       string    `json:"status"` // growing, harvesting, finished
}

// HarvestBatch: Representa un día de corte en un rancho
type HarvestBatch struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	TenantID    uuid.UUID `gorm:"type:uuid;index" json:"tenant_id"`
	FarmID      uuid.UUID `gorm:"type:uuid;index" json:"farm_id"`
	CropID      uuid.UUID `gorm:"type:uuid;index" json:"crop_id"`
	BatchCode   string    `gorm:"unique" json:"batch_code"` // Ej: LOT-20251025-A
	HarvestDate time.Time `json:"harvest_date"`
	TotalBins   int       `json:"total_bins"` // Contador de cajas
	Crop        Crop      `json:"crop,omitempty" gorm:"foreignKey:CropID"`
}

// Bin: La caja física con QR
type Bin struct {
	ID             uuid.UUID  `gorm:"type:uuid;primary_key;" json:"id"`
	TenantID       uuid.UUID  `gorm:"type:uuid;index" json:"tenant_id"`
	QRCode         string     `gorm:"unique;index" json:"qr_code"`             // El string único del QR
	HarvestBatchID *uuid.UUID `gorm:"type:uuid;index" json:"harvest_batch_id"` // Puede ser null si la caja está vacía
	WeightKg       float64    `json:"weight_kg"`
	Status         string     `json:"status"` // empty, full_in_field, received_in_packing
	UpdatedAt      time.Time  `json:"updated_at"`
	ShipmentID     *uuid.UUID `gorm:"type:uuid;index" json:"shipment_id"` // El camión donde se fue
}

func (c *Crop) BeforeCreate(tx *gorm.DB) (err error) {
	c.ID = uuid.New()
	return
}
func (h *HarvestBatch) BeforeCreate(tx *gorm.DB) (err error) {
	h.ID = uuid.New()
	return
}
func (b *Bin) BeforeCreate(tx *gorm.DB) (err error) {
	b.ID = uuid.New()
	return
}
