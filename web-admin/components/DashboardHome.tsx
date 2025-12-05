"use client";

import { useEffect, useState } from "react";
import { useAxiosAuth } from "../lib/useAxiosAuth";
import { Scale, AlertTriangle, Tractor, TrendingUp, ArrowUpRight, Loader2, Activity, Zap, Target, Calendar, MoreHorizontal } from "lucide-react";
import HarvestChart from "./HarvestChart";
import Onboarding from "./Onboarding";

export default function DashboardHome() {
  const axiosAuth = useAxiosAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasTenants, setHasTenants] = useState<boolean | null>(null);
  const [timeRange, setTimeRange] = useState('today');

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

  // Sub-componente KPI Card - Mejorado
  const KPICard = ({ title, value, unit, icon: Icon, colorClass, trend, trendPositive = true }: any) => (
    <div className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-300 overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-300" />
      
      <div className="relative">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-3 rounded-xl ${colorClass} bg-opacity-15 group-hover:bg-opacity-25 transition-colors duration-300`}>
            <Icon className={colorClass.replace('bg-', 'text-')} size={24} />
          </div>
          {trend && (
            <span className={`flex items-center text-xs font-bold px-3 py-1 rounded-full transition-colors duration-300 ${
              trendPositive 
                ? 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100' 
                : 'text-amber-600 bg-amber-50 group-hover:bg-amber-100'
            }`}>
              <ArrowUpRight size={12} className={`mr-1 ${!trendPositive ? 'rotate-90' : ''}`} /> {trend}
            </span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
            <span className="text-sm font-medium text-slate-400">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && hasTenants === null) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600 font-medium">Sincronizando datos...</p>
          <p className="text-sm text-slate-400 mt-2">Esto puede tomar unos segundos</p>
        </div>
      </div>
    );
  }

  if (hasTenants === false) return <Onboarding onComplete={loadDashboard} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      {/* HEADER SECTION */}
      <div className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Cuadro de Mando
              </h1>
              <p className="text-slate-500 mt-2">Visión integral de tu operación agrícola</p>
            </div>
            <div className="flex gap-2">
              {['today', 'week', 'month'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {range === 'today' ? 'Hoy' : range === 'week' ? 'Semana' : 'Mes'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* KPI CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <KPICard 
            title="Producción Hoy" 
            value={stats?.total_harvest_today || 0} 
            unit="kg" 
            icon={Scale} 
            colorClass="bg-emerald-500 text-emerald-500" 
            trend="+12% vs ayer"
            trendPositive={true}
          />
          <KPICard 
            title="Lotes Activos" 
            value={stats?.active_batches || 0} 
            unit="zonas" 
            icon={Tractor} 
            colorClass="bg-blue-500 text-blue-500"
            trend="+2 nuevos"
            trendPositive={true}
          />
          <KPICard 
            title="Alertas Activas" 
            value={stats?.security_alerts || 0} 
            unit="incidentes" 
            icon={AlertTriangle} 
            colorClass="bg-amber-500 text-amber-500"
            trend={stats?.security_alerts > 0 ? "Requiere atención" : "Sin alertas"}
            trendPositive={stats?.security_alerts === 0}
          />
        </div>

        {/* CHARTS AND ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <TrendingUp size={20} className="text-emerald-600" />
                    </div>
                    Tendencia de Cosecha
                  </h2>
                  <p className="text-sm text-slate-500">Últimos 7 días</p>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <MoreHorizontal size={20} className="text-slate-400" />
                </button>
              </div>
              {loading ? (
                <div className="h-[300px] w-full bg-gradient-to-r from-slate-100 to-slate-50 animate-pulse rounded-xl" />
              ) : (
                <HarvestChart data={stats?.weekly_trend} />
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8 flex flex-col h-full">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Acciones Rápidas</h3>
                <p className="text-slate-300 text-sm">Atajos a operaciones frecuentes</p>
              </div>
              
              <div className="space-y-3 flex-1">
                <QuickActionButton 
                  icon={<Tractor size={18} />}
                  label="Abrir Lote"
                  color="emerald"
                />
                <QuickActionButton 
                  icon={<Activity size={18} />}
                  label="Auditoría"
                  color="blue"
                />
                <QuickActionButton 
                  icon={<Zap size={18} />}
                  label="Alertas"
                  color="amber"
                />
                <QuickActionButton 
                  icon={<Target size={18} />}
                  label="Objetivos"
                  color="purple"
                />
              </div>

              <button className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/30">
                Ver más operaciones
              </button>
            </div>
          </div>
        </div>

        {/* Additional Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatBox 
            label="Eficiencia Operativa"
            value="94%"
            change="+3%"
            icon={<Activity size={20} />}
            color="emerald"
          />
          <StatBox 
            label="Cosecha Acumulada"
            value={`${stats?.cumulative_harvest || 0} kg`}
            change="+8% vs mes pasado"
            icon={<Scale size={20} />}
            color="blue"
          />
          <StatBox 
            label="Tiempo de Respuesta"
            value="2.4h"
            change="-15% vs promedio"
            icon={<Zap size={20} />}
            color="purple"
          />
          <StatBox 
            label="Próxima Cosecha"
            value="En 3 días"
            change="Zona A"
            icon={<Calendar size={20} />}
            color="orange"
          />
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar: Quick Action Button
function QuickActionButton({ icon, label, color }: any) {
  const colorMap: any = {
    emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 hover:from-emerald-500/30 hover:to-emerald-600/30 text-emerald-300',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:from-blue-500/30 hover:to-blue-600/30 text-blue-300',
    amber: 'from-amber-500/20 to-amber-600/20 border-amber-500/30 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 hover:from-purple-500/30 hover:to-purple-600/30 text-purple-300',
  };

  return (
    <button className={`w-full p-4 rounded-xl border bg-gradient-to-r flex items-center gap-3 transition-all duration-200 ${colorMap[color]}`}>
      <div>{icon}</div>
      <span className="font-medium text-sm">{label}</span>
      <ArrowUpRight size={14} className="ml-auto opacity-50" />
    </button>
  );
}

// Componente auxiliar: Stat Box
function StatBox({ label, value, change, icon, color }: any) {
  const colorMap: any = {
    emerald: 'text-emerald-600 bg-emerald-50',
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-sm font-medium text-slate-500 mb-2">{label}</p>
      <div className="flex justify-between items-end">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <span className="text-xs font-medium text-emerald-600">{change}</span>
      </div>
    </div>
  );
}