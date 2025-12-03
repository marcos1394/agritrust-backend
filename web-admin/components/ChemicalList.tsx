"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle, CheckCircle, FlaskConical, ShieldAlert } from "lucide-react";
import { API_URL } from '../utils/api'; // Ajusta la ruta según donde lo creaste

// REEMPLAZA CON TU URL REAL DE CODESPACES

interface Chemical {
  id: string;
  name: string;
  active_ingredient: string;
  is_banned: boolean;
  banned_markets: string;
}

export default function ChemicalList() {
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [loading, setLoading] = useState(true);

  // Función para cargar datos
  const fetchChemicals = async () => {
    try {
      const res = await axios.get(`${API_URL}/chemicals`);
      setChemicals(res.data);
    } catch (error) {
      console.error("Error cargando químicos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChemicals();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <FlaskConical className="text-blue-600" size={20} />
          Catálogo Fitosanitario
        </h3>
        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
          {chemicals.length} Productos registrados
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white text-gray-500 border-b">
            <tr>
              <th className="px-6 py-3 font-medium">Nombre Comercial</th>
              <th className="px-6 py-3 font-medium">Ingrediente Activo</th>
              <th className="px-6 py-3 font-medium">Estado Legal</th>
              <th className="px-6 py-3 font-medium">Mercados Prohibidos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center">Cargando catálogo...</td></tr>
            ) : chemicals.map((chem) => (
              <tr key={chem.id} className="hover:bg-blue-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{chem.name}</td>
                <td className="px-6 py-4 text-gray-600">{chem.active_ingredient}</td>
                <td className="px-6 py-4">
                  {chem.is_banned ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                      <ShieldAlert size={12} /> PROHIBIDO
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      <CheckCircle size={12} /> Aprobado
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-500 italic">
                  {chem.is_banned ? chem.banned_markets : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}