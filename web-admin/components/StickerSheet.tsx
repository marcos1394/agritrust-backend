"use client";

import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  codes: string[];
  prefix: string;
}

// Usamos forwardRef para que la librería de impresión pueda "agarrar" este componente
export const StickerSheet = forwardRef<HTMLDivElement, Props>(({ codes, prefix }, ref) => {
  const totalCodes = codes.length;
  const generationDate = new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div ref={ref} className="bg-white text-slate-900 print:p-0">
      
      {/* HEADER - Solo visible al imprimir */}
      <div className="hidden print:block mb-8 px-8 pt-8 pb-6 border-b-2 border-slate-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              AgriTrust
            </h1>
            <p className="text-sm text-slate-600 mt-1">Sistema de Trazabilidad Agrícola</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-700">Lote: {prefix}</p>
            <p className="text-xs text-slate-500">{totalCodes} etiquetas</p>
          </div>
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Generado: {generationDate}</span>
          <span>Impreso: ________</span>
        </div>
      </div>

      {/* Grid de Etiquetas - Optimizado para impresión */}
      <div className="grid grid-cols-3 gap-3 print:gap-2 p-6 print:p-4">
        {codes.map((code, index) => (
          <div 
            key={index} 
            className="relative bg-gradient-to-br from-white to-slate-50 border-2 border-slate-300 p-3 rounded-xl print:rounded-lg print:p-2 flex flex-col items-center justify-center h-44 print:h-40 break-inside-avoid shadow-sm print:shadow-none overflow-hidden"
          >
            {/* Fondo decorativo sutil */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-100 to-transparent opacity-30 rounded-full -mr-10 -mt-10 print:hidden" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-green-100 to-transparent opacity-20 rounded-full -ml-8 -mb-8 print:hidden" />
            
            {/* Contenido */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
              
              {/* Número de serie o índice */}
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-2 print:mb-1">
                #{String(index + 1).padStart(3, '0')}
              </span>
              
              {/* El Código QR */}
              <div className="bg-white p-2 rounded-lg border border-slate-200 print:border-slate-400 mb-2 print:mb-1 shadow-sm print:shadow-none">
                <QRCodeSVG 
                  value={code} 
                  size={90} 
                  level="H"
                  includeMargin={false}
                  fgColor="#0f172a"
                  bgColor="#ffffff"
                />
              </div>
              
              {/* Código legible para humanos */}
              <div className="text-center">
                <span className="font-mono font-bold text-xs print:text-[9px] text-slate-900 break-words">
                  {code}
                </span>
                <p className="text-[8px] print:text-[7px] uppercase tracking-widest text-slate-400 font-medium mt-1 print:mt-0.5">
                  Escanear para Trazabilidad
                </p>
              </div>

              {/* Indicador de autenticidad */}
              <div className="absolute top-1 right-1 print:top-0.5 print:right-0.5 w-3 h-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full print:hidden shadow-sm" />
            </div>

            {/* Líneas de corte - Solo en impresión */}
            <div className="hidden print:block absolute inset-0 border-2 border-dashed border-slate-400 opacity-30 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* FOOTER - Solo visible al imprimir */}
      <div className="hidden print:block mt-8 px-8 pb-8 border-t-2 border-slate-300 text-center">
        <p className="text-xs text-slate-600 leading-relaxed">
          Estas etiquetas contienen códigos QR que vinculan a registros de trazabilidad en el sistema AgriTrust.
          <br />
          Manténgalas intactas y almacénelas en condiciones apropiadas.
        </p>
        <div className="mt-4 flex justify-around text-[10px] text-slate-500">
          <span>Responsable: ________________</span>
          <span>Firma: ________________</span>
          <span>Fecha: ________________</span>
        </div>
      </div>
    </div>
  );
});

StickerSheet.displayName = "StickerSheet";