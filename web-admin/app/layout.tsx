import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Importaciones de Clerk según la documentación nueva
import { 
  ClerkProvider, 
  SignInButton, 
  SignedIn, 
  SignedOut, 
  UserButton 
} from '@clerk/nextjs';

// Iconos para tu Sidebar
import { LayoutDashboard, Leaf, Truck, AlertTriangle } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgriTrust Admin",
  description: "SaaS Agrícola de Clase Mundial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className={inter.className}>
          
          {/* ESTADO 1: NO LOGUEADO (Muestra pantalla de login centrada) */}
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

          {/* ESTADO 2: LOGUEADO (Muestra tu Dashboard completo) */}
          <SignedIn>
            <div className="flex h-screen bg-gray-100">
              {/* TU SIDEBAR ORIGINAL */}
              <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-green-400">AgriTrust</h1>
                  <p className="text-xs text-gray-400">Enterprise Edition</p>
                </div>
                
                <nav className="flex-1 px-4 space-y-2">
                  <a href="/" className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-lg text-white">
                    <LayoutDashboard size={20} /> Dashboard
                  </a>
                  <a href="/harvest" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition">
                    <Leaf size={20} /> Cosecha
                  </a>
                  <a href="/compliance" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition">
                    <AlertTriangle size={20} /> Compliance
                  </a>
                </nav>

                {/* BOTÓN DE USUARIO DE CLERK (Abajo a la izquierda) */}
                <div className="p-4 border-t border-slate-800 flex items-center gap-3">
                  <UserButton showName={true} />
                  <div className="flex flex-col">
                     <span className="text-xs font-bold text-white">Mi Cuenta</span>
                     <span className="text-[10px] text-gray-400">Admin</span>
                  </div>
                </div>
              </aside>

              {/* CONTENIDO PRINCIPAL */}
              <main className="flex-1 overflow-y-auto bg-gray-50">
                {children}
              </main>
            </div>
          </SignedIn>

        </body>
      </html>
    </ClerkProvider>
  );
}