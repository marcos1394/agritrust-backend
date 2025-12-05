"use client";

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Leaf } from 'lucide-react';

interface Props {
  data: { date: string; value: number }[];
}

export default function HarvestChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center text-slate-500 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-200">
        <Leaf size={40} className="text-slate-300 mb-3 opacity-50" />
        <p className="font-medium">No hay datos de cosecha esta semana</p>
        <p className="text-xs text-slate-400 mt-1">Los datos aparecerán cuando registres tu primera cosecha</p>
      </div>
    );
  }

  // Calcular estadísticas
  const values = data.map(d => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const avgValue = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const totalValue = values.reduce((a, b) => a + b, 0);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
          <p className="text-sm font-bold text-slate-900">{date}</p>
          <p className="text-lg font-bold text-emerald-600 mt-1">
            {payload[0].value.toLocaleString('es-ES')} kg
          </p>
          <p className="text-xs text-slate-500 mt-2">Cosecha registrada</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-widest">Total Cosechado</p>
          <p className="text-2xl font-bold text-emerald-900 mt-2">
            {totalValue.toLocaleString('es-ES')} <span className="text-sm font-normal">kg</span>
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-widest">Promedio Diario</p>
          <p className="text-2xl font-bold text-blue-900 mt-2">
            {avgValue.toLocaleString('es-ES')} <span className="text-sm font-normal">kg</span>
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-widest">Máximo</p>
          <p className="text-2xl font-bold text-amber-900 mt-2">
            {maxValue.toLocaleString('es-ES')} <span className="text-sm font-normal">kg</span>
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
          <p className="text-xs font-medium text-purple-600 uppercase tracking-widest">Mínimo</p>
          <p className="text-2xl font-bold text-purple-900 mt-2">
            {minValue.toLocaleString('es-ES')} <span className="text-sm font-normal">kg</span>
          </p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-[350px] w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data} 
            margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorHarvest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorHarvestShadow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="4 4" 
              vertical={false} 
              stroke="#e2e8f0"
              opacity={0.6}
            />
            
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
              tickFormatter={(str) => {
                const date = new Date(str);
                return date.toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' });
              }}
              interval={Math.ceil(data.length / 7) - 1}
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorHarvest)"
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
        <Leaf size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-emerald-900">
          <p className="font-semibold">Tendencia Positiva</p>
          <p className="text-emerald-700 mt-1">Tu cosecha mantiene una tendencia estable. Continúa monitoreando para optimizar resultados.</p>
        </div>
      </div>
    </div>
  );
}