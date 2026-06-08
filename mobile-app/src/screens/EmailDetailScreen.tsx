import React, { useEffect, useState } from "react";
import * as Clipboard from "expo-clipboard";

import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

import {
  processEmail,
  saveStyle,
  replyEmail,
} from "../services/api";

export default function EmailDetailScreen({ route }: any) {
  const { id } = route.params;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmail();
  }, []);

  async function loadEmail() {
    try {
      const result = await processEmail(id);
      console.log("EMAIL DETAIL:", result);
      setData(result);
    } catch (error) {
      console.log("ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Improved safely formatted response object unpacker function
  function getReplyText(reply: any) {
    if (!reply) return "";

    if (typeof reply === "string") {
      return reply.trim();
    }

    if (typeof reply === "object") {
      return (
        reply.email ||
        reply.content ||
        reply.text ||
        ""
      ).trim();
    }

    return "";
  }

  async function sendReply(replyText: string) {
    if (!replyText.trim()) {
      Alert.alert(
        "No Reply",
        "This email does not require a reply."
      );
      return;
    }

    try {
      if (!data.email?.sender) {
        Alert.alert(
          "Cannot Send",
          "Sender email not available."
        );
        return;
      }
      const sender = data.email.sender;
      const subject = `Re: ${data.email.subject}`;
      await replyEmail(sender, subject, replyText);
      Alert.alert("Success", "Reply sent successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to send reply.");
    }
  }

  async function copyReply(text: string) {
    if (!text.trim()) {
      Alert.alert(
        "No Reply",
        "No reply available."
      );
      return;
    }

    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Reply copied to clipboard.");
  }

  async function saveReplyStyle(text: string) {
    try {
      await saveStyle(text);
      Alert.alert("Saved", "Writing style saved.");
    } catch (error) {
      Alert.alert("Error", "Failed to save style.");
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Analyzing Executive Context...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load email analysis.</Text>
      </View>
    );
  }

  // Step 1: Injected top-level debug logging metrics
  console.log("SHORT:", data.drafts?.short_reply);
  console.log("PROF:", data.drafts?.professional_reply);
  console.log("DETAIL:", data.drafts?.detailed_reply);

  const shortReply = getReplyText(data.drafts?.short_reply);
  const professionalReply = getReplyText(data.drafts?.professional_reply);
  const detailedReply = getReplyText(data.drafts?.detailed_reply);

  const replyNeeded = data.drafts?.reply_needed ?? true;
  const replyReason = data.drafts?.reason || "This email does not require a response.";
  const priorityColor = getPriorityColor(data.analysis?.priority);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Subject and Header Block */}
      <Text style={styles.subject}>{data.email?.subject || "(No Subject)"}</Text>
      
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>AI CLASSIFICATION</Text>
        <View style={[styles.priorityBadge, { backgroundColor: `${priorityColor}15` }]}>
          <Text style={[styles.priorityBadgeText, { color: priorityColor }]}>
            {(data.analysis?.priority || "LOW").toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Summary Section */}
      <Text style={styles.sectionTitle}>📝 Intel Summary</Text>
      <View style={styles.contentCard}>
        <Text style={styles.content}>{data.analysis?.summary}</Text>
      </View>

      {/* Calendar Suggestion Section */}
      <Text style={styles.sectionTitle}>📅 Calendar Suggestion</Text>
      {data.analysis?.calendar_event?.detected ? (
        <View style={[styles.contentCard, styles.calendarAccentBorder]}>
          <Text style={styles.calendarTitle}>
            {data.analysis.calendar_event.title}
          </Text>
          <View style={styles.calendarMetaRow}>
            <Text style={styles.calendarMetaText}>🗓️ {data.analysis.calendar_event.date}</Text>
            <Text style={styles.calendarMetaText}>⏰ {data.analysis.calendar_event.time}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No calendar events detected in body copy.</Text>
        </View>
      )}

      {/* Tasks Section */}
      <Text style={styles.sectionTitle}>📋 Extracted Action Tasks</Text>
      {data.analysis?.tasks?.length > 0 ? (
        data.analysis.tasks.map((task: any, index: number) => {
          const taskText = task.description || task.task || task.title || task.action || "";
          const dueDate = task.due_date || task.deadline || "";

          return (
            <View key={index} style={styles.taskCard}>
              <View style={styles.taskBulletRow}>
                <Text style={styles.taskBullet}>⚡</Text>
                <Text style={styles.taskText}>{taskText}</Text>
              </View>
              {dueDate ? (
                <Text style={styles.taskDate}>⏱️ Due: {dueDate}</Text>
              ) : null}
            </View>
          );
        })
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>✅ Workspace clear. No operational actions required.</Text>
        </View>
      )}

      {/* Reply Recommendations Engine Section */}
      <Text style={styles.sectionTitle}>🤖 Smart Reply Matrix</Text>
      
      {replyNeeded ? (
        <>
          {/* Variant 1: Short Reply */}
          <View style={styles.draftCard}>
            <View style={styles.draftHeaderRow}>
              <Text style={styles.draftBadgeText}>⚡ SHORT RESPONSE</Text>
            </View>
            <Text style={styles.replyText} selectable>{shortReply}</Text>
            <View style={styles.actionBarRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => copyReply(shortReply)}>
                <Text style={styles.actionBtnText}>📋 Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => saveReplyStyle(shortReply)}>
                <Text style={styles.actionBtnText}>⭐ Save Style</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.sendBtnAccent]} onPress={() => sendReply(shortReply)}>
                <Text style={[styles.actionBtnText, { color: "#FFFFFF" }]}>📨 Send</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Variant 2: Professional Reply */}
          <View style={styles.draftCard}>
            <View style={styles.draftHeaderRow}>
              <Text style={styles.draftBadgeText}>💼 PROFESSIONAL VARIANT</Text>
            </View>
            <Text style={styles.replyText} selectable>{professionalReply}</Text>
            <View style={styles.actionBarRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => copyReply(professionalReply)}>
                <Text style={styles.actionBtnText}>📋 Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => saveReplyStyle(professionalReply)}>
                <Text style={styles.actionBtnText}>⭐ Save Style</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.sendBtnAccent]} onPress={() => sendReply(professionalReply)}>
                <Text style={[styles.actionBtnText, { color: "#FFFFFF" }]}>📨 Send</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Variant 3: Detailed Reply */}
          <View style={styles.draftCard}>
            <View style={styles.draftHeaderRow}>
              <Text style={styles.draftBadgeText}>📝 COMPREHENSIVE DETAILED</Text>
            </View>
            {/* Step 3: Added formatting preservation logic with native selection controls */}
            <Text style={styles.replyText} selectable>{detailedReply}</Text>
            <View style={styles.actionBarRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => copyReply(detailedReply)}>
                <Text style={styles.actionBtnText}>📋 Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => saveReplyStyle(detailedReply)}>
                <Text style={styles.actionBtnText}>⭐ Save Style</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.sendBtnAccent]} onPress={() => sendReply(detailedReply)}>
                <Text style={[styles.actionBtnText, { color: "#FFFFFF" }]}>📨 Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={[styles.emptyText, { marginBottom: 4 }]}>No reply required.</Text>
          <Text style={styles.reasonText}>{replyReason}</Text>
        </View>
      )}
    </ScrollView>
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
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 60,
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
  errorText: {
    fontSize: 15,
    color: "#EF4444",
    fontWeight: "500",
  },
  subject: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
    lineHeight: 30,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingBottom: 16,
    marginBottom: 16,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginTop: 18,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  content: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  calendarAccentBorder: {
    borderLeftWidth: 4,
    borderLeftColor: "#6366F1",
  },
  calendarTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  calendarMetaRow: {
    flexDirection: "row",
    gap: 16,
  },
  calendarMetaText: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500",
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  taskBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  taskBullet: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 1,
  },
  taskText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    flex: 1,
    lineHeight: 20,
  },
  taskDate: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 8,
    paddingLeft: 22,
  },
  draftCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },
  draftHeaderRow: {
    marginBottom: 10,
  },
  draftBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6366F1",
    letterSpacing: 0.5,
  },
  replyText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 12,
  },
  actionBarRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  sendBtnAccent: {
    backgroundColor: "#6366F1",
    borderColor: "#4F46E5",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  reasonText: {
    fontSize: 13,
    color: "#9CA3AF",
    lineHeight: 18,
  },
});