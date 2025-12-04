"use client";

import { useEffect, useState } from "react";
import { useAxiosAuth } from "../lib/useAxiosAuth";
import { Scale, AlertTriangle, Tractor, TrendingUp, ArrowUpRight, Loader2 } from "lucide-react";
import HarvestChart from "./HarvestChart";
import Onboarding from "./Onboarding";

export default function DashboardHome() {
  const axiosAuth = useAxiosAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasTenants, setHasTenants] = useState<boolean | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const tenantsRes = await axiosAuth.get("/tenants");
      if (tenantsRes.data.length === 0) {
        setHasTenants(false);
        setLoading(false);
        return;
      }
      setHasTenants(true);
      const statsRes = await axiosAuth.get(`/dashboard/stats`);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [axiosAuth]);

  // Sub-componente KPI
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

  if (loading && hasTenants === null) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-gray-400 gap-3">
        <Loader2 className="animate-spin text-green-600" size={40} />
        <p>Conectando con tu oficina virtual...</p>
      </div>
    );
  }

  if (hasTenants === false) return <Onboarding onComplete={loadDashboard} />;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Cuadro de Mando</h1>
        <p className="text-slate-500 mt-1">Visión general de la operación agrícola hoy.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="Producción Hoy" value={stats?.total_harvest_today || 0} unit="kg" icon={Scale} colorClass="bg-emerald-500 text-emerald-500" trend="+12% vs ayer" />
        <KPICard title="Lotes Activos" value={stats?.active_batches || 0} unit="zonas" icon={Tractor} colorClass="bg-blue-500 text-blue-500" />
        <KPICard title="Alertas Fitosanitarias" value={stats?.security_alerts || 0} unit="incidentes" icon={AlertTriangle} colorClass="bg-amber-500 text-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" />
              Tendencia de Cosecha
            </h3>
          </div>
          {loading ? <div className="h-[300px] w-full bg-gray-100 animate-pulse"></div> : <HarvestChart data={stats?.weekly_trend} />}
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-xl mb-2">Acciones Rápidas</h3>
                <div className="space-y-3 mt-4">
                    <button className="w-full bg-slate-800 hover:bg-slate-700 p-3 rounded-xl text-left flex items-center gap-3 transition"><div className="w-2 h-2 bg-green-400 rounded-full"></div> Abrir Lote</button>
                    <button className="w-full bg-slate-800 hover:bg-slate-700 p-3 rounded-xl text-left flex items-center gap-3 transition"><div className="w-2 h-2 bg-blue-400 rounded-full"></div> Auditoría</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}