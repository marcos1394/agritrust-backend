import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutDashboard, Leaf, Truck, AlertTriangle, Settings } from "lucide-react"; // Iconos

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
    <html lang="es">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-100">
          {/* SIDEBAR (Barra Lateral) */}
          <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-green-400">AgriTrust</h1>
              <p className="text-xs text-gray-400">Enterprise Edition</p>
            </div>
            
            <nav className="flex-1 px-4 space-y-2">
              <a href="#" className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-lg text-white">
                <LayoutDashboard size={20} /> Dashboard
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition">
                <Leaf size={20} /> Campos y Cultivos
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition">
                <AlertTriangle size={20} /> Compliance
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition">
                <Truck size={20} /> Logística
              </a>
            </nav>

            <div className="p-4 border-t border-slate-800">
              <a href="#" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white">
                <Settings size={20} /> Configuración
              </a>
            </div>
          </aside>

          {/* MAIN CONTENT (Donde va la información) */}
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}