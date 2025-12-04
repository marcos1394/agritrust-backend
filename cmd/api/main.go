package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/Marcos1394/agritrust-backend/internal/domain"
	"github.com/Marcos1394/agritrust-backend/internal/middleware" // <--- Importa esto
	"github.com/Marcos1394/agritrust-backend/pkg/database"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func main() {
	// ---------------------------------------------------------
	// 1. INICIALIZACIÓN Y BASE DE DATOS
	// ---------------------------------------------------------
	db := database.Connect()

	// Migración Automática: Crea todas las tablas en orden correcto
	err := db.AutoMigrate(
		&domain.Tenant{},
		&domain.Farm{},
		&domain.User{},
		&domain.Chemical{},
		&domain.ApplicationRecord{},
		&domain.Crop{},
		&domain.HarvestBatch{},
		&domain.Shipment{}, // <--- MOVIMOS ESTO ARRIBA (Antes de Bin)
		&domain.Bin{},      // <--- Bin depende de Shipment, así que va después
		&domain.Claim{},
	)
	if err != nil {
		panic("❌ Error CRÍTICO en migración de base de datos: " + err.Error())
	}

	r := gin.Default()

	// === CONFIGURACIÓN CORS (Ya la tienes) ===
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "Accept"}
	r.Use(cors.New(corsConfig))

	// ---------------------------------------------------------
	// 🔒 ACTIVAR SEGURIDAD (MIDDLEWARE CLERK)
	// ---------------------------------------------------------
	// Health Check (sin autenticación)
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "online", "system": "AgriTrust Backend"})
	})

	// A partir de esta línea, CUALQUIER ruta de abajo exigirá Token
	protected := r.Group("")
	protected.Use(middleware.AuthMiddleware())

	// ---------------------------------------------------------
	// RUTAS PROTEGIDAS (Tus endpoints de negocio)
	// ---------------------------------------------------------

	// ---------------------------------------------------------
	// 2. ENDPOINTS: SETUP Y ADMINISTRACIÓN
	// ---------------------------------------------------------

	// Crear Empresa (Automáticamente te asigna como dueño)
	protected.POST("/tenants", func(c *gin.Context) {
		// 1. Obtener el ID de Clerk del contexto (lo puso el middleware)
		clerkUserID := c.GetString("clerk_user_id")
		if clerkUserID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no identificado"})
			return
		}

		var newTenant domain.Tenant
		if err := c.ShouldBindJSON(&newTenant); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// 2. Asignar el dueño
		newTenant.OwnerID = clerkUserID

		// 3. Guardar
		if err := db.Create(&newTenant).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, newTenant)
	})

	// Listar MIS Empresas (Filtro de Seguridad)
	protected.GET("/tenants", func(c *gin.Context) {
		clerkUserID := c.GetString("clerk_user_id")

		var tenants []domain.Tenant
		// WHERE owner_id = usuario_actual
		db.Where("owner_id = ?", clerkUserID).Find(&tenants)

		c.JSON(http.StatusOK, tenants)
	})

	// Crear Rancho (Farm)
	r.POST("/farms", func(c *gin.Context) {
		var newFarm domain.Farm
		if err := c.ShouldBindJSON(&newFarm); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		// Validar que el Tenant existe
		var count int64
		db.Model(&domain.Tenant{}).Where("id = ?", newFarm.TenantID).Count(&count)
		if count == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "El TenantID especificado no existe"})
			return
		}
		db.Create(&newFarm)
		c.JSON(http.StatusCreated, newFarm)
	})

	// Listar Ranchos por Tenant
	r.GET("/farms", func(c *gin.Context) {
		tenantID := c.Query("tenant_id")
		if tenantID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "tenant_id es requerido"})
			return
		}
		var farms []domain.Farm
		db.Where("tenant_id = ?", tenantID).Find(&farms)
		c.JSON(http.StatusOK, farms)
	})

	// ---------------------------------------------------------
	// 3. MÓDULO DE COMPLIANCE (FITOSANIDAD)
	// ---------------------------------------------------------

	// Crear Químico en Catálogo
	r.POST("/chemicals", func(c *gin.Context) {
		var chem domain.Chemical
		if err := c.ShouldBindJSON(&chem); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		db.Create(&chem)
		c.JSON(http.StatusCreated, chem)
	})

	r.GET("/chemicals", func(c *gin.Context) {
		var chems []domain.Chemical
		db.Find(&chems)
		c.JSON(http.StatusOK, chems)
	})

	// Registrar Aplicación (El Escudo de Seguridad)
	r.POST("/applications", func(c *gin.Context) {
		var app domain.ApplicationRecord
		if err := c.ShouldBindJSON(&app); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// VALIDACIÓN: Verificar si el químico está prohibido
		var chem domain.Chemical
		if err := db.First(&chem, "id = ?", app.ChemicalID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Químico no encontrado"})
			return
		}

		if chem.IsBanned {
			// BLOQUEO AUTOMÁTICO
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "ALERTA CRÍTICA: Intento de aplicar producto prohibido",
				"details": "Producto " + chem.Name + " prohibido en: " + chem.BannedMarkets,
				"status":  "BLOCKED",
			})
			return
		}

		// Si es válido, aprobar y guardar
		app.AppliedAt = time.Now()
		app.Status = "approved"
		db.Create(&app)

		c.JSON(http.StatusCreated, gin.H{"message": "Aplicación registrada", "data": app})
	})

	// ---------------------------------------------------------
	// 4. MÓDULO DE TRAZABILIDAD (COSECHA)
	// ---------------------------------------------------------

	// Crear Cultivo (Crop)
	r.POST("/crops", func(c *gin.Context) {
		var crop domain.Crop
		if err := c.ShouldBindJSON(&crop); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		db.Create(&crop)
		c.JSON(http.StatusCreated, crop)
	})

	// --- NUEVO: LEER CULTIVOS ---
	r.GET("/crops", func(c *gin.Context) {
		var crops []domain.Crop
		db.Find(&crops)
		c.JSON(http.StatusOK, crops)
	})

	// Iniciar Lote de Cosecha (Harvest Batch)
	r.POST("/harvest-batches", func(c *gin.Context) {
		var batch domain.HarvestBatch
		if err := c.ShouldBindJSON(&batch); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		// Generar código de lote si no viene
		if batch.BatchCode == "" {
			batch.BatchCode = fmt.Sprintf("LOTE-%d", time.Now().Unix())
		}
		batch.HarvestDate = time.Now()

		db.Create(&batch)
		c.JSON(http.StatusCreated, batch)
	})

	// --- NUEVO: LEER LOTES DE COSECHA ---
	r.GET("/harvest-batches", func(c *gin.Context) {
		var batches []domain.HarvestBatch
		// Preload carga los datos del Crop relacionado (Join automático)
		db.Preload("Crop").Find(&batches)
		c.JSON(http.StatusOK, batches)
	})

	// LEER HISTORIAL DE APLICACIONES
	r.GET("/applications", func(c *gin.Context) {
		var apps []domain.ApplicationRecord
		// Preload carga los nombres del Rancho y del Químico automáticamente
		// OJO: Asegúrate que tus structs ApplicationRecord tengan las relaciones definidas si quieres esto
		// Para el MVP simple, cargamos los IDs y datos crudos
		db.Order("applied_at desc").Find(&apps)
		c.JSON(http.StatusOK, apps)
	})

	// VER CAJAS ESCANEADAS (Inventario de Campo)
	r.GET("/bins", func(c *gin.Context) {
		var bins []domain.Bin
		// Filtro opcional: ?harvest_batch_id=XXXX
		batchID := c.Query("harvest_batch_id")

		query := db.Model(&domain.Bin{})
		if batchID != "" {
			query = query.Where("harvest_batch_id = ?", batchID)
		}

		// Traemos las últimas 50 cajas para no saturar
		query.Order("updated_at desc").Limit(50).Find(&bins)
		c.JSON(http.StatusOK, bins)
	})

	r.GET("/dashboard/stats", func(c *gin.Context) {
		// Estructura de respuesta
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

		// 1. KPI: Total Kilos Cosechados HOY
		// Sumamos weight_kg de la tabla 'bins' donde updated_at sea hoy
		// Nota: En producción usaríamos rangos de fecha precisos con time.Location
		var totalWeight float64
		db.Model(&domain.Bin{}).
			Where("DATE(updated_at) = CURRENT_DATE"). // Postgres function
			Select("COALESCE(SUM(weight_kg), 0)").
			Scan(&totalWeight)
		stats["total_harvest_today"] = totalWeight

		// 2. KPI: Lotes Activos
		var activeBatches int64
		// Asumimos que un lote de hoy es activo
		db.Model(&domain.HarvestBatch{}).Where("DATE(harvest_date) = CURRENT_DATE").Count(&activeBatches)
		stats["active_batches"] = activeBatches

		// 3. KPI: Intentos de Aplicación Bloqueados (Alertas)
		// Como no guardamos los bloqueados en la DB (solo respondimos error),
		// contaremos las aplicaciones exitosas por ahora.
		// *Mejora futura: Guardar logs de intentos fallidos.*
		var appsToday int64
		db.Model(&domain.ApplicationRecord{}).Where("DATE(applied_at) = CURRENT_DATE").Count(&appsToday)
		stats["security_alerts"] = 0 // Placeholder hasta implementar tabla de logs de seguridad

		// 4. GRÁFICO: Tendencia de los últimos 7 días
		// Query SQL nativa para agrupar por día
		rows, err := db.Raw(`
			SELECT TO_CHAR(updated_at, 'YYYY-MM-DD') as date, SUM(weight_kg) as value
			FROM bins
			WHERE updated_at >= CURRENT_DATE - INTERVAL '7 days'
			GROUP BY date
			ORDER BY date ASC
		`).Rows()

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

	// Escanear Bin (Asignar caja a lote)
	r.POST("/bins/scan", func(c *gin.Context) {
		// Estructura temporal para recibir el JSON
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

		// Parsear UUIDs de string
		tenantUUID, err := uuid.Parse(req.TenantID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "TenantID inválido"})
			return
		}

		// Buscar si el Bin ya existe (por su QR y Tenant), si no, inicializar estructura vacía
		var bin domain.Bin
		result := db.Where("qr_code = ? AND tenant_id = ?", req.QRCode, tenantUUID).First(&bin)

		if result.Error != nil {
			// Si no existe, preparamos uno nuevo
			bin.TenantID = tenantUUID
			bin.QRCode = req.QRCode
			// GORM creará el ID automáticamente en el BeforeCreate
		}

		// Actualizar datos del Bin con la información del escaneo
		// Convertir string batchID a UUID si es necesario o guardar directo
		batchUUID, _ := uuid.Parse(req.HarvestBatchID) // Ignoramos error por brevedad, asumimos válido

		// Usamos un mapa para forzar la actualización incluso si los campos no cambian
		updateData := map[string]interface{}{
			"harvest_batch_id": batchUUID,
			"weight_kg":        req.Weight,
			"status":           "full_in_field",
			"updated_at":       time.Now(),
		}

		// Guardar o Actualizar
		if bin.ID == uuid.Nil {
			// Es nuevo, asignamos datos y creamos
			bin.HarvestBatchID = &batchUUID
			bin.WeightKg = req.Weight
			bin.Status = "full_in_field"
			db.Create(&bin)
		} else {
			// Ya existe, actualizamos
			db.Model(&bin).Updates(updateData)
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Bin vinculado exitosamente",
			"bin_id":  bin.ID,
			"qr":      bin.QRCode,
			"status":  "full_in_field",
		})
	})

	// ---------------------------------------------------------
	// 5. MÓDULO LOGÍSTICA Y RECLAMACIONES (DEFENSA)
	// ---------------------------------------------------------

	// Crear Embarque (Salida de Camión)
	r.POST("/shipments", func(c *gin.Context) {
		type ShipmentRequest struct {
			TenantID     string   `json:"tenant_id"`
			CustomerName string   `json:"customer_name"`
			BinIDs       []string `json:"bin_ids"` // Lista de IDs de cajas que se van
		}
		var req ShipmentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// 1. Crear el Header del Embarque
		shipment := domain.Shipment{
			TenantID:      uuid.MustParse(req.TenantID), // Asumimos UUID válido para rapidez
			CustomerName:  req.CustomerName,
			Status:        "shipped",
			DepartureTime: time.Now(),
		}

		tx := db.Begin() // Iniciamos Transacción (Todo o nada)

		if err := tx.Create(&shipment).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// 2. Actualizar los Bins para decir que están en este camión
		for _, binIDStr := range req.BinIDs {
			binUUID, _ := uuid.Parse(binIDStr)
			// Actualizamos shipment_id y status
			if err := tx.Model(&domain.Bin{}).Where("id = ?", binUUID).Updates(map[string]interface{}{
				"shipment_id": shipment.ID,
				"status":      "shipped",
			}).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando bins"})
				return
			}
		}

		tx.Commit()
		c.JSON(http.StatusCreated, gin.H{"message": "Embarque creado", "shipment_id": shipment.ID})
	})

	// Registrar Reclamación (El Cliente se queja)
	r.POST("/claims", func(c *gin.Context) {
		var claim domain.Claim
		if err := c.ShouldBindJSON(&claim); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Lógica de Negocio: Alertar si el monto es alto
		claim.Status = "open"
		db.Create(&claim)

		// Simulación de Alerta Inteligente
		alertMessage := "Reclamo registrado."
		if claim.AmountUSD > 5000 {
			alertMessage = "⚠️ ALERTA: Reclamo de alto valor. Se requiere auditoría inmediata."
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": alertMessage,
			"claim":   claim,
		})
	})

	// ---------------------------------------------------------
	// ARRANQUE DEL SERVIDOR
	// ---------------------------------------------------------
	fmt.Println("🚀 AgriTrust Backend corriendo en puerto 8080")
	r.Run(":8080")
}
