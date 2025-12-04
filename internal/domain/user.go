package domain

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User: El perfil global (vinculado a Clerk)
type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	ClerkID      string    `gorm:"unique;index" json:"clerk_id"`
	Email        string    `json:"email"`
	FullName     string    `json:"full_name"`
	CreatedAt    time.Time `json:"created_at"`
}

// TeamMember: La relación "¿Quién trabaja dónde?"
type TeamMember struct {
    ID        uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
    TenantID  uuid.UUID `gorm:"type:uuid;index" json:"tenant_id"`
    UserID    string    `gorm:"index" json:"user_clerk_id"` // Clerk ID del empleado
    Role      string    `json:"role"` // admin, operator, viewer
    JoinedAt  time.Time `json:"joined_at"`
}

// Invitation: Invitaciones pendientes por correo
type Invitation struct {
    ID        uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
    TenantID  uuid.UUID `gorm:"type:uuid;index" json:"tenant_id"`
    Email     string    `json:"email"`
    Role      string    `json:"role"`
    Token     string    `gorm:"index" json:"token"` // Código único para el link
    Status    string    `json:"status"` // pending, accepted
    CreatedAt time.Time `json:"created_at"`
}

// Hooks para generar UUIDs... (pégalos como siempre)
func (u *User) BeforeCreate(tx *gorm.DB) (err error) { u.ID = uuid.New(); return }
func (t *TeamMember) BeforeCreate(tx *gorm.DB) (err error) { t.ID = uuid.New(); return }
func (i *Invitation) BeforeCreate(tx *gorm.DB) (err error) { i.ID = uuid.New(); return }