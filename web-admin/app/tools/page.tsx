"use client";

import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, QrCode, Copy, RefreshCw } from "lucide-react";
import { StickerSheet } from "../../components/StickerSheet";

export default function ToolsPage() {
  // Estados del Generador
  const [prefix, setPrefix] = useState("BIN");
  const [quantity, setQuantity] = useState(12);
  const [startFrom, setStartFrom] = useState(1);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  // Referencia para la impresión
  const componentRef = useRef<HTMLDivElement>(null);

  // Hook de impresión
  const handlePrint = useReactToPrint({
    contentRef: componentRef, // Referencia corregida para react-to-print v3+
    // Para versiones viejas de la librería era content: () => componentRef.current
  });

  // Lógica: Generar los códigos en memoria
  const handleGenerate = () => {
    const codes = [];
    for (let i = 0; i < quantity; i++) {
      // Formato: PREFIJO-NUMERO (Ej: BIN-001)
      const num = startFrom + i;
      const paddedNum = num.toString().padStart(4, '0'); // 0001
      codes.push(`${prefix}-${paddedNum}`);
    }
    setGeneratedCodes(codes);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      <header className="flex items-center gap-3 border-b border-gray-200 pb-6">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <QrCode size={32} />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Centro de Impresión</h1>
            <p className="text-slate-500">Generador masivo de etiquetas QR para activos de campo.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQ: CONFIGURACIÓN */}
        <section className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100 h-fit">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                Configuración de Lote
            </h3>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Prefijo del Activo</label>
                    <input 
                        type="text" 
                        className="w-full p-3 border rounded-lg uppercase"
                        value={prefix}
                        onChange={e => setPrefix(e.target.value.toUpperCase())}
                        placeholder="Ej: CAJA, BIN, PALLET"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Cantidad</label>
                        <input 
                            type="number" 
                            className="w-full p-3 border rounded-lg"
                            value={quantity}
                            onChange={e => setQuantity(parseInt(e.target.value))}
                            min={1} max={100}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Iniciar en #</label>
                        <input 
                            type="number" 
                            className="w-full p-3 border rounded-lg"
                            value={startFrom}
                            onChange={e => setStartFrom(parseInt(e.target.value))}
                        />
                    </div>
                </div>

                <button 
                    onClick={handleGenerate}
                    className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition flex justify-center items-center gap-2"
                >
                    <RefreshCw size={18} /> Generar Vista Previa
                </button>

                {generatedCodes.length > 0 && (
                    <div className="pt-4 border-t border-gray-100 animate-fade-in">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center mb-4">
                            <p className="text-green-800 font-bold">{generatedCodes.length} Etiquetas Listas</p>
                            <p className="text-xs text-green-600">Del {generatedCodes[0]} al {generatedCodes[generatedCodes.length-1]}</p>
                        </div>
                        
                        <button 
                            onClick={() => handlePrint()}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition flex justify-center items-center gap-2 shadow-xl"
                        >
                            <Printer size={24} /> IMPRIMIR AHORA
                        </button>
                    </div>
                )}
            </div>
        </section>

        {/* COLUMNA DER: VISTA PREVIA (Papel) */}
        <section className="lg:col-span-2 bg-gray-200 p-8 rounded-xl overflow-y-auto max-h-[800px] flex justify-center">
            
            {generatedCodes.length === 0 ? (
                <div className="text-center text-gray-400 mt-20">
                    <QrCode size={64} className="mx-auto mb-4 opacity-20" />
                    <p>Configura los parámetros y haz clic en Generar</p>
                </div>
            ) : (
                <div className="shadow-2xl">
                    {/* Aquí renderizamos el componente de hoja */}
                    <StickerSheet 
                        ref={componentRef} 
                        codes={generatedCodes} 
                        prefix={prefix} 
                    />
                </div>
            )}

        </section>

      </div>
    </div>
  );
}