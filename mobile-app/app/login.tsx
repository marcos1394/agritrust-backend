import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      // 1. Intentar loguear con Clerk
      const completeSignIn = await signIn.create({
        identifier: email,
        password,
      });

      // 2. Si es exitoso, activar la sesión
      await setActive({ session: completeSignIn.createdSessionId });
      
      // 3. Navegar al menú principal (El _layout se encargará, pero por seguridad redirigimos)
      router.replace("/");
      
    } catch (err: any) {
      Alert.alert("Error de Acceso", err.errors[0]?.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AgriTrust</Text>
      <Text style={styles.subtitle}>Terminal Móvil</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput
          autoCapitalize="none"
          value={email}
          placeholder="capataz@agritrust.com"
          onChangeText={setEmail}
          style={styles.input}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          value={password}
          placeholder="••••••"
          secureTextEntry={true}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity onPress={onSignInPress} style={styles.button} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>INICIAR SESIÓN</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#0f172a" },
  title: { fontSize: 40, fontWeight: "bold", color: "#4ade80", textAlign: "center", marginBottom: 5 },
  subtitle: { fontSize: 18, color: "#94a3b8", textAlign: "center", marginBottom: 50 },
  form: { backgroundColor: "white", padding: 20, borderRadius: 20 },
  label: { fontWeight: "bold", marginBottom: 5, color: "#334155" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 16 },
  button: { backgroundColor: "#0f172a", padding: 18, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});