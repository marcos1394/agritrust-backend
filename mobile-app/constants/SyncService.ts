import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from './config';

const QUEUE_KEY = 'offline_harvest_queue';

// Tipo de dato para la cola
interface PendingScan {
  id: string; // ID temporal
  payload: any;
  timestamp: number;
}

export const SyncService = {
  // 1. Guardar en la cola local (Cuando no hay internet)
  async saveToQueue(payload: any) {
    try {
      const currentQueueRaw = await AsyncStorage.getItem(QUEUE_KEY);
      const currentQueue: PendingScan[] = currentQueueRaw ? JSON.parse(currentQueueRaw) : [];
      
      const newItem: PendingScan = {
        id: Date.now().toString(), // ID único basado en tiempo
        payload,
        timestamp: Date.now(),
      };

      currentQueue.push(newItem);
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(currentQueue));
      return currentQueue.length; // Devolvemos cuántos hay pendientes
    } catch (e) {
      console.error("Error guardando offline", e);
      return -1;
    }
  },

  // 2. Obtener tamaño de la cola (Para mostrar el globito rojo)
  async getQueueSize() {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw).length : 0;
  },

  // 3. Sincronizar (Subir todo a la nube)
  async syncNow(token: string) {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return { success: true, count: 0, errors: 0 };

    const queue: PendingScan[] = JSON.parse(raw);
    if (queue.length === 0) return { success: true, count: 0, errors: 0 };

    let uploadedCount = 0;
    let errorCount = 0;
    const failedItems: PendingScan[] = [];

    // Iteramos y subimos uno por uno (o podrías hacer un endpoint bulk en el backend)
    for (const item of queue) {
      try {
        await axios.post(`${API_URL}/bins/scan`, item.payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        uploadedCount++;
      } catch (error) {
        console.error("Error subiendo item", item.id);
        errorCount++;
        failedItems.push(item); // Si falla, lo regresamos a la cola para intentar luego
      }
    }

    // Guardamos solo los que fallaron (o vaciamos si todo salió bien)
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(failedItems));

    return { 
      success: errorCount === 0, 
      count: uploadedCount, 
      errors: errorCount,
      remaining: failedItems.length
    };
  }
};