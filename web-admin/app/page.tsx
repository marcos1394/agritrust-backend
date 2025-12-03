"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Scale, AlertTriangle, Tractor, TrendingUp, ArrowUpRight 
} from "lucide-react";
import HarvestChart from "../components/HarvestChart";

// URL PÚBLICA
import { API_URL } from '../utils/api'; // Ajusta la ruta según donde lo creaste

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/dashboard/stats`);
        setStats(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Componente de Tarjeta KPI (Skeleton Loading incluido)
  const KPICard = ({ title, value, unit, icon: Icon, colorClass, trend }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
          <Icon className={colorClass.replace('bg-', 'text-')} size={24} />
        </div>
        {trend && (
          <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <ArrowUpRight size={12} className="mr-1" /> {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <h3 className="text-3xl font-bold text-gray-800">
            {value} <span className="text-sm font-normal text-gray-400">{unit}</span>
          </h3>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* HEADER DE BIENVENIDA */}
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Cuadro de Mando</h1>
        <p className="text-slate-500 mt-1">Visión general de la operación agrícola hoy.</p>
      </header>

      {/* 1. GRID DE KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
          title="Producción Hoy" 
          value={stats?.total_harvest_today || 0} 
          unit="kg"
          icon={Scale}
          colorClass="bg-emerald-500 text-emerald-500"
          trend="+12% vs ayer"
        />
        <KPICard 
          title="Lotes Activos" 
          value={stats?.active_batches || 0} 
          unit="zonas"
          icon={Tractor}
          colorClass="bg-blue-500 text-blue-500"
        />
        <KPICard 
          title="Alertas Fitosanitarias" 
          value={stats?.security_alerts || 0} 
          unit="incidentes"
          icon={AlertTriangle}
          colorClass="bg-amber-500 text-amber-500"
        />
      </div>

      {/* 2. SECCIÓN PRINCIPAL: GRÁFICO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Tendencia (Ocupa 2 columnas) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" />
              Tendencia de Cosecha (7 Días)
            </h3>
            <select className="text-sm border-gray-200 rounded-lg text-gray-500 p-1 bg-gray-50">
                <option>Esta Semana</option>
                <option>Este Mes</option>
            </select>
          </div>
          
          {loading ? (
             <div className="h-[300px] w-full bg-gray-100 rounded animate-pulse"></div>
          ) : (
             <HarvestChart data={stats?.weekly_trend} />
          )}
        </div>

        {/* Panel Lateral: Accesos Rápidos (UX) */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-xl mb-2">Acciones Rápidas</h3>
                <p className="text-slate-400 text-sm mb-6">Accesos directos a las funciones más usadas por los gerentes.</p>
                
                <div className="space-y-3">
                    <button className="w-full bg-slate-800 hover:bg-slate-700 p-3 rounded-xl text-left flex items-center gap-3 transition">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div> Abrir Nuevo Lote
                    </button>
                    <button className="w-full bg-slate-800 hover:bg-slate-700 p-3 rounded-xl text-left flex items-center gap-3 transition">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div> Auditoría de Químicos
                    </button>
                    <button className="w-full bg-slate-800 hover:bg-slate-700 p-3 rounded-xl text-left flex items-center gap-3 transition">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div> Reportar Incidente
                    </button>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-700">
                <p className="text-xs text-slate-500 uppercase font-bold mb-2">Estado del Sistema</p>
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Todos los servicios operativos
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}