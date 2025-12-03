import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Modal, Vibration, Dimensions } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import axios from 'axios';
import { API_URL } from '../constants/config'; // Importación corregida

interface Batch { id: string; batch_code: string; tenant_id: string; crop?: { name: string }; }

export default function HarvestScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  
  // Datos
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(true);

  // 1. Permisos y Carga
  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getPermissions();
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const res = await axios.get(`${API_URL}/harvest-batches`);
      setBatches(res.data);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los lotes. Verifica el backend.");
    }
  };

  // 2. Escaneo
  const handleBarCodeScanned = async ({ data }: { type: string, data: string }) => {
    if (scanned) return;
    if (!selectedBatch) {
      Alert.alert("Atención", "Primero selecciona un Lote.");
      return;
    }

    setScanned(true);
    Vibration.vibrate();

    try {
      const payload = {
        qr_code: data,
        harvest_batch_id: selectedBatch.id,
        weight: 20.0,
        tenant_id: selectedBatch.tenant_id
      };

      await axios.post(`${API_URL}/bins/scan`, payload);
      
      Alert.alert("📦 Caja Registrada", `QR: ${data}\nLote: ${selectedBatch.batch_code}`, [
        { text: 'OK', onPress: () => setScanned(false) }
      ]);
    } catch (error) {
      Alert.alert("Error", "Falló el registro.");
      setScanned(false);
    }
  };

  if (hasPermission === null) return <Text style={styles.centerText}>Pidiendo permiso de cámara...</Text>;
  if (hasPermission === false) return <Text style={styles.centerText}>Sin acceso a la cámara</Text>;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Lote Activo:</Text>
        <TouchableOpacity onPress={() => setShowBatchModal(true)}>
          <Text style={styles.activeBatchText}>
            {selectedBatch ? selectedBatch.batch_code : "Seleccionar..."}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cámara */}
      <View style={styles.cameraContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Overlay Visual */}
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

      <Text style={styles.instructionText}>Enfoque el código QR</Text>
      {scanned && (
        <TouchableOpacity onPress={() => setScanned(false)} style={styles.rescanButton}>
          <Text style={styles.rescanText}>Escanear Otra vez</Text>
        </TouchableOpacity>
      )}

      {/* Modal Lotes */}
      <Modal visible={showBatchModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lotes Abiertos</Text>
            {batches.map(batch => (
              <TouchableOpacity key={batch.id} style={styles.modalItem} onPress={() => { setSelectedBatch(batch); setShowBatchModal(false); }}>
                <Text style={styles.batchCode}>{batch.batch_code}</Text>
                <Text style={styles.batchCrop}>{batch.crop?.name || 'Cultivo...'}</Text>
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
  header: { padding: 20, backgroundColor: '#0f172a', alignItems: 'center' },
  headerLabel: { color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' },
  activeBatchText: { color: '#4ade80', fontSize: 24, fontWeight: 'bold' },
  cameraContainer: { flex: 1, overflow: 'hidden' },
  instructionText: { color: 'white', textAlign: 'center', margin: 20, fontSize: 16 },
  rescanButton: { position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: '#4ade80', padding: 15, borderRadius: 30 },
  rescanText: { fontWeight: 'bold', color: '#064e3b' },
  
  // Overlay Scanner
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