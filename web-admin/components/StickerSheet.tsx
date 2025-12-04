"use client";

import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  codes: string[];
  prefix: string;
}

// Usamos forwardRef para que la librería de impresión pueda "agarrar" este componente
export const StickerSheet = forwardRef<HTMLDivElement, Props>(({ codes, prefix }, ref) => {
  return (
    <div ref={ref} className="p-8 bg-white text-black print:p-0">
      
      {/* Encabezado solo visible al imprimir */}
      <div className="hidden print:block mb-4 text-center">
        <h2 className="text-xl font-bold">Propiedad de AgriTrust - {prefix}</h2>
        <p className="text-sm">Lote de Etiquetas Generado: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Grid de Etiquetas (Ajustado para papel de etiquetas estándar 3x4 o similar) */}
      <div className="grid grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
        {codes.map((code, index) => (
          <div 
            key={index} 
            className="border-2 border-black border-dashed p-2 rounded-lg flex flex-col items-center justify-center h-40 break-inside-avoid"
          >
            {/* El Código QR */}
            <QRCodeSVG value={code} size={100} level="H" />
            
            {/* Texto legible para humanos */}
            <span className="mt-2 font-mono font-bold text-lg">{code}</span>
            <span className="text-[10px] uppercase tracking-wider">Escanear para Trazabilidad</span>
          </div>
        ))}
      </div>
    </div>
  );
});

StickerSheet.displayName = "StickerSheet";