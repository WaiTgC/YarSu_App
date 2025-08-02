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
import { api } from "@/libs/api";
import * as SecureStore from "expo-secure-store";
import { useRouter, useLocalSearchParams } from "expo-router";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at?: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const chatIdFromRoute = params.chatId as string | undefined;
  const [chatId, setChatId] = useState<string | null>(chatIdFromRoute || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Fetch userId from SecureStore
        const id = await SecureStore.getItemAsync("userId");
        setUserId(id);

        if (!id) {
          console.error("ChatScreen - No userId found");
          setLoading(false);
          router.replace("/(auth)");
          return;
        }

        // If no chatId was passed, check for or create a chat
        if (!chatIdFromRoute) {
          const response = await api.get(`/chats?user_id=${id}`);
          if (response.data && response.data.length > 0) {
            setChatId(response.data[0].id);
          } else {
            const createResponse = await api.post("/chats", { user_id: id });
            setChatId(createResponse.data.id);
          }
        }
      } catch (error) {
        console.error("ChatScreen - Error initializing chat:", error);
        setLoading(false);
        router.replace("/(auth)");
      }
    };

    initializeChat();
  }, [chatIdFromRoute, router]);

  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/messages/${chatId}`);
        setMessages(res.data || []);
      } catch (err) {
        console.error("ChatScreen - Error fetching messages:", err);
        setMessages([]);
      }
      setLoading(false);
    };

    fetchMessages();

    // Poll for new messages
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/messages/${chatId}`);
        setMessages(res.data || []);
        flatListRef.current?.scrollToEnd({ animated: true });
      } catch (err) {
        console.error("ChatScreen - Error polling messages:", err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [chatId]);

  const sendMessage = async () => {
    if (!input.trim() || !chatId) return;
    setSending(true);
    try {
      await api.post("/messages", {
        chat_id: chatId,
        message: input,
        type: "text",
      });
      setInput("");
      const res = await api.get(`/messages/${chatId}`);
      setMessages(res.data || []);
      flatListRef.current?.scrollToEnd({ animated: true });
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
        <Text>Loading Chat...</Text>
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
        {chatId ? (
          <>
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
                disabled={sending || !chatId}
              />
            </View>
          </>
        ) : (
          <View style={styles.noChatContainer}>
            <Text style={styles.noChatText}>Unable to load chat</Text>
          </View>
        )}
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
  noChatContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noChatText: {
    fontSize: 16,
    color: "#666",
  },
});