import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { login, register } from "../../src/services/firebase/auth";
import COLORS from "../../src/constants/colors";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

 const handleSubmit = async () => {
  if (!email || !password) {
    Alert.alert('Missing info', 'Please fill in both fields.');
    return;
  }
  setLoading(true);
  try {
    const user = isRegistering 
      ? await register(email, password) 
      : await login(email, password);
    
    if (user && user.uid) {
      console.log("Logged in:", user.uid);
      router.replace('/'); 
    }
  } catch (err) {
    // This safely handles the error object even if it's weirdly formatted
    const msg = err?.message || "Check your credentials or internet.";
    console.error("Login Error:", msg);
    Alert.alert('Login Failed', msg);
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.brand}>SmartSpend</Text>
        <Text style={styles.tagline}>
          Intelligent spending insights for FNB
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.cta}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.ctaTxt}>
              {loading
                ? "Please wait…"
                : isRegistering
                  ? "Create Account"
                  : "Sign In"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
            <Text style={styles.switchTxt}>
              {isRegistering
                ? "Already have an account? Sign in"
                : "New here? Create account"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  inner: { flex: 1, padding: 24, justifyContent: "center" },
  brand: {
    color: COLORS.teal,
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
  },
  tagline: {
    color: "#aaa",
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 32,
  },
  form: { gap: 0 },
  label: { color: "#ccc", fontSize: 10, marginBottom: 4, marginTop: 8 },
  input: {
    backgroundColor: COLORS.black3,
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    marginBottom: 12,
  },
  cta: {
    padding: 14,
    backgroundColor: COLORS.teal,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  ctaTxt: { color: "#fff", fontSize: 13, fontWeight: "700" },
  switchTxt: {
    color: COLORS.teal,
    fontSize: 11,
    textAlign: "center",
    marginTop: 16,
  },
});
