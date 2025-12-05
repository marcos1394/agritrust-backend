"use client"; // Importante: convertimos el layout en cliente para usar hooks

import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link"; // Usamos Link para navegación optimizada
import { usePathname } from "next/navigation";
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
  PieChart,
  Package,
  Menu,
  X,
  ShoppingCart
} from "lucide-react";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

// Componente Protector: Solo renderiza a los hijos si eres ADMIN
// Si eres 'operator', te muestra la pantalla de bloqueo.
function AdminProtector({ children }: { children: React.ReactNode }) {
  const { role, loading, isAdmin } = useUserRole();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600 font-medium">Validando permisos...</p>
        </div>
      </div>
    );
  }

  // SI NO ES ADMIN -> BLOQUEO TOTAL (Para operadores que intentan entrar a la web)
  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-8 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md border border-slate-200">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <AlertTriangle size={32} strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Acceso Restringido</h1>
            <p className="text-slate-600 mb-6 text-base leading-relaxed">
                Tu usuario tiene rol de <strong className="text-slate-900 font-semibold uppercase">{role}</strong>. 
                <br/><br/>
                Esta plataforma Web es exclusiva para Administradores y Gerencia.
            </p>
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 p-4 rounded-lg">
              <p className="text-sm text-slate-700">
                📱 Por favor, utiliza la <strong>App Móvil</strong> para tus tareas de campo.
              </p>
            </div>
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <ClerkProvider>
      <html lang="es">
        <body className={inter.className}>
          
          {/* ESCENARIO A: USUARIO NO LOGUEADO (Público) */}
          <SignedOut>
             {children}
          </SignedOut>

          {/* ESCENARIO B: USUARIO LOGUEADO (Privado) */}
          <SignedIn>
            <AdminProtector>
              <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                
                {/* SIDEBAR DE NAVEGACIÓN - MEJORADO */}
                <aside className={`
                  ${sidebarOpen ? 'w-72' : 'w-20'} 
                  bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
                  text-white 
                  hidden md:flex flex-col 
                  transition-all duration-300 ease-out
                  shadow-2xl
                  border-r border-slate-700/30
                `}>
                  
                  {/* HEADER DEL SIDEBAR */}
                  <div className={`p-6 border-b border-slate-700/30 transition-all duration-300`}>
                    <div className="flex items-center justify-between">
                      <div className={sidebarOpen ? 'block' : 'hidden'}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center font-bold text-sm">
                            AT
                          </div>
                          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
                            AgriTrust
                          </h1>
                        </div>
                        <p className="text-xs text-slate-400 ml-12">Enterprise Edition</p>
                      </div>
                      <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                      >
                        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* MENÚ DE NAVEGACIÓN */}
                  <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    
                    {/* DASHBOARD */}
                    <NavLink 
                      href="/" 
                      icon={<LayoutDashboard size={20} />} 
                      label="Dashboard"
                      isActive={isActive('/')}
                      sidebarOpen={sidebarOpen}
                    />
                    
                    {/* OPERACIONES */}
                    <div className={`${sidebarOpen ? 'block' : 'hidden'} pt-4`}>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-3">Operaciones</p>
                    </div>

                    <NavLink 
                      href="/farms" 
                      icon={<MapIcon size={20} />} 
                      label="Mis Ranchos"
                      isActive={isActive('/farms')}
                      sidebarOpen={sidebarOpen}
                    />

                    <NavLink 
                      href="/harvest" 
                      icon={<Leaf size={20} />} 
                      label="Cosecha"
                      isActive={isActive('/harvest')}
                      sidebarOpen={sidebarOpen}
                    />

                    <NavLink 
                      href="/inventory" 
                      icon={<Package size={20} />} 
                      label="Almacén"
                      isActive={isActive('/inventory')}
                      sidebarOpen={sidebarOpen}
                    />

                    <NavLink
                    href="/procurement"
                      icon={<ShoppingCart size={20} />} 
                      label="Compras"
                      isActive={isActive('/procurement')}
                      sidebarOpen={sidebarOpen}
                    />

                    {/* COMPLIANCE Y SEGURIDAD */}
                    <div className={`${sidebarOpen ? 'block' : 'hidden'} pt-4`}>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-3">Compliance</p>
                    </div>

                    <NavLink 
                      href="/compliance" 
                      icon={<AlertTriangle size={20} />} 
                      label="Compliance"
                      isActive={isActive('/compliance')}
                      sidebarOpen={sidebarOpen}
                    />

                    <NavLink 
                      href="/claims" 
                      icon={<ShieldAlert size={20} />} 
                      label="Reclamos"
                      isActive={isActive('/claims')}
                      sidebarOpen={sidebarOpen}
                    />

                    {/* CADENA DE SUMINISTRO */}
                    <div className={`${sidebarOpen ? 'block' : 'hidden'} pt-4`}>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-3">Cadena</p>
                    </div>

                    <NavLink 
                      href="/shipments" 
                      icon={<Truck size={20} />} 
                      label="Logística"
                      isActive={isActive('/shipments')}
                      sidebarOpen={sidebarOpen}
                    />

                    {/* GESTIÓN */}
                    <div className={`${sidebarOpen ? 'block' : 'hidden'} pt-4`}>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-3">Gestión</p>
                    </div>

                    <NavLink 
                      href="/finance" 
                      icon={<PieChart size={20} />} 
                      label="Finanzas"
                      isActive={isActive('/finance')}
                      sidebarOpen={sidebarOpen}
                    />

                    <NavLink 
                      href="/team" 
                      icon={<Users size={20} />} 
                      label="Equipo"
                      isActive={isActive('/team')}
                      sidebarOpen={sidebarOpen}
                    />

                    <NavLink 
                      href="/tools" 
                      icon={<Printer size={20} />} 
                      label="Herramientas"
                      isActive={isActive('/tools')}
                      sidebarOpen={sidebarOpen}
                    />
                  </nav>

                  {/* PERFIL DE USUARIO */}
                  <div className={`p-4 border-t border-slate-700/30 bg-slate-900/50 backdrop-blur-sm ${sidebarOpen ? '' : 'flex justify-center'}`}>
                    {sidebarOpen ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <UserButton 
                            showName={true} 
                            appearance={{
                              elements: {
                                userButtonBox: 'flex-col items-start',
                                userButtonTrigger: 'focus:shadow-none'
                              }
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <UserButton />
                    )}
                  </div>

                  {/* SETTINGS AL FINAL */}
                  <div className="p-4 border-t border-slate-700/30">
                    <NavLink 
                      href="/settings" 
                      icon={<Settings size={20} />} 
                      label="Configuración"
                      isActive={isActive('/settings')}
                      sidebarOpen={sidebarOpen}
                    />
                  </div>
                </aside>

                {/* CONTENIDO PRINCIPAL */}
                <main className="flex-1 overflow-y-auto">
                  <div className="min-h-screen">
                    {children}
                  </div>
                </main>
              </div>
            </AdminProtector>
          </SignedIn>

        </body>
      </html>
    </ClerkProvider>
  );
}

// COMPONENTE AUXILIAR: Link de Navegación Mejorado
function NavLink({ 
  href, 
  icon, 
  label, 
  isActive,
  sidebarOpen 
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  isActive: boolean;
  sidebarOpen: boolean;
}) {
  return (
    <Link href={href}>
      <div className={`
        flex items-center gap-3 px-4 py-3 
        rounded-xl transition-all duration-200 ease-out
        ${isActive 
          ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30 font-semibold' 
          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
        }
        ${!sidebarOpen ? 'justify-center' : ''}
      `}>
        <span className="flex-shrink-0">{icon}</span>
        {sidebarOpen && <span className="text-sm font-medium truncate">{label}</span>}
      </div>
    </Link>
  );
}