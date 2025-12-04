package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/Marcos1394/agritrust-backend/internal/domain"
	"github.com/Marcos1394/agritrust-backend/internal/middleware"
	"github.com/Marcos1394/agritrust-backend/pkg/database"
	"github.com/Marcos1394/agritrust-backend/pkg/mailer" // <--- AGREGAR ESTO
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
		&domain.Season{},
		&domain.CostCategory{},
		&domain.Budget{},
		&domain.Expense{},
		&domain.LeaseContract{}, // <--- NUEVA TABLA

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
	// 🌍 ZONA PÚBLICA (Consumer Facing)
	// ---------------------------------------------------------

	// ... (Tu endpoint /ping ya está aquí) ...

	// PASAPORTE DIGITAL: Historia de la caja para el consumidor
	r.GET("/public/passport/:qr_code", func(c *gin.Context) {
		qrCode := c.Param("qr_code")

		// 1. Buscar la caja
		var bin domain.Bin
		if err := db.Where("qr_code = ?", qrCode).First(&bin).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Producto no encontrado. Verifique el código."})
			return
		}

		// 2. Cargar datos relacionados (Lote -> Cultivo -> Rancho -> Tenant)
		// Usamos queries manuales para no complicar los structs con preloads anidados profundos hoy
		var batch domain.HarvestBatch
		db.First(&batch, "id = ?", bin.HarvestBatchID)

		var crop domain.Crop
		db.First(&crop, "id = ?", batch.CropID)

		var farm domain.Farm
		db.First(&farm, "id = ?", batch.FarmID)

		var tenant domain.Tenant
		db.First(&tenant, "id = ?", farm.TenantID)

		// 3. (Opcional) Verificar si hubo químicos peligrosos en los últimos 30 días
		// Esto sería una query a ApplicationRecord filtrando por FarmID y Fecha.
		// Por ahora, devolvemos "Certificado Verde" hardcodeado para el MVP.

		// 4. Construir la "Historia" (Storytelling JSON)
		passport := gin.H{
			"product_name":  crop.Name,
			"variety":       crop.Variety,
			"origin":        farm.Name,
			"producer":      tenant.Name,
			"harvest_date":  batch.HarvestDate,
			"freshness_hrs": time.Since(batch.HarvestDate).Hours(),
			"location":      farm.Location, // Coordenadas para el mapa
			"certifications": []string{
				"AgriTrust Certified Safety",
				"No Banned Chemicals",
			},
			"journey": []gin.H{
				{"stage": "Cosecha", "date": batch.HarvestDate, "desc": "Recolección manual en campo"},
				{"stage": "Empaque", "date": bin.UpdatedAt, "desc": "Inspección de calidad y enfriamiento"},
				{"stage": "Envío", "date": time.Now(), "desc": "En ruta al centro de distribución"}, // Simulado
			},
		}

		c.JSON(http.StatusOK, passport)
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
			
			// Si el cliente filtra por tenant, aplicamos el filtro
			if tenantID != "" {
				db.Where("tenant_id = ?", tenantID).Find(&farms)
			} else {
				// Si no, traemos todo (aquí podrías filtrar por usuario si quisieras ser estricto)
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
			// ... dentro de POST /applications
			if chem.IsBanned {
				// 1. Obtener datos para el reporte
				var farm domain.Farm
				db.First(&farm, "id = ?", app.FarmID)
				userID := c.GetString("clerk_user_id") // ID del usuario que intentó la acción

				// 2. ENVIAR ALERTA POR CORREO (En segundo plano con goroutine)
				go func() {
					// En un caso real, buscaríamos el email del dueño de la empresa (Tenant Owner)
					// Para este MVP, envía la alerta a TU correo fijo para que veas que funciona
					adminEmail := "marcos@kinetis.org" // <--- CAMBIA ESTO A TU CORREO REAL DONDE QUIERES RECIBIR ALERTAS

					htmlBody := mailer.GetSecurityAlertTemplate(farm.Name, chem.Name, userID)
					mailer.SendEmail([]string{adminEmail}, "⛔ ALERTA CRÍTICA: Bloqueo Fitosanitario", htmlBody)
				}()

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

			// Generar Link (Asegúrate de usar tu URL de producción en Vercel)
			baseURL := "https://agritrust-phi.vercel.app" // Tu Frontend
			inviteLink := fmt.Sprintf("%s/join?token=%s", baseURL, invite.Token)

			// ENVIAR CORREO DE INVITACIÓN
			go func() {
				htmlBody := mailer.GetInviteTemplate(inviteLink, invite.Role)
				mailer.SendEmail([]string{invite.Email}, "Invitación a colaborar en AgriTrust", htmlBody)
			}()

			c.JSON(http.StatusCreated, gin.H{
				"message": "Invitación enviada por correo a " + invite.Email,
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

		// Editar Datos de la Empresa
		adminOnly.PUT("/tenants", func(c *gin.Context) {
			clerkUserID := c.GetString("clerk_user_id")

			// 1. Estructura de lo que se puede editar (DTO)
			type UpdateTenantReq struct {
				Name string `json:"name"`
				RFC  string `json:"rfc"`
			}
			var req UpdateTenantReq
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			// 2. Buscar la empresa del usuario
			var tenant domain.Tenant
			if err := db.Where("owner_id = ?", clerkUserID).First(&tenant).Error; err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Empresa no encontrada"})
				return
			}

			// 3. Actualizar campos
			tenant.Name = req.Name
			tenant.RFC = req.RFC
			// Ojo: No permitimos cambiar el Plan aquí, eso lo hace el webhook de Stripe

			db.Save(&tenant)
			c.JSON(http.StatusOK, tenant)
		})

		// Crear Rancho
		// ACTUALIZACIÓN: CREAR RANCHO con Ownership
		adminOnly.POST("/farms", func(c *gin.Context) {
			var f domain.Farm
			if err := c.ShouldBindJSON(&f); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			// Validar ownership type por defecto
			if f.OwnershipType == "" {
				f.OwnershipType = "own"
			}
			db.Create(&f)
			c.JSON(http.StatusCreated, f)
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

		// ---------------------------------------------------------
		// 📜 GESTIÓN DE ARRENDAMIENTOS (LAND MANAGEMENT)
		// ---------------------------------------------------------

		// Crear Contrato
		adminOnly.POST("/land/contracts", func(c *gin.Context) {
			var contract domain.LeaseContract
			if err := c.ShouldBindJSON(&contract); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			// Validar fechas
			if contract.EndDate.Before(contract.StartDate) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "La fecha fin debe ser posterior al inicio"})
				return
			}

			// Actualizar estatus del Rancho a "rented" automáticamente
			db.Model(&domain.Farm{}).Where("id = ?", contract.FarmID).Update("ownership_type", "rented")

			contract.Status = "active"
			db.Create(&contract)
			c.JSON(http.StatusCreated, contract)
		})

		// Listar Contratos (Con datos del Rancho)
		adminOnly.GET("/land/contracts", func(c *gin.Context) {
			// Filtrar por tenant (sacado del usuario o query param para MVP)
			// Aquí asumimos query param o lógica de tenant
			var contracts []domain.LeaseContract
			db.Preload("Farm").Order("end_date asc").Find(&contracts)
			c.JSON(http.StatusOK, contracts)
		})

		// 🚨 ALERTAS: Contratos por vencer (Próximos 60 días)
		adminOnly.GET("/land/alerts", func(c *gin.Context) {
			var expiring []domain.LeaseContract

			// Fecha límite: Hoy + 60 días
			limitDate := time.Now().AddDate(0, 0, 60)

			db.Preload("Farm").
				Where("status = 'active' AND end_date BETWEEN ? AND ?", time.Now(), limitDate).
				Find(&expiring)

			// Si hay alertas críticas, podríamos disparar emails aquí también
			if len(expiring) > 0 {
				// Lógica opcional de notificación proactiva
			}

			c.JSON(http.StatusOK, expiring)
		})

		// Logística
		adminOnly.POST("/shipments", func(c *gin.Context) {
			// (Simplificado para brevedad, usa la lógica que ya tenías)
			c.JSON(http.StatusNotImplemented, gin.H{"message": "Módulo Logística disponible pronto"})
		})

		// ---------------------------------------------------------
		// GESTIÓN DE RECLAMOS (COMMERCIAL DEFENSE)
		// ---------------------------------------------------------

		// Registrar un Reclamo del Cliente
		adminOnly.POST("/claims", func(c *gin.Context) {
			var claim domain.Claim
			if err := c.ShouldBindJSON(&claim); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			// 1. Validar que el embarque existe
			var shipment domain.Shipment
			if err := db.First(&shipment, "id = ?", claim.ShipmentID).Error; err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "El ID del embarque no es válido"})
				return
			}

			// 2. Regla de Negocio: Actualizar el estatus del embarque a "Disputed"
			db.Model(&shipment).Update("status", "disputed")

			// 3. Guardar el reclamo
			claim.TenantID = shipment.TenantID // Heredar del embarque
			claim.Status = "open"              // Inicia abierto para investigación
			if err := db.Create(&claim).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			// 4. (Futuro) Aquí dispararíamos la IA para analizar la foto de evidencia

			c.JSON(http.StatusCreated, claim)
		})

		// Listar Reclamos (Con datos del embarque)
		adminOnly.GET("/claims", func(c *gin.Context) {
			var claims []domain.Claim
			// Usamos una query cruda o preload si definimos la relación en GORM
			// Para mantenerlo simple y rápido, traemos los claims y en el front cruzamos datos o hacemos un join manual simple aquí
			// Mejor opción rápida: Preload falso o query directa.
			// Asumiremos que el frontend tiene la lista de shipments para cruzar nombres por ahora para no complicar el struct.
			db.Order("created_at desc").Find(&claims)
			c.JSON(http.StatusOK, claims)
		})

		// Endpoint auxiliar: Listar Embarques Enviados (Para el dropdown de selección)
		adminOnly.GET("/shipments", func(c *gin.Context) {
			var shipments []domain.Shipment
			// Solo traemos los que ya se enviaron
			db.Where("status IN ?", []string{"shipped", "delivered", "disputed"}).Order("departure_time desc").Find(&shipments)
			c.JSON(http.StatusOK, shipments)
		})

		// 1. TEMPORADAS (Seasons)
		// Crear Temporada (Ej: "Tomate 2025")
		adminOnly.POST("/finance/seasons", func(c *gin.Context) {
			var season domain.Season
			if err := c.ShouldBindJSON(&season); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			// (Aquí podrías validar que el TenantID pertenezca al usuario, para MVP confiamos en el ID enviado)
			db.Create(&season)
			c.JSON(http.StatusCreated, season)
		})

		// Listar Temporadas
		adminOnly.GET("/finance/seasons", func(c *gin.Context) {
			tenantID := c.Query("tenant_id") // Filtrar por empresa
			var seasons []domain.Season
			db.Where("tenant_id = ?", tenantID).Order("start_date desc").Find(&seasons)
			c.JSON(http.StatusOK, seasons)
		})

		// 2. CATEGORÍAS DE COSTOS (Plan de Cuentas)
		// Crear Categoría (Ej: "Fertilizantes")
		adminOnly.POST("/finance/categories", func(c *gin.Context) {
			var cat domain.CostCategory
			if err := c.ShouldBindJSON(&cat); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			db.Create(&cat)
			c.JSON(http.StatusCreated, cat)
		})

		// Listar Categorías
		adminOnly.GET("/finance/categories", func(c *gin.Context) {
			tenantID := c.Query("tenant_id")
			var cats []domain.CostCategory
			// Traemos solo las categorías "Padre" (las que no tienen ParentID) y pre-cargamos sus hijos
			db.Where("tenant_id = ? AND parent_id IS NULL", tenantID).Preload("Children").Find(&cats)
			c.JSON(http.StatusOK, cats)
		})

		// 3. PRESUPUESTOS (Budgets)
		// Asignar Presupuesto (Crear o Actualizar)
		adminOnly.POST("/finance/budgets", func(c *gin.Context) {
			var req domain.Budget
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			// Lógica "Upsert": Si ya existe presupuesto para ese (Rancho+Categoria+Mes+Año), actualízalo. Si no, créalo.
			var existing domain.Budget
			result := db.Where("season_id = ? AND farm_id = ? AND cost_category_id = ? AND month = ? AND year = ?",
				req.SeasonID, req.FarmID, req.CostCategoryID, req.Month, req.Year).First(&existing)

			if result.Error == nil {
				// Ya existe -> Actualizamos monto
				existing.Amount = req.Amount
				db.Save(&existing)
				c.JSON(http.StatusOK, existing)
			} else {
				// No existe -> Creamos nuevo
				db.Create(&req)
				c.JSON(http.StatusCreated, req)
			}
		})

		// Obtener Presupuestos (Por temporada y rancho)
		adminOnly.GET("/finance/budgets", func(c *gin.Context) {
			seasonID := c.Query("season_id")
			farmID := c.Query("farm_id")

			var budgets []domain.Budget
			db.Where("season_id = ? AND farm_id = ?", seasonID, farmID).Preload("CostCategory").Find(&budgets)
			c.JSON(http.StatusOK, budgets)
		})

		// 4. GASTOS REALES (Expenses)
		// Registrar Gasto (Ej: Factura de Fertilizante)
		adminOnly.POST("/finance/expenses", func(c *gin.Context) {
			var expense domain.Expense
			if err := c.ShouldBindJSON(&expense); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			expense.ExpenseDate = time.Now() // O usar la fecha que venga en el JSON si se envía
			db.Create(&expense)
			c.JSON(http.StatusCreated, expense)
		})

		// Reporte: Comparativa Presupuesto vs Gasto (El cerebro del módulo)
		adminOnly.GET("/finance/report/variance", func(c *gin.Context) {
			seasonID := c.Query("season_id")
			farmID := c.Query("farm_id")

			type ReportRow struct {
				CategoryName string  `json:"category_name"`
				Budgeted     float64 `json:"budgeted"`
				Spent        float64 `json:"spent"`
				Variance     float64 `json:"variance"` // Presupuesto - Gasto
			}

			// Esta es una query más compleja. Para el MVP, haremos dos queries simples y las uniremos en memoria.
			// 1. Sumar Presupuestos por Categoría
			type BudgetSum struct {
				CostCategoryID uuid.UUID
				Total          float64
			}
			var bSums []BudgetSum
			db.Model(&domain.Budget{}).
				Where("season_id = ? AND farm_id = ?", seasonID, farmID).
				Select("cost_category_id, SUM(amount) as total").
				Group("cost_category_id").Scan(&bSums)

			// 2. Sumar Gastos por Categoría
			type ExpenseSum struct {
				CostCategoryID uuid.UUID
				Total          float64
			}
			var eSums []ExpenseSum
			db.Model(&domain.Expense{}).
				Where("season_id = ? AND farm_id = ?", seasonID, farmID).
				Select("cost_category_id, SUM(amount) as total").
				Group("cost_category_id").Scan(&eSums)

			// 3. Unir y Formatear
			// (Simplificado: Devolvemos raw para que el frontend lo procese o iteramos aquí)
			// Para rapidez, enviamos las dos listas y que React haga el match visual.
			c.JSON(http.StatusOK, gin.H{
				"budget_totals":  bSums,
				"expense_totals": eSums,
			})
		})
	}

	// ---------------------------------------------------------
	// ARRANQUE DEL SERVIDOR
	// ---------------------------------------------------------
	fmt.Println("🚀 AgriTrust Backend Seguro corriendo en puerto 8080")
	r.Run(":8080")
}
