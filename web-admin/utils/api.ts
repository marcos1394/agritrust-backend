// web-admin/lib/api.ts
// Si existe la variable de entorno, úsala. Si no, usa localhost (para dev local)
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";