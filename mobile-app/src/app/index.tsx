import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [ollamaStatus, setOllamaStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // The local loopback URL works perfectly while testing inside your computer's browser
  const BACKEND_URL = 'http://127.0.0.1:8000';

  const checkConnections = async () => {
    setLoading(true);
    try {
      // 1. Fetch the base FastAPI health
      const baseResponse = await fetch(`${BACKEND_URL}/`);
      const baseData = await baseResponse.json();
      setBackendStatus(baseData);

      // 2. Fetch the custom Ollama check endpoint we built
      const ollamaResponse = await fetch(`${BACKEND_URL}/health/ollama`);
      const ollamaData = await ollamaResponse.json();
      setOllamaStatus(ollamaData);
    } catch (error) {
      console.error("Connection failed:", error);
      setBackendStatus({ status: "offline", message: "Cannot reach FastAPI backend." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnections();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>VoxMail AI Dashboard</Text>
      <Text style={styles.subtitle}>Final Year Project Architecture Check</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Backend Status</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#4CAF50" />
        ) : (
          <View>
            <Text style={styles.statusText}>
              API Status: <Text style={backendStatus?.status === 'online' ? styles.online : styles.offline}>
                {backendStatus?.status || 'Unknown'}
              </Text>
            </Text>
            <Text style={styles.infoText}>{backendStatus?.message}</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ollama LLM Status</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#00BCD4" />
        ) : (
          <View>
            <Text style={styles.statusText}>
              Ollama Connection: <Text style={ollamaStatus?.status === 'connected' ? styles.online : styles.offline}>
                {ollamaStatus?.status || 'Offline'}
              </Text>
            </Text>
            {ollamaStatus?.available_models && (
              <Text style={styles.infoText}>
                Loaded Models: {ollamaStatus.available_models.join(', ') || 'None found. Use ollama pull.'}
              </Text>
            )}
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={checkConnections}>
        <Text style={styles.buttonText}>Refresh Diagnostic Check</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb', padding: 24, justifyContent: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1a1f36', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#697386', marginBottom: 24 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#4f46e5', boxShadow: '0px 2px 4px rgba(0,0,0,0.05)' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#3c4257', marginBottom: 8 },
  statusText: { fontSize: 15, fontWeight: '600', color: '#4f566b', marginBottom: 4 },
  infoText: { fontSize: 13, color: '#697386' },
  online: { color: '#2e7d32', fontWeight: 'bold' },
  offline: { color: '#c62828', fontWeight: 'bold' },
  button: { backgroundColor: '#4f46e5', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 }
});