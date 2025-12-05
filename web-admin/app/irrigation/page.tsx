"use client";

import { useState, useEffect } from "react";
import { useAxiosAuth } from "../../lib/useAxiosAuth";
import { Droplets, Activity, Plus, PlayCircle, Loader2, AlertCircle, TrendingUp, Zap } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

export default function IrrigationPage() {
  const axiosAuth = useAxiosAuth();
  const [farms, setFarms] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [selectedFarm, setSelectedFarm] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  
  // Form Nuevo Dispositivo
  const [showForm, setShowForm] = useState(false);
  const [newDevName, setNewDevName] = useState("");
  const [devType, setDevType] = useState("moisture_sensor");
  const [minThreshold, setMinThreshold] = useState("30");
  const [maxThreshold, setMaxThreshold] = useState("80");

  // Carga Inicial
  useEffect(() => {
    const loadFarms = async () => {
      try {
        const res = await axiosAuth.get("/farms");
        setFarms(res.data || []);
        if((res.data || []).length > 0) {
          setSelectedFarm(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadFarms();
  }, [axiosAuth]);

  // Cargar Dispositivos al cambiar Rancho
  useEffect(() => {
    if(!selectedFarm) return;
    const loadDevices = async () => {
      try {
        const res = await axiosAuth.get(`/iot/devices?farm_id=${selectedFarm}`);
        setDevices(res.data || []);
        if((res.data || []).length > 0) {
          setSelectedDevice(res.data[0]);
        } else {
          setSelectedDevice(null);
          setTelemetry([]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadDevices();
  }, [selectedFarm, axiosAuth]);

  // Cargar Telemetría al cambiar Dispositivo
  useEffect(() => {
    if(!selectedDevice) return;
    const loadTelemetry = async () => {
      try {
        const res = await axiosAuth.get(`/iot/telemetry?device_id=${selectedDevice.id}&period=24h`);
        const formatted = (res.data || []).map((d: any) => ({
          ...d,
          time: new Date(d.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }));
        setTelemetry(formatted);
      } catch (err) {
        console.error(err);
      }
    };
    loadTelemetry();
  }, [selectedDevice, axiosAuth]);

  const handleCreateDevice = async () => {
    if (!newDevName) {
      setError("Por favor ingresa el nombre del sensor");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      const tenantsRes = await axiosAuth.get("/tenants");
      const tenantId = tenantsRes.data[0].id;

      await axiosAuth.post("/iot/devices", {
        tenant_id: tenantId,
        farm_id: selectedFarm,
        name: newDevName,
        type: devType,
        min_threshold: parseInt(minThreshold),
        max_threshold: parseInt(maxThreshold)
      });

      setShowForm(false);
      setNewDevName("");
      setDevType("moisture_sensor");
      setMinThreshold("30");
      setMaxThreshold("80");
      
      const res = await axiosAuth.get(`/iot/devices?farm_id=${selectedFarm}`);
      setDevices(res.data || []);
    } catch(e) {
      setError("Error creando sensor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulate = async () => {
    if(!selectedDevice) return;
    try {
      setIsSubmitting(true);
      await axiosAuth.post(`/iot/simulate/${selectedDevice.id}`);
      
      const res = await axiosAuth.get(`/iot/telemetry?device_id=${selectedDevice.id}&period=24h`);
      const formatted = (res.data || []).map((d: any) => ({
        ...d,
        time: new Date(d.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }));
      setTelemetry(formatted);
    } catch (err) {
      setError("Error generando datos");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats
  const avgValue = telemetry.length > 0 
    ? (telemetry.reduce((sum: number, d: any) => sum + (d.value || 0), 0) / telemetry.length).toFixed(1)
    : 0;
  
  const maxValue = telemetry.length > 0 
    ? Math.max(...telemetry.map((d: any) => d.value || 0)).toFixed(1)
    : 0;

  const getDeviceTypeLabel = (type: string) => {
    switch(type) {
      case 'moisture_sensor': return '💧 Humedad de Suelo';
      case 'flow_meter': return '🚰 Caudalímetro';
      default: return type;
    }
  };

  const getDeviceTypeColor = (type: string) => {
    switch(type) {
      case 'moisture_sensor': return 'from-blue-100 to-cyan-100 border-blue-200';
      case 'flow_meter': return 'from-teal-100 to-emerald-100 border-teal-200';
      default: return 'from-slate-100 to-slate-100 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'online' ? 'bg-green-500' : 'bg-slate-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl">
                <Droplets size={28} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">Control de Riego</h1>
                <p className="text-slate-600 mt-1">Monitoreo de humedad y fertirriego en tiempo real</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-200 shadow-lg shadow-blue-500/30"
          >
            {showForm ? "Cancelar" : <><Plus size={20} /> Nuevo Sensor</>}
          </button>
        </div>

        {/* FORMULARIO */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Droplets size={24} className="text-blue-600" />
              Registrar Nuevo Sensor
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-900 mb-2">Nombre del Sensor</label>
                <input 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-slate-900 placeholder-slate-400"
                  placeholder="Ej: Sensor Sector Norte, Humedad Campo A" 
                  value={newDevName} 
                  onChange={e => setNewDevName(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Tipo de Dispositivo</label>
                <select 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-slate-900"
                  value={devType} 
                  onChange={e => setDevType(e.target.value)}
                >
                  <option value="moisture_sensor">💧 Humedad de Suelo</option>
                  <option value="flow_meter">🚰 Caudalímetro</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Mín (%)</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-slate-900"
                    value={minThreshold} 
                    onChange={e => setMinThreshold(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Máx (%)</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-slate-900"
                    value={maxThreshold} 
                    onChange={e => setMaxThreshold(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleCreateDevice}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 shadow-lg shadow-blue-500/30 disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Guardar Sensor
                </>
              )}
            </button>
          </div>
        )}

        {/* FARM SELECTOR */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-slate-900">Predio:</label>
          <select 
            className="px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-slate-900 font-medium bg-white"
            value={selectedFarm}
            onChange={e => setSelectedFarm(e.target.value)}
          >
            {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LISTA DE SENSORES */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Dispositivos</h2>
              <p className="text-slate-600 text-sm mt-1">{devices.length} sensor(es)</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="text-blue-500 animate-spin" />
              </div>
            ) : devices.length === 0 ? (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center">
                <Droplets size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 font-medium text-sm">Sin sensores</p>
                <p className="text-slate-500 text-xs mt-1">Agrega el primero</p>
              </div>
            ) : (
              <div className="space-y-3">
                {devices.map(dev => (
                  <button
                    key={dev.id}
                    onClick={() => setSelectedDevice(dev)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedDevice?.id === dev.id 
                        ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-500 shadow-md' 
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm">{dev.name}</p>
                        <p className="text-xs text-slate-600 mt-1">{getDeviceTypeLabel(dev.type)}</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${getStatusColor(dev.status)}`}></div>
                    </div>
                    <div className="bg-slate-100 rounded-lg px-2 py-1">
                      <p className="text-xs text-slate-600">
                        {dev.min_threshold}% - {dev.max_threshold}% 📊
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GRÁFICA PRINCIPAL */}
          <div className="lg:col-span-3 space-y-4">
            {selectedDevice ? (
              <>
                {/* HEADER CON STATS */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Activity className="text-blue-600" size={28} />
                        {selectedDevice.name}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">{getDeviceTypeLabel(selectedDevice.type)}</p>
                    </div>
                    {telemetry.length === 0 && (
                      <button 
                        onClick={handleSimulate}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-300 disabled:to-slate-300 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-500/30 disabled:shadow-none"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <PlayCircle size={16} />
                            Demo Data
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {telemetry.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-600 font-medium uppercase tracking-widest mb-1">Promedio</p>
                        <p className="text-2xl font-bold text-blue-600">{avgValue}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium uppercase tracking-widest mb-1">Máximo</p>
                        <p className="text-2xl font-bold text-cyan-600">{maxValue}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium uppercase tracking-widest mb-1">Rango</p>
                        <p className="text-2xl font-bold text-slate-900">{selectedDevice.min_threshold}% - {selectedDevice.max_threshold}%</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* CHART */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  {telemetry.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-600" />
                        Telemetría (24h)
                      </h4>
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={telemetry} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid stroke="#e5e7eb" />
                            <XAxis dataKey="time" fontSize={12} tickMargin={10} stroke="#9ca3af" />
                            <YAxis domain={[0, 100]} stroke="#9ca3af" />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: '2px solid #0284c7',
                                borderRadius: '8px'
                              }}
                            />
                            
                            {/* Líneas de Alerta */}
                            <ReferenceLine 
                              y={selectedDevice.max_threshold} 
                              label={{ value: `Máx (${selectedDevice.max_threshold}%)`, position: 'right', fill: '#dc2626' }} 
                              stroke="#dc2626" 
                              strokeDasharray="5 5" 
                            />
                            <ReferenceLine 
                              y={selectedDevice.min_threshold} 
                              label={{ value: `Mín (${selectedDevice.min_threshold}%)`, position: 'right', fill: '#f59e0b' }} 
                              stroke="#f59e0b" 
                              strokeDasharray="5 5" 
                            />
                            
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#0284c7" 
                              strokeWidth={3} 
                              dot={false} 
                              activeDot={{ r: 8, fill: '#0284c7' }} 
                              isAnimationActive={true}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                        <Zap size={14} />
                        Sincronización automática cada 10 minutos
                      </div>
                    </div>
                  ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center text-slate-500">
                      <Activity size={48} className="text-slate-300 mb-3" />
                      <p className="font-medium">Sin datos disponibles</p>
                      <p className="text-sm text-slate-400 mt-1">Usa el botón Demo para generar datos de prueba</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center h-[500px] flex flex-col items-center justify-center">
                <Droplets size={48} className="text-slate-300 mb-4" />
                <p className="text-slate-600 font-medium text-lg">Sin dispositivos</p>
                <p className="text-slate-500 text-sm mt-1">Selecciona un predio o crea un nuevo sensor</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
