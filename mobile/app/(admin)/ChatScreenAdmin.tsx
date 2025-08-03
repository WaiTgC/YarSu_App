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
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/libs/supabase";
import * as SecureStore from "expo-secure-store";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at?: string;
  chat_id: string;
}

interface Chat {
  id: string;
  user_id: string;
  created_at: string;
  last_message?: Message;
}

export default function ChatScreenAdmin() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const chatIdFromRoute = params.chatId as string | undefined;
  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    chatIdFromRoute || null
  );
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [adminId, setAdminId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);

  const fetchMessages = async () => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }
    setLoading(false);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, message, created_at, chat_id")
        .eq("chat_id", selectedChatId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error("ChatScreenAdmin - Error fetching messages:", err);
      setMessages([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        const id = await SecureStore.getItemAsync("userId");
        setAdminId(id);

        if (!id || !(await checkAdminRole(id))) {
          console.error("ChatScreenAdmin - No valid admin ID or role");
          setLoading(false);
          router.replace("/(auth)");
          return;
        }

        await fetchChats();
      } catch (error) {
        console.error("ChatScreenAdmin - Error initializing admin:", error);
        setLoading(false);
        router.replace("/(auth)");
      }
    };

    initializeAdmin();
  }, [router]);

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data.role === "admin" || data.role === "superadmin";
  };

  const fetchChats = async () => {
    setLoading(true);
    try {
      const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .select(
          `
          id,
          user_id,
          created_at,
          messages (
            id,
            sender_id,
            message,
            created_at,
            chat_id
          )
        `
        )
        .order("created_at", { ascending: false });

      if (chatError) throw chatError;

      const chatsWithLastMessage = chatData
        .map((chat) => ({
          ...chat,
          last_message:
            chat.messages.length > 0
              ? chat.messages.reduce((latest, current) =>
                  new Date(latest.created_at) > new Date(current.created_at)
                    ? latest
                    : current
                )
              : undefined,
        }))
        .sort(
          (a, b) =>
            (b.last_message?.created_at
              ? new Date(b.last_message.created_at)
              : new Date(b.created_at)) -
            (a.last_message?.created_at
              ? new Date(a.last_message.created_at)
              : new Date(a.created_at))
        );

      setChats(chatsWithLastMessage);
      if (!selectedChatId && chatsWithLastMessage.length > 0) {
        setSelectedChatId(chatsWithLastMessage[0].id);
      }
    } catch (err) {
      console.error("ChatScreenAdmin - Error fetching chats:", err);
      setChats([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [selectedChatId]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedChatId || !adminId) return;
    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        chat_id: selectedChatId,
        sender_id: adminId,
        message: input,
        type: "text",
      });
      if (error) throw error;
      setInput("");
      await fetchMessages(); // Now accessible
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (err) {
      console.error("ChatScreenAdmin - Error sending message:", err);
    }
    setSending(false);
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => setSelectedChatId(item.id)}
    >
      <Text>Chat with {item.user_id.slice(0, 8)}...</Text>
      <Text>
        {item.last_message && item.last_message.created_at
          ? `Last: ${item.last_message.message} (${new Date(
              item.last_message.created_at
            ).toLocaleTimeString()})`
          : "No messages yet"}
      </Text>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender_id === adminId ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text style={styles.senderLabel}>
        {item.sender_id === adminId ? "You (Admin)" : "User"}
      </Text>
      <Text>{item.message}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Chats...</Text>
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
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          horizontal={false}
          style={styles.chatList}
          ListEmptyComponent={<Text>No chats available</Text>}
        />
        {selectedChatId ? (
          <>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              onLayout={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
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
                disabled={sending || !selectedChatId}
              />
            </View>
          </>
        ) : (
          <View style={styles.noChatContainer}>
            <Text style={styles.noChatText}>Select a chat to start</Text>
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
  chatList: {
    maxHeight: 150,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 10,
  },
  chatItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
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
