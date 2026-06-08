import React from "react";

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {

  const {
    session,
    logout,
  } = useAuth();

  const user =
    session?.user;

  const name =
    user?.user_metadata
      ?.full_name ||
    "User";

  const email =
    user?.email ||
    "";

  const avatar =
    user?.user_metadata
      ?.avatar_url;

  async function handleLogout() {

    await logout();
  }

  return (

    <View style={styles.container}>

      {avatar && (

        <Image
          source={{
            uri: avatar,
          }}
          style={styles.avatar}
        />

      )}

      <Text style={styles.name}>
        {name}
      </Text>

      <Text style={styles.email}>
        {email}
      </Text>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={
          handleLogout
        }
      >

        <Text
          style={
            styles.logoutText
          }
        >
          Logout
        </Text>

      </TouchableOpacity>

    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",

      backgroundColor:
        "#F9FAFB",

      padding: 24,
    },

    avatar: {
      width: 100,
      height: 100,

      borderRadius: 50,

      marginBottom: 20,
    },

    name: {
      fontSize: 24,

      fontWeight: "700",

      color: "#111827",
    },

    email: {
      fontSize: 16,

      color: "#6B7280",

      marginTop: 8,

      marginBottom: 40,
    },

    logoutButton: {
      backgroundColor:
        "#EF4444",

      paddingVertical:
        14,

      paddingHorizontal:
        30,

      borderRadius: 12,
    },

    logoutText: {
      color: "#FFFFFF",

      fontSize: 16,

      fontWeight: "600",
    },
  });