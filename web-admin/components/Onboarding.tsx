"use client";

import { useState } from "react";
import { useAxiosAuth } from "../lib/useAxiosAuth";
import { Sprout, ArrowRight, Loader2 } from "lucide-react";

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const axiosAuth = useAxiosAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [rfc, setRfc] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosAuth.post("/tenants", {
        name,
        rfc,
        plan: "free_tier"
      });
      // Al terminar, avisamos al padre para que recargue y muestre el dashboard
      onComplete();
    } catch (error) {
      console.error(error);
      alert("Error creando tu empresa. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sprout size={32} />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Bienvenido a AgriTrust!</h2>
        <p className="text-slate-500 mb-8">
          Para comenzar, necesitamos registrar tu primera unidad de negocio agrícola.
        </p>

        <form onSubmit={handleCreate} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Agrícola</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="Ej: Agropecuaria El Valle"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">RFC / ID Fiscal (Opcional)</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="AAA010101..."
              value={rfc}
              onChange={e => setRfc(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !name}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Comenzar <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}