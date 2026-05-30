import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";

import { getEmails } from "../services/api";

export default function InboxScreen({ navigation }: any) {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEmails();
  }, []);

  async function loadEmails() {
    try {
      const data = await getEmails();

      console.log("EMAIL DATA:", data);

      setEmails(data);
    } catch (error) {
      console.log("FETCH ERROR:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function refreshEmails() {
    setRefreshing(true);
    await loadEmails();
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading Inbox...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📬 VoxMail AI</Text>

      <Text style={styles.count}>
        Emails Found: {emails.length}
      </Text>

      <FlatList
        data={emails}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshEmails}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("EmailDetail", {
                id: item.id,
              })
            }
          >
            <Text
              style={styles.subject}
              numberOfLines={2}
            >
              {item.subject}
            </Text>

            <Text
              style={styles.sender}
              numberOfLines={1}
            >
              {item.sender}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No emails found.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8F9FA",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },

  count: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  subject: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },

  sender: {
    fontSize: 13,
    color: "#666",
  },
});