"use client";

import { useState } from "react";
import { useAxiosAuth } from "../lib/useAxiosAuth";
import { Sprout, ArrowRight, Loader2, Check, AlertCircle, Building2, FileText } from "lucide-react";

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const axiosAuth = useAxiosAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    rfc: ""
  });

  const isStep1Valid = formData.name.trim().length > 0;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axiosAuth.post("/tenants", {
        name: formData.name,
        rfc: formData.rfc || null,
        plan: "free_tier"
      });
      setStep(3); // Success step
      setTimeout(() => onComplete(), 1500);
    } catch (error: any) {
      console.error(error);
      setError(error.response?.data?.error || "Error creando tu empresa. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 flex flex-col items-center justify-center p-4">
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200/30 to-green-200/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-green-200/20 to-emerald-200/30 rounded-full blur-3xl -z-10" />
      
      {/* Main Card Container */}
      <div className="w-full max-w-lg">
        
        {/* Step Indicator */}
        {step !== 3 && (
          <div className="mb-8 flex justify-center gap-2">
            <div className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-slate-200'}`} />
            <div className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-slate-200'}`} />
          </div>
        )}

        {/* Card Main */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          
          {/* Header con Icono */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 pt-8 pb-6 text-center overflow-hidden">
            {/* Fondo decorativo */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full -ml-16 -mb-16" />
            
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30 animate-bounce" style={{ animationDuration: '2s' }}>
                <Sprout size={40} className="text-white" />
              </div>
              
              {step === 1 && (
                <>
                  <h1 className="text-3xl font-bold text-white mb-2">¡Bienvenido!</h1>
                  <p className="text-emerald-100 text-sm">Vamos a configurar tu primer cultivo</p>
                </>
              )}
              
              {step === 2 && (
                <>
                  <h1 className="text-3xl font-bold text-white mb-2">Casi listo</h1>
                  <p className="text-emerald-100 text-sm">Completa la información de tu agrícola</p>
                </>
              )}
              
              {step === 3 && (
                <>
                  <h1 className="text-3xl font-bold text-white mb-2">¡Éxito!</h1>
                  <p className="text-emerald-100 text-sm">Tu agrícola ha sido registrada</p>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            
            {/* Step 1: Welcome Message */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Check size={20} className="text-emerald-600" />
                    AgriTrust te ofrece:
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <span>Trazabilidad completa de tus cultivos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <span>Gestión de aplicaciones químicas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <span>Auditorías de compliance automáticas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <span>Reportes detallados y certificaciones</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
                >
                  Comenzar <ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* Step 2: Form */}
            {step === 2 && (
              <form onSubmit={handleCreate} className="space-y-5 animate-fade-in">
                
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                    <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Nombre Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Building2 size={18} className="text-emerald-600" />
                    Nombre de tu Agrícola
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition text-slate-900 placeholder-slate-400"
                    placeholder="Ej: Agropecuaria El Valle"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-2">Será visible en todos tus reportes y documentos</p>
                </div>

                {/* RFC Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <FileText size={18} className="text-blue-600" />
                    RFC / ID Fiscal
                    <span className="text-xs font-normal text-slate-500">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-slate-900 placeholder-slate-400 uppercase"
                    placeholder="AAA010101ABC"
                    value={formData.rfc}
                    onChange={e => handleInputChange('rfc', e.target.value.toUpperCase())}
                  />
                  <p className="text-xs text-slate-500 mt-2">Útil para documentación fiscal y cumplimiento normativo</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 border-2 border-slate-200 text-slate-900 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !isStep1Valid}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 disabled:shadow-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        Crear Agrícola
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <div className="text-center space-y-6 py-4 animate-fade-in">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                  <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/50">
                    <Check size={48} className="text-white" />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    ¡Perfecto!
                  </h2>
                  <p className="text-slate-600 text-sm">
                    Tu agrícola <span className="font-bold text-emerald-600">{formData.name}</span> está lista.
                    <br />
                    Cargando tu panel de control...
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 text-emerald-600 font-medium">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Redirigiendo...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer hint */}
        {step < 3 && (
          <p className="text-center text-xs text-slate-500 mt-6">
            Tus datos están protegidos con encriptación de grado empresarial
          </p>
        )}
      </div>
    </div>
  );
}