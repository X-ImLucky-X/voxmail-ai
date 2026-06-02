import React, { useEffect, useState } from "react";
import { getDashboard } from "../services/api";
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
    tasks_pending: 0,
    tasks_completed: 0,
  });
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadEmails();
  }, []);

  async function loadEmails() {
    try {
      const data = (await getEmails()) || [];
      const dashboard = await getDashboard();

      const priorityOrder: Record<string, number> = {
        HIGH: 0,
        MEDIUM: 1,
        LOW: 2,
        UNKNOWN: 3,
      };

      const sortedEmails = [...data].sort((a, b) => {
        const priorityDiff =
          priorityOrder[(a.priority || "UNKNOWN").toUpperCase()] -
          priorityOrder[(b.priority || "UNKNOWN").toUpperCase()];

        if (priorityDiff === 0) {
          const timeA = new Date(a.date || a.createdAt || 0).getTime();
          const timeB = new Date(b.date || b.createdAt || 0).getTime();
          return timeB - timeA;
        }

        return priorityDiff;
      });

      setEmails(sortedEmails);
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
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Analyzing Workspace...</Text>
      </View>
    );
  }

  const filteredEmails = emails.filter((email) => {
    const searchText = search.toLowerCase();
    return (
      email.subject?.toLowerCase().includes(searchText) ||
      email.sender?.toLowerCase().includes(searchText)
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>📬 VoxMail AI</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Search intelligence database..."
        placeholderTextColor="#9CA3AF"
        value={search}
        onChangeText={setSearch}
      />
      
      {/* Modern Grid System Dashboard */}
      <View style={styles.dashboardCard}>
        <Text style={styles.dashboardTitle}>📊 Insights Dashboard</Text>
        
        <View style={styles.gridRow}>
          <View style={[styles.gridCell, { borderRightWidth: 1, borderColor: "#F3F4F6" }]}>
            <Text style={styles.gridLabel}>TOTAL VOL.</Text>
            <Text style={styles.gridValue}>{stats.total}</Text>
          </View>
          <View style={[styles.gridCell, { borderRightWidth: 1, borderColor: "#F3F4F6" }]}>
            <Text style={styles.gridLabel}>🔴 CRITICAL</Text>
            <Text style={[styles.gridValue, { color: "#EF4444" }]}>{stats.high}</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.gridLabel}>🟡 ACTIVE</Text>
            <Text style={[styles.gridValue, { color: "#F59E0B" }]}>{stats.medium}</Text>
          </View>
        </View>

        <View style={[styles.gridRow, { borderTopWidth: 1, borderColor: "#F3F4F6", marginTop: 12, paddingTop: 12 }]}>
          <View style={[styles.gridCell, { borderRightWidth: 1, borderColor: "#F3F4F6" }]}>
            <Text style={styles.gridLabel}>🟢 ROUTINE</Text>
            <Text style={[styles.gridValue, { color: "#10B981" }]}>{stats.low}</Text>
          </View>
          <View style={[styles.gridCell, { borderRightWidth: 1, borderColor: "#F3F4F6" }]}>
            <Text style={styles.gridLabel}>⏳ PENDING TASKS</Text>
            <Text style={styles.gridValue}>{stats.tasks_pending}</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.gridLabel}>✅ RESOLVED</Text>
            <Text style={[styles.gridValue, { color: "#10B981" }]}>{stats.tasks_completed}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.tasksButton}
        onPress={() => navigation.navigate("Tasks")}
        activeOpacity={0.8}
      >
        <Text style={styles.tasksButtonText}>📋 Launch Action Control</Text>
      </TouchableOpacity>
      
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.smartInboxTitle}>🔥 Important For You</Text>
        <Text style={styles.count}>{filteredEmails.length} Items</Text>
      </View>
      
      <FlatList
        data={filteredEmails}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshEmails} tintColor="#6366F1" />
        }
        renderItem={({ item }) => {
          const priorityColor = getPriorityColor(item.priority);
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate("EmailDetail", {
                  id: item.id,
                })
              }
            >
              <View style={styles.cardTopRow}>
                <Text style={styles.subject} numberOfLines={1}>
                  {item.subject || "(No Subject)"}
                </Text>
                {/* Modern Pill Badge layout replacing original standalone dot */}
                <View style={[styles.badge, { backgroundColor: `${priorityColor}15` }]}>
                  <Text style={[styles.badgeText, { color: priorityColor }]}>
                    {(item.priority || "UNKNOWN").toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.sender} numberOfLines={1}>
                {item.sender}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Inbox fully triaged. Nice job! ✨</Text>
          </View>
        }
      />
    </View>
  );
}

function getPriorityColor(priority: string) {
  switch (priority?.toLowerCase()) {
    case "high":
      return "#EF4444";
    case "medium":
      return "#F59E0B";
    default:
      return "#10B981";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: "#F9FAFB",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  headerRow: {
    marginBottom: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.6,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 4,
  },
  smartInboxTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.4,
  },
  count: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    textTransform: "uppercase",
  },
  dashboardCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    marginBottom: 14,
  },
  dashboardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
    letterSpacing: -0.1,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  tasksButton: {
    backgroundColor: "#6366F1",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginBottom: 18,
  },
  tasksButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  subject: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  sender: {
    fontSize: 13,
    color: "#6B7280",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
});