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
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/libs/supabase";
import * as SecureStore from "expo-secure-store";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at?: string;
}

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId?: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    // Fetch userId from SecureStore
    SecureStore.getItemAsync("userId").then((id) => setUserId(id));
    fetchMessages();
    // Poll for new messages
    const interval = setInterval(async () => {
      if (!chatId) return;
      await fetchMessages();
    }, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [chatId]);

  const fetchMessages = async () => {
    setLoading(false);
    try {
      if (!chatId) {
        setMessages([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, message, created_at")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error("Fetch messages error:", err);
      setMessages([]);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !userId) return;
    setSending(true);
    try {
      if (!chatId) {
        setSending(false);
        return;
      }
      const { error } = await supabase.from("messages").insert({
        chat_id: chatId,
        sender_id: userId,
        message: input,
        type: "text",
      });
      if (error) throw error;
      setInput("");
      await fetchMessages();
    } catch (err) {
      console.error("Send message error:", err);
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
        {item.sender_id === userId ? "You" : "Other"}
      </Text>
      <Text>{item.message}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
    >
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            contentContainerStyle={{ paddingBottom: 70 }}
            ListEmptyComponent={<Text>No messages yet</Text>}
          />
        )}
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
            disabled={sending}
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
});
