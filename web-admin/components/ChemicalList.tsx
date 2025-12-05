"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, FlaskConical, ShieldAlert, Search, Filter, Loader2 } from "lucide-react";
import { API_URL } from '../utils/api';
import { useAxiosAuth } from "../lib/useAxiosAuth";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'banned'>('all');
  const axiosAuth = useAxiosAuth();

  const fetchChemicals = async () => {
    try {
      setLoading(true);
      const res = await axiosAuth.get(`${API_URL}/chemicals`);
      setChemicals(res.data || []);
    } catch (error) {
      console.error("Error cargando químicos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChemicals();
  }, []);

  // Filtrar químicos
  const filteredChemicals = chemicals.filter(chem => {
    const matchesSearch = 
      chem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chem.active_ingredient.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'banned' && chem.is_banned) ||
      (filterStatus === 'approved' && !chem.is_banned);
    
    return matchesSearch && matchesFilter;
  });

  const bannedCount = chemicals.filter(c => c.is_banned).length;
  const approvedCount = chemicals.filter(c => !c.is_banned).length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
            <FlaskConical size={24} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Catálogo Fitosanitario</h2>
            <p className="text-sm text-slate-500">Gestión de productos químicos y su estatus legal</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Total Productos</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{chemicals.length}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-4">
          <p className="text-xs font-medium text-green-700 uppercase tracking-widest flex items-center gap-2">
            <CheckCircle size={14} /> Aprobados
          </p>
          <p className="text-3xl font-bold text-green-900 mt-2">{approvedCount}</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border border-red-200 p-4">
          <p className="text-xs font-medium text-red-700 uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert size={14} /> Prohibidos
          </p>
          <p className="text-3xl font-bold text-red-900 mt-2">{bannedCount}</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o ingrediente activo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-slate-900 placeholder-slate-400"
          />
        </div>
        
        <div className="flex gap-2">
          {['all', 'approved', 'banned'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                filterStatus === status
                  ? status === 'banned'
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                    : status === 'approved'
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                    : 'bg-slate-900 text-white shadow-lg shadow-slate-900/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Filter size={16} />
              {status === 'all' ? 'Todos' : status === 'approved' ? 'Aprobados' : 'Prohibidos'}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
          <Loader2 size={40} className="text-blue-500 animate-spin mb-3" />
          <p className="text-slate-600 font-medium">Cargando catálogo...</p>
          <p className="text-sm text-slate-400 mt-1">Esto puede tomar unos segundos</p>
        </div>
      ) : filteredChemicals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
          <FlaskConical size={48} className="text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">No se encontraron productos</p>
          <p className="text-sm text-slate-400 mt-1">
            {searchTerm || filterStatus !== 'all' 
              ? 'Intenta con otros términos de búsqueda o filtros' 
              : 'El catálogo está vacío'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {filteredChemicals.map((chem) => (
            <div
              key={chem.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-300 group"
            >
              {/* Card Header */}
              <div className={`px-6 py-4 border-b border-slate-200 ${
                chem.is_banned 
                  ? 'bg-gradient-to-r from-red-50 to-rose-50' 
                  : 'bg-gradient-to-r from-green-50 to-emerald-50'
              }`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {chem.name}
                    </h3>
                  </div>
                  {chem.is_banned ? (
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <ShieldAlert size={20} className="text-red-600" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle size={20} className="text-green-600" />
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                    chem.is_banned 
                      ? 'bg-red-200/80 text-red-800' 
                      : 'bg-green-200/80 text-green-800'
                  }`}>
                    {chem.is_banned ? 'PROHIBIDO' : 'APROBADO'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-6 py-4 space-y-4">
                {/* Ingrediente Activo */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Ingrediente Activo</p>
                  <p className="text-sm text-slate-900 font-medium mt-1">{chem.active_ingredient}</p>
                </div>

                {/* Mercados Prohibidos */}
                {chem.is_banned && chem.banned_markets && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Prohibido en</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {chem.banned_markets.split(',').map((market, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-red-100 text-red-800 font-medium border border-red-200"
                        >
                          {market.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!chem.is_banned && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                    <p className="text-xs text-green-700 font-medium">Seguro para usar en tu región</p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-500">ID: {chem.id.substring(0, 8)}...</span>
                <button className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Ver detalles →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}