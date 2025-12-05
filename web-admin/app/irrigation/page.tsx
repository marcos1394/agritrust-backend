"use client";

import { useState, useEffect } from "react";
import { useAxiosAuth } from "../../lib/useAxiosAuth";
import { Droplets, Activity, Plus, PlayCircle } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

export default function IrrigationPage() {
  const axiosAuth = useAxiosAuth();
  const [farms, setFarms] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  
  const [selectedFarm, setSelectedFarm] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  
  // Form Nuevo Dispositivo
  const [showForm, setShowForm] = useState(false);
  const [newDevName, setNewDevName] = useState("");
  const [devType, setDevType] = useState("moisture_sensor");

  // Carga Inicial
  useEffect(() => {
    axiosAuth.get("/farms").then(res => {
        setFarms(res.data);
        if(res.data.length > 0) setSelectedFarm(res.data[0].id);
    });
  }, [axiosAuth]);

  // Cargar Dispositivos al cambiar Rancho
  useEffect(() => {
    if(!selectedFarm) return;
    axiosAuth.get(`/iot/devices?farm_id=${selectedFarm}`).then(res => {
        setDevices(res.data);
        if(res.data.length > 0) {
            setSelectedDevice(res.data[0]); // Seleccionar el primero por defecto
        } else {
            setSelectedDevice(null);
            setTelemetry([]);
        }
    });
  }, [selectedFarm, axiosAuth]);

  // Cargar Telemetría al cambiar Dispositivo
  useEffect(() => {
    if(!selectedDevice) return;
    axiosAuth.get(`/iot/telemetry?device_id=${selectedDevice.id}&period=24h`).then(res => {
        // Formatear fecha para la gráfica
        const formatted = res.data.map((d: any) => ({
            ...d,
            time: new Date(d.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }));
        setTelemetry(formatted);
    });
  }, [selectedDevice, axiosAuth]);

  const handleCreateDevice = async () => {
    try {
        const tenantsRes = await axiosAuth.get("/tenants");
        const tenantId = tenantsRes.data[0].id;

        await axiosAuth.post("/iot/devices", {
            tenant_id: tenantId,
            farm_id: selectedFarm,
            name: newDevName,
            type: devType,
            min_threshold: 30, // Default
            max_threshold: 80  // Default
        });
        setShowForm(false); setNewDevName("");
        // Recargar lista
        const res = await axiosAuth.get(`/iot/devices?farm_id=${selectedFarm}`);
        setDevices(res.data);
    } catch(e) { alert("Error creando sensor"); }
  };

  const handleSimulate = async () => {
    if(!selectedDevice) return;
    await axiosAuth.post(`/iot/simulate/${selectedDevice.id}`);
    alert("Datos generados. Recargando gráfica...");
    // Force reload telemetry
    const res = await axiosAuth.get(`/iot/telemetry?device_id=${selectedDevice.id}&period=24h`);
    const formatted = res.data.map((d: any) => ({
        ...d,
        time: new Date(d.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }));
    setTelemetry(formatted);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <Droplets className="text-cyan-500" /> Control de Riego
            </h1>
            <p className="text-slate-500">Monitoreo de humedad y fertirriego en tiempo real.</p>
        </div>
        <div className="flex gap-4">
            <select 
                className="bg-white border p-2 rounded-lg"
                value={selectedFarm}
                onChange={e => setSelectedFarm(e.target.value)}
            >
                {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <button onClick={() => setShowForm(!showForm)} className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus size={18}/> Nuevo Sensor
            </button>
        </div>
      </header>

      {/* FORMULARIO */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-cyan-100 flex gap-4 items-end">
            <div className="flex-1">
                <label className="text-sm font-bold text-slate-700">Nombre del Sensor</label>
                <input className="w-full border p-2 rounded" placeholder="Ej: Sensor Sector Norte" value={newDevName} onChange={e => setNewDevName(e.target.value)} />
            </div>
            <div className="w-48">
                <label className="text-sm font-bold text-slate-700">Tipo</label>
                <select className="w-full border p-2 rounded" value={devType} onChange={e => setDevType(e.target.value)}>
                    <option value="moisture_sensor">Humedad de Suelo</option>
                    <option value="flow_meter">Caudalímetro</option>
                </select>
            </div>
            <button onClick={handleCreateDevice} className="bg-cyan-600 text-white px-6 py-2 rounded font-bold">Guardar</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LISTA DE SENSORES */}
        <div className="lg:col-span-1 space-y-4">
            <h3 className="font-bold text-slate-700">Dispositivos Activos</h3>
            {devices.map(dev => (
                <div 
                    key={dev.id}
                    onClick={() => setSelectedDevice(dev)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                        selectedDevice?.id === dev.id ? 'bg-cyan-50 border-cyan-500 shadow-md' : 'bg-white border-gray-200 hover:border-cyan-300'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-slate-800">{dev.name}</p>
                            <p className="text-xs text-slate-500 capitalize">{dev.type.replace('_', ' ')}</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${dev.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    </div>
                </div>
            ))}
            {devices.length === 0 && <p className="text-slate-400 text-sm">No hay sensores en este rancho.</p>}
        </div>

        {/* GRÁFICA PRINCIPAL */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 min-h-[500px]">
            {selectedDevice ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Activity className="text-cyan-600"/> Telemetría (24h)
                        </h3>
                        
                        {/* Botón Mágico de Simulación */}
                        {telemetry.length === 0 && (
                            <button 
                                onClick={handleSimulate}
                                className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-purple-200"
                            >
                                <PlayCircle size={16}/> Generar Datos Demo
                            </button>
                        )}
                    </div>

                    {telemetry.length > 0 ? (
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={telemetry} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid stroke="#f5f5f5" />
                                    <XAxis dataKey="time" fontSize={12} tickMargin={10}/>
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    
                                    {/* Líneas de Alerta (Thresholds) */}
                                    <ReferenceLine y={selectedDevice.max_threshold} label="Max" stroke="red" strokeDasharray="3 3" />
                                    <ReferenceLine y={selectedDevice.min_threshold} label="Min" stroke="orange" strokeDasharray="3 3" />
                                    
                                    <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                            <p className="text-center text-xs text-slate-400 mt-4">Lectura en tiempo real (Sincronización cada 10 min)</p>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">
                            Esperando datos del sensor... (Usa el botón Demo)
                        </div>
                    )}
                </>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                    Selecciona un dispositivo para ver sus métricas.
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
