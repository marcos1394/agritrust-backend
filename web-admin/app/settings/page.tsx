"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@clerk/nextjs"; // <--- Componente Mágico de Clerk
import { useAxiosAuth } from "../../lib/useAxiosAuth";
import { 
  Building2, 
  User, 
  CreditCard, 
  Save, 
  Loader2, 
  CheckCircle 
} from "lucide-react";

export default function SettingsPage() {
  const axiosAuth = useAxiosAuth();
  const [activeTab, setActiveTab] = useState("company"); // company | profile | billing
  
  // Estado de la Empresa
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenant, setTenant] = useState<any>(null);
  
  // Datos del formulario
  const [name, setName] = useState("");
  const [rfc, setRfc] = useState("");

  // Cargar datos al iniciar
  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const res = await axiosAuth.get("/tenants");
        if (res.data.length > 0) {
          const t = res.data[0];
          setTenant(t);
          setName(t.name);
          setRfc(t.rfc);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === "company") fetchTenant();
  }, [activeTab, axiosAuth]);

  // Guardar Cambios
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosAuth.put("/tenants", { name, rfc });
      alert("✅ Datos actualizados correctamente");
    } catch (error) {
      alert("Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Configuración</h1>
        <p className="text-slate-500">Administra tu cuenta y preferencias de facturación.</p>
      </header>

      {/* TABS DE NAVEGACIÓN */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("company")}
          className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition ${
            activeTab === "company" 
              ? "border-b-2 border-slate-900 text-slate-900" 
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Building2 size={18} /> Datos de Empresa
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition ${
            activeTab === "profile" 
              ? "border-b-2 border-slate-900 text-slate-900" 
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <User size={18} /> Mi Perfil
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition ${
            activeTab === "billing" 
              ? "border-b-2 border-slate-900 text-slate-900" 
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <CreditCard size={18} /> Suscripción
        </button>
      </div>

      {/* CONTENIDO DE LAS PESTAÑAS */}
      <div className="mt-8">
        
        {/* TAB 1: EMPRESA */}
        {activeTab === "company" && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-2xl">
            {loading ? (
              <div className="text-center text-slate-400 py-10">Cargando información...</div>
            ) : (
              <form onSubmit={handleSaveCompany} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nombre Comercial</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-200 outline-none"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Identificación Fiscal (RFC/TAX ID)</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-200 outline-none uppercase"
                    value={rfc}
                    onChange={e => setRfc(e.target.value)}
                  />
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    ID Interno: <span className="font-mono">{tenant?.id}</span>
                  </div>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Guardar Cambios</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: PERFIL DE CLERK */}
        {activeTab === "profile" && (
          <div className="flex justify-center">
            {/* Este componente de Clerk hace TODO: Cambiar pass, email, avatar, 2FA */}
            <UserProfile 
              appearance={{
                elements: {
                  rootBox: "w-full max-w-4xl shadow-none",
                  card: "shadow-sm border border-gray-200 rounded-xl"
                }
              }}
            />
          </div>
        )}

        {/* TAB 3: FACTURACIÓN (UI PREPARADA) */}
        {activeTab === "billing" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            {/* Plan Actual */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                ACTIVO
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Plan Básico (Free)</h3>
              <p className="text-slate-500 text-sm mb-6">Ideal para pequeñas agrícolas que están digitalizándose.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle size={16} className="text-green-500"/> Hasta 100 hectáreas</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle size={16} className="text-green-500"/> 1 Usuario Operador</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle size={16} className="text-green-500"/> Soporte por correo</li>
              </ul>
              <button disabled className="w-full border border-green-500 text-green-600 font-bold py-3 rounded-lg cursor-default opacity-50">
                Tu Plan Actual
              </button>
            </div>

            {/* Plan PRO (Upsell) */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-xl transform hover:-translate-y-1 transition duration-300">
              <h3 className="text-lg font-bold mb-2">AgriTrust PRO</h3>
              <p className="text-slate-400 text-sm mb-6">Para exportadores que requieren cumplimiento total.</p>
              <div className="mb-6">
                <span className="text-3xl font-bold">$49</span> <span className="text-slate-400">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={16} className="text-blue-400"/> Hectáreas Ilimitadas</li>
                <li className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={16} className="text-blue-400"/> Usuarios Ilimitados</li>
                <li className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={16} className="text-blue-400"/> Módulo de Auditoría IA</li>
              </ul>
              <button 
                onClick={() => alert("Próximamente: Integración con Stripe")}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-blue-900/50"
              >
                Actualizar a PRO
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}