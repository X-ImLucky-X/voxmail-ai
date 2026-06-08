import React from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { supabase } from "../lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  // Fix: Lifted hook initialization to the top level of the component block
  const navigation = useNavigation<any>();

  async function signIn() {
    const redirectTo = "voxmail://";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.log(error);
      return;
    }

    if (data.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );
      
      if (result.type === "success" && result.url) {
        const hash = result.url.split("#")[1];
      
        if (hash) {
          const params = new URLSearchParams(hash);
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");
      
          if (access_token && refresh_token) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
      
            if (sessionError) {
              console.log(sessionError);
            } else {
              console.log("Logged in successfully");
            }
          }
        }
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.brandingBlock}>
        <Text style={styles.title}>📬 VoxMail AI</Text>
        <Text style={styles.subtitle}>
          Your intelligent workspace executive assistant
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={signIn}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 60,
  },
  brandingBlock: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#6366F1", // Unified premium AI-Indigo accent brand color
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
});