"use client"; // Importante: convertimos el layout en cliente para usar hooks

import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link"; // Usamos Link para navegación optimizada
import { 
  ClerkProvider, 
  SignedIn, 
  SignedOut, 
  UserButton 
} from '@clerk/nextjs';
import { useUserRole } from "../lib/useUserRole"; 
import { 
  LayoutDashboard, 
  Leaf, 
  Truck, 
  AlertTriangle, 
  Map as MapIcon, 
  Users, 
  ShieldAlert, 
  Printer, 
  Settings, 
  PieChart
} from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

// Componente Protector: Solo renderiza a los hijos si eres ADMIN
// Si eres 'operator', te muestra la pantalla de bloqueo.
function AdminProtector({ children }: { children: React.ReactNode }) {
  const { role, loading, isAdmin } = useUserRole();

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-slate-500">Cargando permisos...</div>;
  }

  // SI NO ES ADMIN -> BLOQUEO TOTAL (Para operadores que intentan entrar a la web)
  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md border border-red-100">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Restringido</h1>
            <p className="text-slate-600 mb-6 text-lg">
                Tu usuario tiene rol de <strong className="text-slate-900 uppercase">{role}</strong>. 
                <br/><br/>
                Esta plataforma Web es exclusiva para Administradores y Gerencia.
            </p>
            <p className="text-sm text-slate-400 bg-slate-100 p-3 rounded-lg">
                💡 Por favor, utiliza la <strong>App Móvil</strong> para tus tareas de campo.
            </p>
        </div>
      </div>
    );
  }

  // SI ES ADMIN -> PASE USTED
  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className={inter.className}>
          
          {/* ESCENARIO A: USUARIO NO LOGUEADO (Público) */}
          {/* Aquí mostramos 'children' directamente, que renderizará la Landing Page definida en page.tsx */}
          <SignedOut>
             {children}
          </SignedOut>

          {/* ESCENARIO B: USUARIO LOGUEADO (Privado) */}
          {/* Aquí mostramos el Layout con Sidebar y protegemos con AdminProtector */}
          <SignedIn>
            <AdminProtector>
              <div className="flex h-screen bg-gray-100">
                
                {/* SIDEBAR DE NAVEGACIÓN */}
                <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-green-400">AgriTrust</h1>
                    <p className="text-xs text-gray-400">Enterprise Edition</p>
                  </div>
                  
                  <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-4">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-lg text-white hover:bg-slate-700 transition">
                      <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link href="/farms" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition">
                      <MapIcon size={20} /> Mis Ranchos
                    </Link>
                    <Link href="/harvest" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition">
                      <Leaf size={20} /> Cosecha
                    </Link>
                    <Link href="/compliance" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition">
                      <AlertTriangle size={20} /> Compliance
                    </Link>
                    <Link href="/team" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition">
                      <Users size={20} /> Equipo
                    </Link>
                    <Link href="/shipments" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition">
                      <Truck size={20} /> Logística
                    </Link>
                    <Link href="/claims" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition">
                      <ShieldAlert size={20} /> Reclamos
                    </Link>
                    <Link href="/tools" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition">
                      <Printer size={20} /> Herramientas
                    </Link>
                    <Link href="/finance" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition">
  <PieChart size={20} /> Finanzas
</Link>
                    
                    <div className="pt-4 mt-auto">
                        <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition">
                        <Settings size={20} /> Configuración
                        </Link>
                    </div>
                  </nav>

                  {/* PERFIL DE USUARIO */}
                  <div className="p-4 border-t border-slate-800 flex items-center gap-3 bg-slate-900">
                    <UserButton showName={true} />
                    <div className="flex flex-col">
                       <span className="text-xs font-bold text-white">Mi Cuenta</span>
                       <span className="text-[10px] text-gray-400">Administrador</span>
                    </div>
                  </div>
                </aside>

                {/* CONTENIDO PRINCIPAL (Dashboard) */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                  {children}
                </main>
              </div>
            </AdminProtector>
          </SignedIn>

        </body>
      </html>
    </ClerkProvider>
  );
}