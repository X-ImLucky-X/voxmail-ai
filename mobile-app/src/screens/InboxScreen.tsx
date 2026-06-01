import React, { useEffect, useState } from "react";
import {
  getDashboard
} from "../services/api";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TextInput,
} from "react-native";

import { getEmails } from "../services/api";

export default function InboxScreen({ navigation }: any) {
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] =
  useState("");

  useEffect(() => {
    loadEmails();
  }, []);

  async function loadEmails() {

    try {
  
      const data =
        await getEmails();
  
      const dashboard =
        await getDashboard();
  
      setEmails(data);
  
      setStats(dashboard);
  
    } catch (error) {
  
      console.log(error);
  
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

  const filteredEmails =
  emails.filter((email) => {

    const searchText =
      search.toLowerCase();

    return (
      email.subject
        ?.toLowerCase()
        .includes(searchText) ||

      email.sender
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📬 VoxMail AI</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Search emails..."
        value={search}
        onChangeText={setSearch}
      />
      <Text style={styles.count}>
        Emails Found: {emails.length}
      </Text>
      <View style={styles.dashboardCard}>

      <Text style={styles.dashboardTitle}>
        📊 Dashboard
      </Text>

      <Text>
        📬 Total Emails:
        {" "}
        {stats.total}
      </Text>

      <Text>
        🔴 High:
        {" "}
        {stats.high}
      </Text>

      <Text>
        🟡 Medium:
        {" "}
        {stats.medium}
      </Text>

      <Text>
        🟢 Low:
        {" "}
        {stats.low}
      </Text>

    </View>
      <FlatList
        data={filteredEmails}
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  marginRight: 8,
                  backgroundColor: getPriorityColor(item.priority),
                }}
              />
              <Text
                style={styles.subject}
                numberOfLines={2}
              >
                {item.subject}
              </Text>
            </View>

            <Text
              style={styles.sender}
              numberOfLines={1}
            >
              {item.sender}
            </Text>

            <Text
              style={{
                fontSize: 12,
                fontWeight: "bold",
                color: getPriorityColor(item.priority),
              }}
            >
              {item.priority?.toUpperCase()}
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

function getPriorityColor(
  priority: string
) {

  switch (
    priority?.toLowerCase()
  ) {

    case "high":
      return "#EF4444";

    case "medium":
      return "#F59E0B";

    default:
      return "#22C55E";
  }
}

const styles = StyleSheet.create({

  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

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

  dashboardCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  
  dashboardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
});