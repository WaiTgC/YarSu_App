import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { api } from "@/libs/apic";
import * as SecureStore from "expo-secure-store";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at?: string;
}

export default function ChatScreen({ route }: any) {
  const { chatId } = route.params || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Fetch userId from SecureStore
    SecureStore.getItemAsync("userId")
      .then((id) => {
        setUserId(id);
      })
      .catch((error) => {
        console.error("ChatScreen - Error fetching userId:", error);
      });

    fetchMessages();

    // Poll for new messages
    const interval = setInterval(async () => {
      try {
        if (!chatId) return;
        const res = await api.get(`/messages/${chatId}`);
        setMessages(res.data || []);
      } catch (err) {
        console.error("ChatScreen - Error polling messages:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [chatId]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      if (!chatId) {
        setMessages([]);
        setLoading(false);
        return;
      }
      const res = await api.get(`/messages/${chatId}`);
      setMessages(res.data || []);
    } catch (err) {
      console.error("ChatScreen - Error fetching messages:", err);
      setMessages([]);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !userId || !chatId) return;
    setSending(true);
    try {
      await api.post("/messages", {
        chat_id: chatId,
        message: input,
        type: "text",
      });
      setInput("");
      fetchMessages();
    } catch (err) {
      console.error("ChatScreen - Error sending message:", err);
    }
    setSending(false);
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender_id === userId ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text style={styles.senderLabel}>
        {item.sender_id === userId ? "You" : "Admin"}
      </Text>
      <Text>{item.message}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{ paddingBottom: 70 }}
        />
        <View style={styles.inputRowFixed}>
          <TextInput
            value={input}
            onChangeText={setInput}
            style={styles.input}
            placeholder="Type a message..."
          />
          <Button
            title={sending ? "Sending..." : "Send"}
            onPress={sendMessage}
            disabled={sending || !input.trim()}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    paddingTop: 40,
  },
  inputRowFixed: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    padding: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  messageBubble: {
    marginVertical: 4,
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  myMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: "#F1F0F0",
    alignSelf: "flex-start",
  },
  senderLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
  },
  loadingText: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 16,
  },
});
