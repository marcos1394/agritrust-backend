"use client";

import { useState } from "react";
import axios from "axios";
import { FlaskConical, ShieldAlert, Save, Loader2 } from "lucide-react";
import { API_URL } from '../utils/api'; // Ajusta la ruta según donde lo creaste

// TU URL PÚBLICA (Reemplaza si cambió)

interface Props {
  onSuccess: () => void; // Para avisarle a la lista que se actualice
}

export default function ChemicalForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    active_ingredient: "",
    is_banned: false,
    banned_markets: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_URL}/chemicals`, formData);
      // Limpiar formulario
      setFormData({ name: "", active_ingredient: "", is_banned: false, banned_markets: "" });
      alert("✅ Químico registrado correctamente");
      onSuccess(); // Recargar la lista
    } catch (error) {
      console.error(error);
      alert("❌ Error al guardar el químico");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FlaskConical size={20} className="text-blue-600" />
        Registrar Nuevo Producto
      </h3>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre del Producto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ej: Cipermetrina 200"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* Ingrediente Activo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ingrediente Activo</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ej: Cipermetrina"
            value={formData.active_ingredient}
            onChange={(e) => setFormData({ ...formData, active_ingredient: e.target.value })}
          />
        </div>

        {/* Switch de Prohibición */}
        <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              id="is_banned"
              className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
              checked={formData.is_banned}
              onChange={(e) => setFormData({ ...formData, is_banned: e.target.checked })}
            />
            <label htmlFor="is_banned" className="font-medium text-gray-900 flex items-center gap-2">
              <ShieldAlert size={18} className={formData.is_banned ? "text-red-600" : "text-gray-400"} />
              ¿Es un producto prohibido?
            </label>
          </div>

          {/* Campo Condicional: Solo aparece si está prohibido */}
          {formData.is_banned && (
            <div className="animate-pulse-once">
              <label className="block text-sm font-medium text-red-700 mb-1">
                Mercados donde está prohibido (Separar por comas)
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-red-50"
                placeholder="Ej: USA, Union Europea, Japón"
                value={formData.banned_markets}
                onChange={(e) => setFormData({ ...formData, banned_markets: e.target.value })}
              />
            </div>
          )}
        </div>

        {/* Botón de Guardar */}
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            Guardar Producto
          </button>
        </div>
      </form>
    </div>
  );
}