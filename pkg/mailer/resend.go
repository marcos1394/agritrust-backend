package mailer

import (
	"fmt"
	"os"

	"github.com/resend/resend-go/v2"
)

// SendEmail envía un correo HTML
func SendEmail(to []string, subject string, htmlContent string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		// Modo Local sin API Key: Solo imprimimos en consola
		fmt.Println("⚠️ [MAILER SIMULADO] Faltan credenciales RESEND_API_KEY")
		fmt.Printf("TO: %v\nSUBJECT: %s\n", to, subject)
		return nil
	}

	client := resend.NewClient(apiKey)

	params := &resend.SendEmailRequest{
		// 👇 AQUÍ USAMOS TU DOMINIO OFICIAL
		From:    "AgriTrust <notificaciones@kinetis.org>", 
		To:      to,
		Subject: subject,
		Html:    htmlContent,
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		fmt.Println("❌ Error enviando correo:", err)
		return err
	}

	fmt.Println("✅ Correo enviado con éxito. ID:", sent.Id)
	return nil
}

// --- PLANTILLAS HTML (Templates) ---

// 1. Plantilla para Alerta de Seguridad (Intento de uso de químico prohibido)
func GetSecurityAlertTemplate(farmName, chemicalName, user string) string {
	return fmt.Sprintf(`
		<div style="font-family: sans-serif; padding: 20px; border: 1px solid #fee2e2; border-radius: 8px; background-color: #fffaf9;">
			<h2 style="color: #b91c1c; margin-top: 0;">🚨 ALERTA DE SEGURIDAD FITOSANITARIA</h2>
			<p style="color: #454545;">El sistema AgriTrust ha bloqueado automáticamente una operación de alto riesgo en campo.</p>
			<ul style="color: #454545;">
				<li><strong>Rancho:</strong> %s</li>
				<li><strong>Usuario Responsable:</strong> %s</li>
				<li><strong>Incidente:</strong> Intento de aplicar producto boletinado</li>
				<li><strong>Producto Bloqueado:</strong> <span style="color: #d32f2f; font-weight: bold;">%s</span></li>
			</ul>
			<div style="padding: 10px; background-color: #fee2e2; color: #991b1b; border-radius: 4px; font-size: 14px;">
				<strong>Acción Automática:</strong> La operación fue denegada en el dispositivo móvil.
			</div>
			<hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
			<p style="font-size: 12px; color: #888;">AgriTrust Security System • kinetis.org</p>
		</div>
	`, farmName, user, chemicalName)
}

// 2. Plantilla para Invitación de Equipo
func GetInviteTemplate(link string, role string) string {
	roleName := "Operador de Campo"
	if role == "admin" {
		roleName = "Administrador del Sistema"
	}

	return fmt.Sprintf(`
		<div style="font-family: sans-serif; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px;">
			<h2 style="color: #0f172a; margin-top: 0;">Bienvenido al equipo AgriTrust</h2>
			<p style="color: #374151;">Has sido invitado a colaborar en la plataforma como <strong>%s</strong>.</p>
			<p style="color: #374151;">Para activar tu acceso, haz clic en el siguiente botón:</p>
			<br>
			<a href="%s" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Aceptar Invitación</a>
			<br><br>
			<p style="font-size: 12px; color: #9ca3af;">Si el botón no funciona, copia este enlace: %s</p>
		</div>
	`, roleName, link, link)
}