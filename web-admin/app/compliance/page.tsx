"use client";

import { useState } from "react";
import ChemicalForm from "../../components/ChemicalForm"; // Importamos el Formulario
import ChemicalList from "../../components/ChemicalList"; // Importamos la Lista
import { API_URL } from '../../utils/api'; // Ajusta la ruta según donde lo creaste

export default function CompliancePage() {
  // Este estado simple servirá para forzar la recarga de la lista
  // Cada vez que cambie el número, la lista volverá a pedir datos
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1); // Incrementamos para recargar
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Seguridad Fitosanitaria</h1>
        <p className="text-gray-600">
          Gestione el catálogo de agroquímicos. Los productos marcados como 
          <span className="text-red-600 font-bold"> PROHIBIDOS</span> generarán bloqueos automáticos en la App de campo.
        </p>
      </header>

      {/* 1. El Formulario de Alta */}
      <ChemicalForm onSuccess={handleSuccess} />
      
      {/* 2. La Lista de Productos (Le pasamos la key para que se refresque) */}
      <div key={refreshKey}>
         <ChemicalList />
      </div>
      
    </div>
  );
}