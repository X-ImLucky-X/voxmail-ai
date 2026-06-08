import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { getTasks, toggleTask } from "../services/api";

type Task = {
  task_id: string;
  task: string;
  subject: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  email_id: string;
  completed: boolean;
};

export default function TaskScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const data: Task[] = await getTasks();

      const priorityOrder = {
        HIGH: 0,
        MEDIUM: 1,
        LOW: 2,
      } as const;

      const sorted = [...data].sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );

      setTasks(sorted);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(taskId: string) {
    try {
      // Optimistically switch the state on frontend for zero-latency feel
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.task_id === taskId ? { ...t, completed: !t.completed } : t
        )
      );
      
      // Fix: Sequential async execution ensures backend updates fully persist 
      await toggleTask(taskId);
      await loadTasks();
    } catch (error) {
      console.log("Toggle status update failed:", error);
      await loadTasks(); // Rollback to server truth if api crashed
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Syncing Action Control...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenHeader}>📋 Action Control Hub</Text>
      
      <FlatList<Task>
        data={tasks}
        keyExtractor={(item) => item.task_id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listPadding}
        renderItem={({ item }: { item: Task }) => {
          const priorityColor = getPriorityColor(item.priority);
          
          return (
            <View style={[styles.card, item.completed && styles.cardCompleted]}>
              <View style={styles.cardHeaderRow}>
                <TouchableOpacity
                  onPress={() => handleToggle(item.task_id)}
                  activeOpacity={0.7}
                  style={styles.checkboxContainer}
                >
                  <View style={[styles.checkboxBase, item.completed && styles.checkboxChecked]}>
                    {item.completed && <View style={styles.checkIconInner} />}
                  </View>
                </TouchableOpacity>

                <View style={styles.textContainer}>
                  <Text style={[styles.task, item.completed && styles.textCompleted]}>
                    {item.task || "(Untitled Task Block)"}
                  </Text>
                  
                  <Text style={styles.subject} numberOfLines={1}>
                    📬 {item.subject || "Source Email Reference"}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooterRow}>
                <View style={[styles.badge, { backgroundColor: `${priorityColor}15` }]}>
                  <Text style={[styles.badgeText, { color: priorityColor }]}>
                    {item.priority}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>✨ Perfect alignment. Zero active actions pending.</Text>
          </View>
        }
      />
    </View>
  );
}

function getPriorityColor(priority: string) {
  switch (priority?.toUpperCase()) {
    case "HIGH":
      return "#EF4444";
    case "MEDIUM":
      return "#F59E0B";
    default:
      return "#10B981";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 20,
    paddingTop: 24,
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
  screenHeader: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  listPadding: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
  },
  cardCompleted: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
    opacity: 0.8,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkboxContainer: {
    paddingRight: 14,
    paddingTop: 2,
  },
  checkboxBase: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  checkIconInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  textContainer: {
    flex: 1,
  },
  task: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 22,
  },
  textCompleted: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  subject: {
    marginTop: 6,
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  cardFooterRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: "#F3F4F6",
    paddingTop: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});