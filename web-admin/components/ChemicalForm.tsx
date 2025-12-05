"use client";

import { useState } from "react";
import { FlaskConical, ShieldAlert, Save, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { API_URL } from '../utils/api';
import { useAxiosAuth } from "../lib/useAxiosAuth";

interface Props {
  onSuccess: () => void;
}

export default function ChemicalForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    active_ingredient: "",
    is_banned: false,
    banned_markets: "",
  });

  const axiosAuth = useAxiosAuth();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await axiosAuth.post(`${API_URL}/chemicals`, formData);
      setFormData({ name: "", active_ingredient: "", is_banned: false, banned_markets: "" });
      setSuccess(true);
      onSuccess();
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error(error);
      setError(error.response?.data?.error || "Error al guardar el químico. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.active_ingredient.trim();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <FlaskConical size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Registrar Producto</h2>
            <p className="text-blue-100 text-sm">Añade nuevos químicos al catálogo fitosanitario</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-4 flex items-start gap-3 animate-slide-in-right">
            <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-green-900">¡Producto registrado!</h3>
              <p className="text-sm text-green-700 mt-1">El químico se ha añadido correctamente al catálogo.</p>
            </div>
            <button 
              onClick={() => setSuccess(false)}
              className="ml-auto text-green-600 hover:text-green-700"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button 
              onClick={() => setError("")}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Grid de inputs principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nombre Comercial */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Nombre Comercial
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-slate-900 placeholder-slate-400"
                placeholder="Ej: Cipermetrina 200"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-2">Nombre comercial del producto</p>
            </div>

            {/* Ingrediente Activo */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Ingrediente Activo
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-slate-900 placeholder-slate-400"
                placeholder="Ej: Cipermetrina"
                value={formData.active_ingredient}
                onChange={(e) => handleInputChange('active_ingredient', e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-2">Principio activo o compuesto químico</p>
            </div>
          </div>

          {/* Toggle - Producto Prohibido */}
          <div className={`rounded-2xl border-2 p-6 transition-all duration-300 ${
            formData.is_banned
              ? 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50'
              : 'border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                  formData.is_banned
                    ? 'bg-red-200'
                    : 'bg-slate-200'
                }`}>
                  <ShieldAlert size={24} className={formData.is_banned ? 'text-red-600' : 'text-slate-600'} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Producto Prohibido</p>
                  <p className="text-sm text-slate-600">Marcar si este químico está prohibido en algunos mercados</p>
                </div>
              </div>

              {/* Custom Toggle Switch */}
              <button
                type="button"
                onClick={() => handleInputChange('is_banned', !formData.is_banned)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  formData.is_banned ? 'bg-red-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    formData.is_banned ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Campo condicional - Mercados Prohibidos */}
            {formData.is_banned && (
              <div className="mt-6 pt-6 border-t border-red-200 animate-fade-in">
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Mercados donde está prohibido
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: USA, Unión Europea, Japón, México"
                  className="w-full px-4 py-3 border-2 border-red-300 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition text-slate-900 placeholder-slate-400"
                  value={formData.banned_markets}
                  onChange={(e) => handleInputChange('banned_markets', e.target.value)}
                />
                <p className="text-xs text-slate-600 mt-2">Separa los mercados por comas. Este campo es recomendado.</p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              {isFormValid ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 size={16} /> Formulario completo
                </span>
              ) : (
                <span className="text-amber-600 font-medium flex items-center gap-1">
                  <AlertCircle size={16} /> Completa los campos requeridos
                </span>
              )}
            </p>
            
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Guardar Producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}