"use client";

import { useState, useEffect } from "react";
import { useAxiosAuth } from "../../lib/useAxiosAuth";
import { 
  DollarSign, 
  PieChart, 
  Calendar, 
  Tags, 
  Plus, 
  Save, 
  TrendingUp, 
  AlertCircle,
  FileText
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// --- TIPOS DE DATOS ---
interface Season { id: string; name: string; start_date: string; end_date: string; active: boolean; }
interface Category { id: string; name: string; code: string; color: string; }
interface Budget { id: string; amount: number; month: number; cost_category: Category; }
interface Expense { id: string; amount: number; description: string; expense_date: string; }

export default function FinancePage() {
  const axiosAuth = useAxiosAuth();
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | budget | expenses | config
  const [loading, setLoading] = useState(false);

  // Estados de Datos Globales
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [farms, setFarms] = useState<any[]>([]); // Para selector
  
  // Selectores de Contexto
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedFarm, setSelectedFarm] = useState("");

  // Carga Inicial de Catálogos
  useEffect(() => {
    const init = async () => {
      try {
        const [sRes, cRes, fRes] = await Promise.all([
          axiosAuth.get("/finance/seasons"),
          axiosAuth.get("/finance/categories"),
          axiosAuth.get("/farms") // Asumimos que ya tienes este endpoint del modulo anterior
        ]);
        setSeasons(sRes.data);
        setCategories(cRes.data);
        setFarms(fRes.data);
        
        // Auto-seleccionar primeros valores si existen
        if (sRes.data.length > 0) setSelectedSeason(sRes.data[0].id);
        if (fRes.data.length > 0) setSelectedFarm(fRes.data[0].id);
      } catch (error) {
        console.error("Error cargando finanzas", error);
      }
    };
    init();
  }, [axiosAuth]);

  // --- COMPONENTES DE PESTAÑAS ---

  // 1. DASHBOARD (Reporte de Variación)
  const DashboardTab = () => {
    const [reportData, setReportData] = useState<any[]>([]);

    useEffect(() => {
      if (!selectedSeason || !selectedFarm) return;
      
      axiosAuth.get(`/finance/report/variance?season_id=${selectedSeason}&farm_id=${selectedFarm}`)
        .then(res => {
            // Transformar datos del backend para Recharts
            // Backend devuelve { budget_totals: [], expense_totals: [] }
            // Hacemos un merge simple por CategoryID
            const budgets = res.data.budget_totals || [];
            const expenses = res.data.expense_totals || [];
            
            // Mapeamos a un array unificado
            const merged = categories.map(cat => {
                const b = budgets.find((x: any) => x.CostCategoryID === cat.id)?.Total || 0;
                const e = expenses.find((x: any) => x.CostCategoryID === cat.id)?.Total || 0;
                return {
                    name: cat.name,
                    Presupuesto: b,
                    GastoReal: e,
                    Variacion: b - e
                };
            }).filter(item => item.Presupuesto > 0 || item.GastoReal > 0); // Solo mostrar activos

            setReportData(merged);
        });
    }, [selectedSeason, selectedFarm]);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500 font-bold uppercase">Presupuesto Total</p>
                <p className="text-2xl font-bold text-blue-600">
                    ${reportData.reduce((acc, curr) => acc + curr.Presupuesto, 0).toLocaleString()}
                </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500 font-bold uppercase">Gasto Ejecutado</p>
                <p className="text-2xl font-bold text-slate-800">
                    ${reportData.reduce((acc, curr) => acc + curr.GastoReal, 0).toLocaleString()}
                </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500 font-bold uppercase">Variación (Ahorro/Déficit)</p>
                {(() => {
                    const val = reportData.reduce((acc, curr) => acc + curr.Variacion, 0);
                    return (
                        <p className={`text-2xl font-bold ${val >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {val >= 0 ? '+' : ''}${val.toLocaleString()}
                        </p>
                    )
                })()}
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[400px]">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Comparativa por Rubro</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Presupuesto" fill="#3b82f6" name="Presupuestado" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="GastoReal" fill="#ef4444" name="Gasto Real" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // 2. CONFIGURACIÓN (Temporadas y Categorías)
  const ConfigTab = () => {
    const [newSeasonName, setNewSeasonName] = useState("");
    const [newCatName, setNewCatName] = useState("");

    const createSeason = async () => {
        if (!newSeasonName) return;
        await axiosAuth.post("/finance/seasons", {
            name: newSeasonName,
            start_date: new Date(), // Simplificado: Hoy
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // Hoy + 1 año
        });
        setNewSeasonName("");
        alert("Temporada creada");
        // Recargar contexto...
    };

    const createCategory = async () => {
        if (!newCatName) return;
        await axiosAuth.post("/finance/categories", { name: newCatName, code: newCatName.substring(0,3).toUpperCase() });
        setNewCatName("");
        alert("Categoría creada");
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Calendar className="text-purple-500"/> Temporadas</h3>
                <div className="flex gap-2 mb-4">
                    <input className="border p-2 rounded w-full" placeholder="Ej: Tomate 2025" value={newSeasonName} onChange={e => setNewSeasonName(e.target.value)} />
                    <button onClick={createSeason} className="bg-purple-600 text-white px-4 rounded hover:bg-purple-700"><Plus/></button>
                </div>
                <ul className="space-y-2">
                    {seasons.map(s => <li key={s.id} className="p-2 bg-gray-50 rounded text-sm border">{s.name}</li>)}
                </ul>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Tags className="text-blue-500"/> Plan de Cuentas</h3>
                <div className="flex gap-2 mb-4">
                    <input className="border p-2 rounded w-full" placeholder="Ej: Fertilizantes" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                    <button onClick={createCategory} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"><Plus/></button>
                </div>
                <ul className="space-y-2">
                    {categories.map(c => <li key={c.id} className="p-2 bg-gray-50 rounded text-sm border">{c.name} ({c.code})</li>)}
                </ul>
            </div>
        </div>
    )
  };

  // 3. PRESUPUESTOS (Asignar montos)
  const BudgetTab = () => {
    const [amount, setAmount] = useState("");
    const [catId, setCatId] = useState("");
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    const saveBudget = async () => {
        if (!amount || !catId) return;
        try {
            await axiosAuth.post("/finance/budgets", {
                season_id: selectedSeason,
                farm_id: selectedFarm,
                cost_category_id: catId,
                month: Number(month),
                year: new Date().getFullYear(),
                amount: parseFloat(amount)
            });
            alert("Presupuesto guardado");
            setAmount("");
        } catch (e) { alert("Error al guardar"); }
    };

    return (
        <div className="bg-white p-8 rounded-xl border border-gray-200 max-w-lg mx-auto">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><DollarSign className="text-green-600"/> Asignar Presupuesto</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                    <select className="w-full p-2 border rounded" value={catId} onChange={e => setCatId(e.target.value)}>
                        <option value="">Seleccione...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Mes</label>
                        <select className="w-full p-2 border rounded" value={month} onChange={e => setMonth(Number(e.target.value))}>
                            {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>Mes {m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Monto ($)</label>
                        <input type="number" className="w-full p-2 border rounded" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                </div>
                <button onClick={saveBudget} className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 flex justify-center items-center gap-2">
                    <Save size={18}/> Guardar Meta
                </button>
            </div>
        </div>
    )
  };

  // 4. GASTOS (Registrar facturas)
  const ExpenseTab = () => {
    const [desc, setDesc] = useState("");
    const [amount, setAmount] = useState("");
    const [catId, setCatId] = useState("");

    const saveExpense = async () => {
        if (!amount || !catId || !desc) return;
        try {
            await axiosAuth.post("/finance/expenses", {
                season_id: selectedSeason,
                farm_id: selectedFarm,
                cost_category_id: catId,
                description: desc,
                amount: parseFloat(amount)
            });
            alert("Gasto registrado");
            setDesc(""); setAmount("");
        } catch (e) { alert("Error al registrar gasto"); }
    };

    return (
        <div className="bg-white p-8 rounded-xl border border-gray-200 max-w-lg mx-auto">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><FileText className="text-red-500"/> Registrar Gasto Real</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Concepto / Factura</label>
                    <input className="w-full p-2 border rounded" placeholder="Ej: Compra de Urea Nota 123" value={desc} onChange={e => setDesc(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                    <select className="w-full p-2 border rounded" value={catId} onChange={e => setCatId(e.target.value)}>
                        <option value="">Seleccione...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Monto Pagado ($)</label>
                    <input type="number" className="w-full p-2 border rounded" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>
                <button onClick={saveExpense} className="w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 flex justify-center items-center gap-2">
                    <Save size={18}/> Registrar Salida
                </button>
            </div>
        </div>
    )
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* HEADER DE CONTEXTO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <PieChart className="text-blue-600" /> Finanzas Agrícolas
            </h1>
            <p className="text-slate-500">Control de presupuestos y costos por temporada.</p>
        </div>
        
        {/* SELECTORES GLOBALES (Afectan a todas las pestañas) */}
        <div className="flex gap-4">
            <select 
                className="bg-white border border-gray-300 text-slate-700 text-sm rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                value={selectedFarm}
                onChange={e => setSelectedFarm(e.target.value)}
            >
                <option value="">Seleccionar Rancho</option>
                {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            
            <select 
                className="bg-white border border-gray-300 text-slate-700 text-sm rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                value={selectedSeason}
                onChange={e => setSelectedSeason(e.target.value)}
            >
                <option value="">Seleccionar Temporada</option>
                {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
        </div>
      </header>

      {/* ALERTAS DE CONFIGURACIÓN */}
      {(!selectedSeason || !selectedFarm) && activeTab !== 'config' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 flex items-center gap-3">
            <AlertCircle className="text-yellow-600"/>
            <p className="text-yellow-700">Para ver información financiera, por favor selecciona un <strong>Rancho</strong> y una <strong>Temporada</strong> arriba.</p>
        </div>
      )}

      {/* NAVEGACIÓN DE TABS */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {[
            { id: 'dashboard', label: 'Reporte General', icon: TrendingUp },
            { id: 'budget', label: 'Asignar Presupuesto', icon: DollarSign },
            { id: 'expenses', label: 'Registrar Gastos', icon: FileText },
            { id: 'config', label: 'Configuración', icon: Tags },
        ].map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition whitespace-nowrap ${
                    activeTab === tab.id 
                    ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50/50" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-gray-50"
                }`}
            >
                <tab.icon size={18} /> {tab.label}
            </button>
        ))}
      </div>

      {/* CONTENIDO */}
      <div className="min-h-[400px]">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'config' && <ConfigTab />}
        {activeTab === 'budget' && <BudgetTab />}
        {activeTab === 'expenses' && <ExpenseTab />}
      </div>

    </div>
  );
}