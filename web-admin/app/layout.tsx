"use client"; // Importante: convertimos el layout en cliente para usar hooks

import { Inter } from "next/font/google";
import "./globals.css";
import { 
  ClerkProvider, 
  SignInButton, 
  SignedIn, 
  SignedOut, 
  UserButton 
} from '@clerk/nextjs';
import { useUserRole } from "../lib/useUserRole"; // <--- Hook Nuevo
import { LayoutDashboard, Leaf, Truck, AlertTriangle, Map as MapIcon } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

// Componente Protector: Solo renderiza a los hijos si eres ADMIN
function AdminProtector({ children }: { children: React.ReactNode }) {
  const { role, loading, isAdmin } = useUserRole();

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Cargando permisos...</div>;
  }

  // SI NO ES ADMIN -> BLOQUEO TOTAL
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
          
          {/* 1. SI NO ESTÁ LOGUEADO -> PANTALLA DE LOGIN */}
          <SignedOut>
            <div className="flex h-screen w-screen items-center justify-center bg-gray-100 flex-col gap-6">
              <h1 className="text-3xl font-bold text-slate-800">Bienvenido a AgriTrust</h1>
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <p className="mb-4 text-gray-500">Inicia sesión para acceder al panel</p>
                <SignInButton mode="modal">
                  <button className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition">
                    Entrar al Sistema
                  </button>
                </SignInButton>
              </div>
            </div>
          </SignedOut>

          {/* 2. SI ESTÁ LOGUEADO -> VERIFICAMOS ROL */}
          <SignedIn>
            <AdminProtector>
              <div className="flex h-screen bg-gray-100">
                
                {/* SIDEBAR */}
                <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-green-400">AgriTrust</h1>
                    <p className="text-xs text-gray-400">Enterprise Edition</p>
                  </div>
                  
                  <nav className="flex-1 px-4 space-y-2">
                    <a href="/" className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-lg text-white">
                      <LayoutDashboard size={20} /> Dashboard
                    </a>
                    <a href="/farms" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition">
                      <MapIcon size={20} /> Mis Ranchos
                    </a>
                    <a href="/harvest" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition">
                      <Leaf size={20} /> Cosecha
                    </a>
                    <a href="/compliance" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition">
                      <AlertTriangle size={20} /> Compliance
                    </a>
                  </nav>

                  <div className="p-4 border-t border-slate-800 flex items-center gap-3">
                    <UserButton showName={true} />
                    <div className="flex flex-col">
                       <span className="text-xs font-bold text-white">Mi Cuenta</span>
                       <span className="text-[10px] text-gray-400">Administrador</span>
                    </div>
                  </div>
                </aside>

                {/* CONTENIDO PRINCIPAL */}
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