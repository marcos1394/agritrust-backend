import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router'; // <--- LA NUEVA FORMA DE NAVEGAR

export default function MenuScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.menuContainer}>
        <Text style={styles.title}>AgriTrust Móvil</Text>
        <Text style={styles.subtitle}>Seleccione Operación</Text>

        {/* NAVEGACIÓN CON EXPO ROUTER */}
        <TouchableOpacity style={styles.card} onPress={() => router.push('/application')}>
          <Text style={styles.cardIcon}>🛡️</Text>
          <Text style={styles.cardTitle}>Fitosanidad</Text>
          <Text style={styles.cardDesc}>Registrar aplicaciones y validar químicos.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/harvest')}>
          <Text style={styles.cardIcon}>📦</Text>
          <Text style={styles.cardTitle}>Cosecha (Scanner)</Text>
          <Text style={styles.cardDesc}>Escanear bins y trazar origen.</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  menuContainer: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#0f172a', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 40 },
  card: { 
    backgroundColor: 'white', padding: 25, borderRadius: 20, marginBottom: 20,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10
  },
  cardIcon: { fontSize: 40, marginBottom: 10 },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  cardDesc: { color: '#64748b', marginTop: 5 },
});