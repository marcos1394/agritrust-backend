package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/Marcos1394/agritrust-backend/internal/domain"
	"github.com/Marcos1394/agritrust-backend/internal/middleware"
	"github.com/Marcos1394/agritrust-backend/pkg/database"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Middleware auxiliar para bloquear acceso si no es ADMIN
func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Leemos el rol que el AuthMiddleware extrajo del token de Clerk
		role := c.GetString("user_role")

		// Si no es admin, cortamos la petición aquí mismo
		if role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "Acceso denegado: Se requieren permisos de Administrador.",
			})
			return
		}
		c.Next()
	}
}

func main() {
	// ---------------------------------------------------------
	// 1. INICIALIZACIÓN Y BASE DE DATOS
	// ---------------------------------------------------------
	db := database.Connect()

	// Migración Automática
	err := db.AutoMigrate(
		&domain.Tenant{},
		&domain.Farm{},
		&domain.User{},
		&domain.Chemical{},
		&domain.ApplicationRecord{},
		&domain.Crop{},
		&domain.HarvestBatch{},
		&domain.Shipment{},
		&domain.Bin{},
		&domain.Claim{},
		&domain.TeamMember{},
		&domain.Invitation{},
	)
	if err != nil {
		panic("❌ Error CRÍTICO en migración de base de datos: " + err.Error())
	}

	r := gin.Default()

	// === CONFIGURACIÓN CORS ===
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "Accept"}
	r.Use(cors.New(corsConfig))

	// ---------------------------------------------------------
	// 🌍 ZONA PÚBLICA (Sin Autenticación)
	// ---------------------------------------------------------
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "online", "system": "AgriTrust Backend"})
	})

	// ---------------------------------------------------------
	// 🔒 ZONA PROTEGIDA GENERAL (Admins + Operadores)
	// ---------------------------------------------------------
	// Aquí entran todos los usuarios logueados.
	// El Operador necesita leer catálogos y registrar acciones de campo.
	protected := r.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		// --- LECTURA DE CATÁLOGOS (Necesario para que la App Móvil funcione) ---

		protected.GET("/tenants", func(c *gin.Context) {
			// En producción filtraríamos por usuario/organización
			clerkUserID := c.GetString("clerk_user_id")
			var tenants []domain.Tenant
			// Mostramos las empresas donde eres dueño (o todas si eres operador asignado - lógica simplificada)
			db.Where("owner_id = ?", clerkUserID).Or("active = ?", true).Find(&tenants)
			c.JSON(http.StatusOK, tenants)
		})

		protected.GET("/farms", func(c *gin.Context) {
			tenantID := c.Query("tenant_id")
			var farms []domain.Farm
			if tenantID != "" {
				db.Where("tenant_id = ?", tenantID).Find(&farms)
			} else {
				db.Find(&farms)
			}
			c.JSON(http.StatusOK, farms)
		})

		// Aceptar Invitación
		protected.POST("/team/join", func(c *gin.Context) {
			clerkUserID := c.GetString("clerk_user_id")

			type JoinReq struct {
				Token string `json:"token"`
			}
			var req JoinReq
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Token requerido"})
				return
			}

			// 1. Buscar Invitación
			var invite domain.Invitation
			if err := db.Where("token = ? AND status = 'pending'", req.Token).First(&invite).Error; err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Invitación inválida o expirada"})
				return
			}

			// 2. Crear Membresía
			member := domain.TeamMember{
				TenantID: invite.TenantID,
				UserID:   clerkUserID,
				Role:     invite.Role,
				JoinedAt: time.Now(),
			}
			db.Create(&member)

			// 3. Marcar invitación como usada
			invite.Status = "accepted"
			db.Save(&invite)

			c.JSON(http.StatusOK, gin.H{"message": "¡Bienvenido al equipo!", "role": invite.Role})
		})

		protected.GET("/chemicals", func(c *gin.Context) {
			var chems []domain.Chemical
			db.Find(&chems)
			c.JSON(http.StatusOK, chems)
		})

		protected.GET("/crops", func(c *gin.Context) {
			var crops []domain.Crop
			db.Find(&crops)
			c.JSON(http.StatusOK, crops)
		})

		protected.GET("/harvest-batches", func(c *gin.Context) {
			var batches []domain.HarvestBatch
			db.Preload("Crop").Find(&batches)
			c.JSON(http.StatusOK, batches)
		})

		// --- OPERACIONES DE CAMPO (Escritura permitida a Operadores) ---

		// 1. Registrar Aplicación (Fitosanidad)
		protected.POST("/applications", func(c *gin.Context) {
			var app domain.ApplicationRecord
			if err := c.ShouldBindJSON(&app); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			var chem domain.Chemical
			if err := db.First(&chem, "id = ?", app.ChemicalID).Error; err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Químico no encontrado"})
				return
			}
			if chem.IsBanned {
				c.JSON(http.StatusForbidden, gin.H{
					"error":   "ALERTA CRÍTICA: Intento de aplicar producto prohibido",
					"details": "Producto " + chem.Name + " prohibido en: " + chem.BannedMarkets,
					"status":  "BLOCKED",
				})
				return
			}
			app.AppliedAt = time.Now()
			app.Status = "approved"
			db.Create(&app)
			c.JSON(http.StatusCreated, gin.H{"message": "Aplicación registrada", "data": app})
		})

		// 2. Escanear Cajas (Cosecha)
		protected.POST("/bins/scan", func(c *gin.Context) {
			type ScanRequest struct {
				QRCode         string  `json:"qr_code"`
				HarvestBatchID string  `json:"harvest_batch_id"`
				Weight         float64 `json:"weight"`
				TenantID       string  `json:"tenant_id"`
			}
			var req ScanRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			tenantUUID, _ := uuid.Parse(req.TenantID)
			batchUUID, _ := uuid.Parse(req.HarvestBatchID)

			var bin domain.Bin
			result := db.Where("qr_code = ? AND tenant_id = ?", req.QRCode, tenantUUID).First(&bin)
			if result.Error != nil {
				bin.TenantID = tenantUUID
				bin.QRCode = req.QRCode
			}

			updateData := map[string]interface{}{
				"harvest_batch_id": batchUUID,
				"weight_kg":        req.Weight,
				"status":           "full_in_field",
				"updated_at":       time.Now(),
			}

			if bin.ID == uuid.Nil {
				bin.HarvestBatchID = &batchUUID
				bin.WeightKg = req.Weight
				bin.Status = "full_in_field"
				db.Create(&bin)
			} else {
				db.Model(&bin).Updates(updateData)
			}

			c.JSON(http.StatusOK, gin.H{"message": "Bin vinculado", "qr": bin.QRCode})
		})
	}

	// =========================================================
	// ⛔ ZONA VIP (Solo Admins)
	// =========================================================
	// El Capataz NO ENTRA aquí. Solo Web Admin.

	adminOnly := protected.Group("/")
	adminOnly.Use(RequireAdmin()) // <--- AQUÍ ESTÁ EL CANDADO
	{
		// --- DASHBOARD FINANCIERO Y ESTADÍSTICAS ---
		adminOnly.GET("/dashboard/stats", func(c *gin.Context) {
			type ChartPoint struct {
				Date  string  `json:"date"`
				Value float64 `json:"value"`
			}
			stats := gin.H{
				"total_harvest_today": 0.0,
				"active_batches":      0,
				"security_alerts":     0,
				"weekly_trend":        []ChartPoint{},
			}

			// Lógica de conteo real
			var totalWeight float64
			db.Model(&domain.Bin{}).Where("DATE(updated_at) = CURRENT_DATE").Select("COALESCE(SUM(weight_kg), 0)").Scan(&totalWeight)
			stats["total_harvest_today"] = totalWeight

			var activeBatches int64
			db.Model(&domain.HarvestBatch{}).Where("DATE(harvest_date) = CURRENT_DATE").Count(&activeBatches)
			stats["active_batches"] = activeBatches

			// Gráfico semanal
			rows, err := db.Raw(`SELECT TO_CHAR(updated_at, 'YYYY-MM-DD') as date, SUM(weight_kg) as value FROM bins WHERE updated_at >= CURRENT_DATE - INTERVAL '7 days' GROUP BY date ORDER BY date ASC`).Rows()
			if err == nil {
				defer rows.Close()
				var trend []ChartPoint
				for rows.Next() {
					var p ChartPoint
					rows.Scan(&p.Date, &p.Value)
					trend = append(trend, p)
				}
				stats["weekly_trend"] = trend
			}
			c.JSON(http.StatusOK, stats)
		})

		// Invitar Colaborador
		adminOnly.POST("/team/invite", func(c *gin.Context) {
			// 1. Obtener Tenant del Admin actual
			// (Simplificado: Asumimos que el admin opera sobre su primera empresa.
			// En producción, el tenant_id debería venir en el header o seleccionarse)
			clerkUserID := c.GetString("clerk_user_id")
			var tenant domain.Tenant
			if err := db.Where("owner_id = ?", clerkUserID).First(&tenant).Error; err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "No tienes una empresa registrada para invitar a nadie."})
				return
			}

			type InviteReq struct {
				Email string `json:"email"`
				Role  string `json:"role"` // operator, admin
			}
			var req InviteReq
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			// 2. Crear Invitación
			invite := domain.Invitation{
				TenantID:  tenant.ID,
				Email:     req.Email,
				Role:      req.Role,
				Token:     uuid.New().String(), // Token simple
				Status:    "pending",
				CreatedAt: time.Now(),
			}
			db.Create(&invite)

			// 3. (Simulación) Enviar Email
			// Aquí conectaríamos SendGrid o AWS SES.
			// Por ahora devolvemos el link en el JSON para probar.
			inviteLink := fmt.Sprintf("https://agritrust-phi.vercel.app/join?token=%s", invite.Token)

			c.JSON(http.StatusCreated, gin.H{
				"message":       "Invitación creada",
				"link_simulado": inviteLink, // <--- Para que lo copies y pruebes
				"invite":        invite,
			})
		})

		// Listar Miembros del Equipo
		adminOnly.GET("/team", func(c *gin.Context) {
			clerkUserID := c.GetString("clerk_user_id")
			// Buscar tenant del admin
			var tenant domain.Tenant
			db.Where("owner_id = ?", clerkUserID).First(&tenant)

			// Buscar miembros
			var members []domain.TeamMember
			db.Where("tenant_id = ?", tenant.ID).Find(&members)

			// Buscar invitaciones pendientes
			var invites []domain.Invitation
			db.Where("tenant_id = ? AND status = 'pending'", tenant.ID).Find(&invites)

			c.JSON(http.StatusOK, gin.H{"members": members, "invites": invites})
		})

		// --- GESTIÓN (CREAR ENTIDADES) ---

		// Crear Empresa
		adminOnly.POST("/tenants", func(c *gin.Context) {
			clerkUserID := c.GetString("clerk_user_id")
			var newTenant domain.Tenant
			if err := c.ShouldBindJSON(&newTenant); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			newTenant.OwnerID = clerkUserID
			if err := db.Create(&newTenant).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusCreated, newTenant)
		})

		// Crear Rancho
		adminOnly.POST("/farms", func(c *gin.Context) {
			var newFarm domain.Farm
			if err := c.ShouldBindJSON(&newFarm); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			db.Create(&newFarm)
			c.JSON(http.StatusCreated, newFarm)
		})

		// Crear Químico (Catálogo)
		adminOnly.POST("/chemicals", func(c *gin.Context) {
			var chem domain.Chemical
			if err := c.ShouldBindJSON(&chem); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			db.Create(&chem)
			c.JSON(http.StatusCreated, chem)
		})

		// Crear Cultivo
		adminOnly.POST("/crops", func(c *gin.Context) {
			var crop domain.Crop
			if err := c.ShouldBindJSON(&crop); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			db.Create(&crop)
			c.JSON(http.StatusCreated, crop)
		})

		// Crear Lote de Cosecha
		adminOnly.POST("/harvest-batches", func(c *gin.Context) {
			var batch domain.HarvestBatch
			if err := c.ShouldBindJSON(&batch); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			if batch.BatchCode == "" {
				batch.BatchCode = fmt.Sprintf("LOTE-%d", time.Now().Unix())
			}
			batch.HarvestDate = time.Now()
			db.Create(&batch)
			c.JSON(http.StatusCreated, batch)
		})

		// Listar Bins con Filtros Inteligentes
		adminOnly.GET("/bins", func(c *gin.Context) {
			var bins []domain.Bin

			// Preparar Query
			query := db.Model(&domain.Bin{})

			// 1. Filtro por Lote (Opcional)
			if batchID := c.Query("harvest_batch_id"); batchID != "" {
				query = query.Where("harvest_batch_id = ?", batchID)
			}

			// 2. Filtro por Estatus (Vital para Logística)
			// Ejemplo: ?status=full_in_field (Dame inventario disponible)
			if status := c.Query("status"); status != "" {
				query = query.Where("status = ?", status)
			}

			// Ejecutar (Quitamos el límite de 50 si es para embarque, o lo subimos a 1000)
			query.Order("updated_at desc").Limit(1000).Find(&bins)

			c.JSON(http.StatusOK, bins)
		})

		// Logística
		adminOnly.POST("/shipments", func(c *gin.Context) {
			// (Simplificado para brevedad, usa la lógica que ya tenías)
			c.JSON(http.StatusNotImplemented, gin.H{"message": "Módulo Logística disponible pronto"})
		})

		adminOnly.POST("/claims", func(c *gin.Context) {
			c.JSON(http.StatusNotImplemented, gin.H{"message": "Módulo Reclamos disponible pronto"})
		})
	}

	// ---------------------------------------------------------
	// ARRANQUE DEL SERVIDOR
	// ---------------------------------------------------------
	fmt.Println("🚀 AgriTrust Backend Seguro corriendo en puerto 8080")
	r.Run(":8080")
}
