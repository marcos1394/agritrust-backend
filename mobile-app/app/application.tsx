import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Alert, ScrollView, Modal, ActivityIndicator 
} from 'react-native';
import { API_URL } from '../constants/config'; // Importación corregida
import { useAuthenticatedAxios } from '../constants/AuthenticatedAxios';

// Definimos interfaces básicas para TypeScript (opcional pero recomendado)
interface Farm { id: string; name: string; tenant_id: string; }
interface Chemical { id: string; name: string; active_ingredient: string; is_banned: boolean; }

export default function ApplicationScreen() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const axiosAuth = useAuthenticatedAxios(); // <--- NUEVO
  
  
  // Datos del Backend
  const [farms, setFarms] = useState<Farm[]>([]);
  const [chemicals, setChemicals] = useState<Chemical[]>([]);

  // Formulario
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [selectedChem, setSelectedChem] = useState<Chemical | null>(null);
  const [dosage, setDosage] = useState('');

  // Modales de selección
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [showChemModal, setShowChemModal] = useState(false);

  // 1. Cargar Catálogos al iniciar
  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    try {
      // 1. Cargar Químicos
      const chemRes = await axiosAuth.get(`${API_URL}/chemicals`);
      setChemicals(chemRes.data);

      // 2. Cargar Ranchos (Truco: Pedimos tenants primero para obtener un ID válido)
      const tenantRes = await axiosAuth.get(`${API_URL}/tenants`);
      if (tenantRes.data.length > 0) {
        const myTenant = tenantRes.data[0]; 
        const farmRes = await axiosAuth.get(`${API_URL}/farms?tenant_id=${myTenant.id}`);
        setFarms(farmRes.data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron cargar los catálogos. Revisa que el backend esté público.");
    } finally {
      setInitialLoading(false);
    }
  };

  // 2. Enviar Aplicación
  const handleSubmit = async () => {
    if (!selectedFarm || !selectedChem || !dosage) {
      Alert.alert("Faltan datos", "Por favor completa todos los campos.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        tenant_id: selectedFarm.tenant_id,
        farm_id: selectedFarm.id,
        chemical_id: selectedChem.id,
        dosage: parseFloat(dosage),
        unit: "Litros"
      };

      await axiosAuth.post(`${API_URL}/applications`, payload);

      Alert.alert("✅ Registro Exitoso", "La aplicación se guardó en la bitácora.");
      setDosage('');
      setSelectedChem(null);

    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 403) {
           // EL BLOQUEO DEL ESCUDO 🛡️
           Alert.alert("⛔ BLOQUEO DE SEGURIDAD", error.response.data.details || "Producto PROHIBIDO.");
        } else {
           Alert.alert("Error", error.response.data.error || "Ocurrió un error.");
        }
      } else {
        Alert.alert("Error de Red", "No se pudo conectar al servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Componente interno para Modales
  const SelectionModal = ({ visible, items, onClose, onSelect, title }: any) => (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView>
            {items.map((item: any) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.modalItem}
                onPress={() => { onSelect(item); onClose(); }}
              >
                <Text style={styles.modalItemText}>{item.name}</Text>
                {item.active_ingredient && <Text style={styles.modalItemSub}>{item.active_ingredient}</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (initialLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#0f172a" /><Text>Cargando...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Bitácora de Campo</Text>
      <Text style={styles.headerSub}>Nueva Aplicación</Text>

      {/* Inputs */}
      <Text style={styles.label}>1. Seleccionar Rancho</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setShowFarmModal(true)}>
        <Text style={styles.selectorText}>{selectedFarm ? selectedFarm.name : "Toque para seleccionar..."}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>2. Producto Químico</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setShowChemModal(true)}>
        <Text style={styles.selectorText}>{selectedChem ? selectedChem.name : "Toque para seleccionar..."}</Text>
      </TouchableOpacity>
      {selectedChem?.is_banned && <Text style={styles.warningText}>⚠️ ALERTA: Producto Peligroso</Text>}

      <Text style={styles.label}>3. Dosis (Litros/Ha)</Text>
      <TextInput 
        style={styles.input} 
        keyboardType="numeric" 
        placeholder="Ej: 1.5"
        value={dosage}
        onChangeText={setDosage}
      />

      <TouchableOpacity style={[styles.submitButton, loading && styles.disabledButton]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>GUARDAR REGISTRO</Text>}
      </TouchableOpacity>

      {/* Modales */}
      <SelectionModal visible={showFarmModal} items={farms} title="Selecciona el Rancho" onClose={() => setShowFarmModal(false)} onSelect={setSelectedFarm} />
      <SelectionModal visible={showChemModal} items={chemicals} title="Selecciona el Producto" onClose={() => setShowChemModal(false)} onSelect={setSelectedChem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#0f172a' },
  headerSub: { fontSize: 16, color: '#64748b', marginBottom: 30 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 8, marginTop: 15 },
  selector: { backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  selectorText: { fontSize: 16, color: '#0f172a' },
  input: { backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 18 },
  submitButton: { backgroundColor: '#0f172a', padding: 20, borderRadius: 12, marginTop: 40, alignItems: 'center' },
  disabledButton: { opacity: 0.7 },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  warningText: { color: '#ef4444', fontSize: 12, marginTop: 5, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalItemText: { fontSize: 16, color: '#0f172a' },
  modalItemSub: { fontSize: 12, color: '#64748b' },
  closeButton: { marginTop: 20, padding: 15, backgroundColor: '#f1f5f9', borderRadius: 10, alignItems: 'center' },
  closeButtonText: { color: '#0f172a', fontWeight: 'bold' }
});