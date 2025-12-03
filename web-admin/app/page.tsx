"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Building2, MapPin } from "lucide-react";

// Tu URL REAL del backend (la que me pasaste)
const API_URL = "https://improved-funicular-gpxx6vqj47whpwr9-8080.app.github.dev";

interface Tenant {
  id: string;
  name: string;
  rfc: string;
  plan: string;
}

export default function Home() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Intentando conectar a:", API_URL + "/tenants");
        // Agregamos headers explícitos para evitar bloqueos simples
        const response = await axios.get(`${API_URL}/tenants`, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        console.log("Respuesta recibida:", response.data);
        setTenants(response.data);
      } catch (err: any) {
        console.error("Error Axios completo:", err);
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Panel General</h2>
        <p className="text-gray-500">Bienvenido, Marcos.</p>
      </header>

      {/* Si hay error, mostrarlo en rojo */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
           🚨 {error} <br/>
           <span className="text-xs">Revisa la consola (F12) para más detalles.</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-800">Mis Empresas (Tenants)</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-white text-gray-500 text-sm border-b">
              <tr>
                <th className="px-6 py-3 font-medium">Nombre</th>
                <th className="px-6 py-3 font-medium">RFC</th>
                <th className="px-6 py-3 font-medium">Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{tenant.name}</td>
                  <td className="px-6 py-4 text-gray-600">{tenant.rfc}</td>
                  <td className="px-6 py-4 text-blue-600">{tenant.plan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}