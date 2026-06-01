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

  function getReplyText(reply: any) {
    if (!reply) return "";
    if (typeof reply === "string") return reply;
    if (typeof reply === "object" && reply.email) return reply.email;
    return JSON.stringify(reply);
  }

  async function sendReply(replyText: string) {
    // Fix 3: Guard against sending empty reply
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
    // Fix 4: Guard against copying empty reply
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
        <ActivityIndicator size="large" />
        <Text>Analyzing Email...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>Failed to load email.</Text>
      </View>
    );
  }

  const shortReply = getReplyText(data.drafts?.short_reply);
  const professionalReply = getReplyText(data.drafts?.professional_reply);
  const detailedReply = getReplyText(data.drafts?.detailed_reply);

  // Fix 2: Read reply_needed and reason from drafts
  const replyNeeded =data.drafts?.reply_needed ?? true;
  const replyReason =data.drafts?.reason || "This email does not require a response.";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.subject}>{data.email?.subject}</Text>

      <Text style={styles.sectionTitle}>Summary</Text>
      <Text style={styles.content}>{data.analysis?.summary}</Text>

      <Text style={styles.sectionTitle}>Priority</Text>
      <Text style={styles.priority}>{data.analysis?.priority}</Text>

      {/* Fix 1: Show "No action required" when tasks are empty */}
      <Text style={styles.sectionTitle}>Tasks</Text>
      {data.analysis?.tasks?.length > 0 ? (

        data.analysis.tasks.map(
          (task: any, index: number) => {
            const taskText =
              task.description ||
              task.task ||
              task.title ||
              task.action ||
              "";

            const dueDate =
              task.due_date ||
              task.deadline ||
              "";

            return (
              <View
                key={index}
                style={styles.taskCard}
              >
                <Text style={styles.task}>
                  • {taskText}
                </Text>

                {dueDate ? (
                  <Text style={styles.taskDate}>
                    Due: {dueDate}
                  </Text>
                ) : null}
              </View>
            );
          }
        )

      ) : (

        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            ✅ No action required.
          </Text>
        </View>

      )}

      {/* Fix 2: Show "No reply required" when reply_needed is false */}
      <Text style={styles.sectionTitle}>Reply Recommendation</Text>

      {replyNeeded ? (

        <>
          {/* Short Reply */}
          <Text style={styles.sectionTitle}>Short Reply</Text>
          <Text style={styles.reply}>{shortReply}</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyReply(shortReply)}
          >
            <Text style={styles.copyText}>📋 Copy Short Reply</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => saveReplyStyle(shortReply)}
          >
            <Text style={styles.saveText}>⭐ Save Style</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => sendReply(shortReply)}
          >
            <Text style={styles.sendText}>📨 Send Reply</Text>
          </TouchableOpacity>

          {/* Professional Reply */}
          <Text style={styles.sectionTitle}>Professional Reply</Text>
          <Text style={styles.reply}>{professionalReply}</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyReply(professionalReply)}
          >
            <Text style={styles.copyText}>📋 Copy Professional Reply</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => saveReplyStyle(professionalReply)}
          >
            <Text style={styles.saveText}>⭐ Save Style</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => sendReply(professionalReply)}
          >
            <Text style={styles.sendText}>📨 Send Reply</Text>
          </TouchableOpacity>

          {/* Detailed Reply */}
          <Text style={styles.sectionTitle}>Detailed Reply</Text>
          <Text style={styles.reply}>{detailedReply}</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyReply(detailedReply)}
          >
            <Text style={styles.copyText}>📋 Copy Detailed Reply</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => saveReplyStyle(detailedReply)}
          >
            <Text style={styles.saveText}>⭐ Save Style</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => sendReply(detailedReply)}
          >
            <Text style={styles.sendText}>📨 Send Reply</Text>
          </TouchableOpacity>
        </>

      ) : (

        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No reply required.
          </Text>
          <Text style={styles.reasonText}>
            {replyReason}
          </Text>
        </View>

      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8F9FA",
  },

  scrollContent: {
    paddingBottom: 80,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  subject: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },

  content: {
    fontSize: 15,
    lineHeight: 22,
  },

  priority: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#DC2626",
  },

  task: {
    fontSize: 15,
    marginBottom: 2,
  },

  taskCard: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },

  taskDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  reply: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  copyButton: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  copyText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  saveButton: {
    backgroundColor: "#16A34A",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  sendButton: {
    backgroundColor: "#DC2626",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  sendText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  // New styles for empty states
  emptyCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },

  emptyText: {
    fontSize: 15,
    fontWeight: "600",
  },

  reasonText: {
    marginTop: 6,
    color: "#666",
  },
});