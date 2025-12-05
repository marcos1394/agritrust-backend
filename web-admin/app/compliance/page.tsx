"use client";

import { useState } from "react";
import ChemicalForm from "../../components/ChemicalForm";
import ChemicalList from "../../components/ChemicalList";
import { Shield, AlertTriangle, Zap, Lock } from "lucide-react";

export default function CompliancePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'catalog' | 'add'>('catalog');

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setActiveTab('catalog');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* HERO HEADER */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl">
              <Shield size={32} className="text-purple-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Seguridad Fitosanitaria</h1>
              <p className="text-slate-600 mt-1">Gestión integral de agroquímicos y cumplimiento regulatorio</p>
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">Bloqueos Automáticos</p>
                  <p className="text-sm text-blue-900 mt-1">Los productos prohibidos se bloquean en tiempo real</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-700 uppercase tracking-widest">Alertas Inmediatas</p>
                  <p className="text-sm text-red-900 mt-1">Notificación al intento de uso de químicos restringidos</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Lock size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-700 uppercase tracking-widest">Trazabilidad Completa</p>
                  <p className="text-sm text-green-900 mt-1">Auditoría de cada producto utilizado en campo</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS/SECTIONS */}
        <div className="space-y-6">
          <div className="flex gap-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-6 py-3 font-bold text-sm uppercase tracking-widest border-b-2 transition-all duration-200 ${
                activeTab === 'catalog'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Catálogo de Productos
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-6 py-3 font-bold text-sm uppercase tracking-widest border-b-2 transition-all duration-200 ${
                activeTab === 'add'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Agregar Químico
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="animate-fade-in">
            {activeTab === 'catalog' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Catálogo Completo</h2>
                  <p className="text-slate-600">Visualiza y gestiona todos los productos químicos registrados en el sistema</p>
                </div>
                <div key={refreshKey}>
                  <ChemicalList />
                </div>
              </div>
            )}

            {activeTab === 'add' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Registrar Nuevo Producto</h2>
                  <p className="text-slate-600">Agrega un agroquímico al catálogo. Indica si está prohibido en tu región.</p>
                </div>
                <ChemicalForm onSuccess={handleSuccess} />
              </div>
            )}
          </div>
        </div>

        {/* HELP SECTION */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-8">
          <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
            <Shield size={20} className="text-purple-600" />
            ¿Cómo funciona el sistema de Compliance?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-center w-10 h-10 bg-purple-600 text-white rounded-full font-bold mb-3">
                1
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Registra Productos</h4>
              <p className="text-slate-700 text-sm">Ingresa los agroquímicos que usa tu operación agrícola.</p>
            </div>
            <div>
              <div className="flex items-center justify-center w-10 h-10 bg-purple-600 text-white rounded-full font-bold mb-3">
                2
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Marca Restricciones</h4>
              <p className="text-slate-700 text-sm">Indica cuáles están prohibidos en tu mercado.</p>
            </div>
            <div>
              <div className="flex items-center justify-center w-10 h-10 bg-purple-600 text-white rounded-full font-bold mb-3">
                3
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Sistema Bloquea</h4>
              <p className="text-slate-700 text-sm">Automáticamente se bloquea el uso en campo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}