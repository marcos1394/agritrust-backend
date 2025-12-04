import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Modal, Vibration } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import axios from 'axios';
import * as Network from 'expo-network'; // <--- NUEVO
import { useAuth } from '@clerk/clerk-expo';
import { API_URL } from '../constants/config';
import { SyncService } from '../constants/SyncService'; // <--- NUEVO

interface Batch { id: string; batch_code: string; tenant_id: string; crop?: { name: string }; }

export default function HarvestScreen() {
  const { getToken } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  
  // Datos
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(true);

  // Estado Offline
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);
  const [syncing, setSyncing] = useState(false);

  // 1. Inicialización
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      checkNetwork();
      updateQueueCount();
      loadBatches();
    })();
  }, []);

  const checkNetwork = async () => {
    const status = await Network.getNetworkStateAsync();
    // Si no es "isConnected" o no es "isInternetReachable", estamos offline
    const offline = !status.isConnected || (status.isInternetReachable === false);
    setIsOffline(offline);
    return offline;
  };

  const updateQueueCount = async () => {
    const count = await SyncService.getQueueSize();
    setPendingSync(count);
  };

  const loadBatches = async () => {
    // Si estamos offline, no podemos cargar lotes nuevos. 
    // *Mejora futura: Guardar lotes en caché también.*
    if (isOffline) return; 

    try {
      const token = await getToken();
      const res = await axios.get(`${API_URL}/harvest-batches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBatches(res.data);
    } catch (error) {
      console.log("Error cargando lotes (posiblemente offline)");
    }
  };

  // 2. Lógica de Escaneo Híbrida
  const handleBarCodeScanned = async ({ data }: { type: string, data: string }) => {
    if (scanned) return;
    if (!selectedBatch) {
      Alert.alert("Atención", "Primero selecciona un Lote.");
      return;
    }

    setScanned(true);
    Vibration.vibrate();

    const payload = {
      qr_code: data,
      harvest_batch_id: selectedBatch.id,
      weight: 20.0,
      tenant_id: selectedBatch.tenant_id
    };

    // VERIFICAR ESTADO DE RED AL MOMENTO DE ESCANEAR
    const currentOffline = await checkNetwork();

    if (currentOffline) {
      // --- MODO OFFLINE ---
      await SyncService.saveToQueue(payload);
      await updateQueueCount();
      Alert.alert("💾 Guardado Offline", `Caja ${data} guardada en memoria. Sincroniza cuando tengas red.`, [
        { text: 'OK', onPress: () => setScanned(false) }
      ]);
    } else {
      // --- MODO ONLINE ---
      try {
        const token = await getToken();
        await axios.post(`${API_URL}/bins/scan`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        Alert.alert("☁️ Subido a la Nube", `Caja ${data} registrada exitosamente.`, [
          { text: 'OK', onPress: () => setScanned(false) }
        ]);
      } catch (error) {
        // Si falla la petición (ej: timeout), guardamos localmente como fallback
        await SyncService.saveToQueue(payload);
        await updateQueueCount();
        setIsOffline(true); // Asumimos que se fue la red
        Alert.alert("⚠️ Red inestable", "No se pudo subir, se guardó localmente.", [
            { text: 'OK', onPress: () => setScanned(false) }
        ]);
      }
    }
  };

  // 3. Función de Sincronización Manual
  const handleSync = async () => {
    if (pendingSync === 0) return;
    
    setSyncing(true);
    const token = await getToken();
    if (!token) return;

    const result = await SyncService.syncNow(token);
    
    setSyncing(false);
    updateQueueCount();

    if (result.success) {
        Alert.alert("Sincronización Completa", `Se subieron ${result.count} cajas.`);
    } else {
        Alert.alert("Sincronización Parcial", `Se subieron ${result.count}. Fallaron ${result.errors}. Revisa tu conexión.`);
    }
  };

  if (hasPermission === null) return <Text style={styles.centerText}>Pidiendo permiso...</Text>;
  if (hasPermission === false) return <Text style={styles.centerText}>Sin acceso a cámara</Text>;

  return (
    <View style={styles.container}>
      {/* HEADER DE ESTADO */}
      <View style={[styles.statusBar, isOffline ? styles.statusOffline : styles.statusOnline]}>
        <Text style={styles.statusText}>
            {isOffline ? "DESCONECTADO (Modo Offline)" : "EN LÍNEA"}
        </Text>
        {/* Botón de Sync si hay pendientes */}
        {pendingSync > 0 && (
            <TouchableOpacity 
                style={styles.syncButton} 
                onPress={handleSync}
                disabled={syncing || isOffline}
            >
                <Text style={styles.syncButtonText}>
                    {syncing ? "Subiendo..." : `Subir ${pendingSync} Pendientes ⬆`}
                </Text>
            </TouchableOpacity>
        )}
      </View>

      <View style={styles.header}>
        <Text style={styles.headerLabel}>Lote Activo:</Text>
        <TouchableOpacity onPress={() => setShowBatchModal(true)}>
          <Text style={styles.activeBatchText}>
            {selectedBatch ? selectedBatch.batch_code : "Seleccionar..."}
          </Text>
        </TouchableOpacity>
      </View>

      {/* CÁMARA */}
      <View style={styles.cameraContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.overlay}>
            <View style={styles.unfocused} />
            <View style={styles.middle}>
                <View style={styles.unfocused} />
                <View style={styles.focused} />
                <View style={styles.unfocused} />
            </View>
            <View style={styles.unfocused} />
        </View>
      </View>

      {/* INSTRUCCIONES */}
      <Text style={styles.instructionText}>
          {isOffline ? "Escanea sin miedo. Se guardará en memoria." : "Enfoque el código QR"}
      </Text>
      
      {scanned && (
        <TouchableOpacity onPress={() => setScanned(false)} style={styles.rescanButton}>
          <Text style={styles.rescanText}>Escanear Otra vez</Text>
        </TouchableOpacity>
      )}

      {/* MODAL LOTES */}
      <Modal visible={showBatchModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lotes Abiertos</Text>
            {batches.length === 0 && <Text style={{textAlign:'center', marginBottom:10}}>Cargando o sin conexión...</Text>}
            {batches.map(batch => (
              <TouchableOpacity key={batch.id} style={styles.modalItem} onPress={() => { setSelectedBatch(batch); setShowBatchModal(false); }}>
                <Text style={styles.batchCode}>{batch.batch_code}</Text>
                <Text style={styles.batchCrop}>{batch.crop?.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowBatchModal(false)}>
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  centerText: { color: 'white', textAlign: 'center', marginTop: 50 },
  
  // Barra de estado superior
  statusBar: { padding: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  statusOnline: { backgroundColor: '#065f46' }, // Verde oscuro
  statusOffline: { backgroundColor: '#991b1b' }, // Rojo oscuro
  statusText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  
  syncButton: { backgroundColor: 'white', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  syncButtonText: { color: '#0f172a', fontWeight: 'bold', fontSize: 12 },

  header: { padding: 15, backgroundColor: '#0f172a', alignItems: 'center' },
  headerLabel: { color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' },
  activeBatchText: { color: '#4ade80', fontSize: 24, fontWeight: 'bold' },
  cameraContainer: { flex: 1, overflow: 'hidden' },
  instructionText: { color: 'white', textAlign: 'center', margin: 20, fontSize: 16 },
  rescanButton: { position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: '#4ade80', padding: 15, borderRadius: 30 },
  rescanText: { fontWeight: 'bold', color: '#064e3b' },
  
  // Overlay
  overlay: { flex: 1 },
  unfocused: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  middle: { flexDirection: 'row', height: 250 },
  focused: { flex: 1.5, borderColor: '#4ade80', borderWidth: 2, borderRadius: 10 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalItem: { backgroundColor: '#f1f5f9', padding: 15, borderRadius: 10, marginBottom: 10 },
  batchCode: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  batchCrop: { fontSize: 14, color: '#64748b' },
  closeButton: { marginTop: 10, padding: 15, alignItems: 'center' },
  closeText: { color: 'red', fontWeight: 'bold' }
});