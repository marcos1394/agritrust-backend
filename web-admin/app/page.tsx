"use client";

import { useEffect, useState } from "react";
import { useAxiosAuth } from "../lib/useAxiosAuth"; // Hook seguro con Token
import { 
  Scale, 
  AlertTriangle, 
  Tractor, 
  TrendingUp, 
  ArrowUpRight, 
  Loader2 
} from "lucide-react";
import HarvestChart from "../components/HarvestChart";
import Onboarding from "../components/Onboarding"; // Componente de Bienvenida
export default function Home() {
  const axiosAuth = useAxiosAuth();
  
  // Estados de datos
  const [stats, setStats] = useState<any>(null);
  
  // Estados de flujo
  const [loading, setLoading] = useState(true);
  const [hasTenants, setHasTenants] = useState<boolean | null>(null); // null = verificando

  // Función Maestra: Carga la inteligencia del negocio
  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      // 1. VERIFICACIÓN DE IDENTIDAD EMPRESARIAL
      // Preguntamos al backend: "¿Este usuario tiene empresas asignadas?"
      const tenantsRes = await axiosAuth.get("/tenants");
      
      if (tenantsRes.data.length === 0) {
        // CASO A: Usuario Nuevo -> Mandar al Onboarding
        setHasTenants(false);
        setLoading(false);
        return;
      }

      // CASO B: Usuario Existente -> Cargar Dashboard
      setHasTenants(true);

      // 2. CARGAR KPIS Y GRÁFICOS
      const statsRes = await axiosAuth.get(`/dashboard/stats`);
      setStats(statsRes.data);

    } catch (error) {
      console.error("Error crítico cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Ejecutar al inicio o cuando cambie la autenticación
  useEffect(() => {
    loadDashboard();
  }, [axiosAuth]);

  // --- SUB-COMPONENTES VISUALES ---

  // Tarjeta de Indicadores Clave (KPI)
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
        <h3 className="text-3xl font-bold text-gray-800">
          {value} <span className="text-sm font-normal text-gray-400">{unit}</span>
        </h3>
      </div>
    </div>
  );

  // --- RENDERIZADO CONDICIONAL DEL FLUJO ---

  // 1. Estado de Carga Inicial (Pantalla limpia)
  if (loading && hasTenants === null) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-gray-400 gap-3">
        <Loader2 className="animate-spin text-green-600" size={40} />
        <p>Conectando con tu oficina virtual...</p>
      </div>
    );
  }

  // 2. Estado de Onboarding (Usuario Nuevo)
  if (hasTenants === false) {
    // Le pasamos la función loadDashboard para que cuando termine de crear la empresa,
    // se recargue esta página y entre al Dashboard automáticamente.
    return <Onboarding onComplete={loadDashboard} />;
  }

  // 3. Estado Dashboard (Usuario Activo)
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* HEADER */}
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Cuadro de Mando</h1>
        <p className="text-slate-500 mt-1">Visión general de la operación agrícola hoy.</p>
      </header>

      {/* GRID DE KPIS */}
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

      {/* SECCIÓN PRINCIPAL: GRÁFICO Y ACCIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Gráfico de Tendencia (Ocupa 2 columnas) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" />
              Tendencia de Cosecha (7 Días)
            </h3>
            <select className="text-sm border-gray-200 rounded-lg text-gray-500 p-1 bg-gray-50 outline-none">
                <option>Esta Semana</option>
                <option>Este Mes</option>
            </select>
          </div>
          
          {loading ? (
             <div className="h-[300px] w-full bg-gray-100 rounded animate-pulse flex items-center justify-center text-gray-400">
                Cargando datos...
             </div>
          ) : (
             <HarvestChart data={stats?.weekly_trend} />
          )}
        </div>

        {/* Panel Lateral: Accesos Rápidos */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-xl mb-2">Acciones Rápidas</h3>
                <p className="text-slate-400 text-sm mb-6">Atajos para la gestión diaria.</p>
                
                <div className="space-y-3">
                    <button className="w-full bg-slate-800 hover:bg-slate-700 p-3 rounded-xl text-left flex items-center gap-3 transition">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div> 
                        <span className="font-medium">Abrir Lote de Cosecha</span>
                    </button>
                    <button className="w-full bg-slate-800 hover:bg-slate-700 p-3 rounded-xl text-left flex items-center gap-3 transition">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div> 
                        <span className="font-medium">Auditoría de Químicos</span>
                    </button>
                    <button className="w-full bg-slate-800 hover:bg-slate-700 p-3 rounded-xl text-left flex items-center gap-3 transition">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div> 
                        <span className="font-medium">Reportar Incidente</span>
                    </button>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-700">
                <p className="text-xs text-slate-500 uppercase font-bold mb-2">Estado del Sistema</p>
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Operativo • v1.0.0
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}