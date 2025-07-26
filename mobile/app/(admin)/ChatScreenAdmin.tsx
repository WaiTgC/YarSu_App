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
import { api } from "@/libs/api";

interface Chat {
  id: string;
  title?: string;
  lastMessage?: string;
}

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at?: string;
}

export default function ChatScreen() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    // Fetch userId from SecureStore
    import("expo-secure-store")
      .then((module) => {
        const SecureStore = module.default;
        SecureStore.getItemAsync("userId")
          .then((id) => setUserId(id))
          .catch((err) =>
            console.error("SecureStore getItemAsync error:", err)
          );
      })
      .catch((err) => console.error("SecureStore import error:", err));

    const fetchData = async () => {
      setLoading(true);
      try {
        const chatsRes = await api.get("/chats"); // Fetch list of chats
        setChats(chatsRes.data || []);
        if (selectedChatId) {
          const messagesRes = await api.get(`/messages/${selectedChatId}`);
          setMessages(messagesRes.data || []);
        }
      } catch (err) {
        console.error("ChatScreen - Error fetching data:", err);
        setChats([]);
        setMessages([]);
      }
      setLoading(false);
    };
    fetchData();

    if (selectedChatId) {
      const interval = setInterval(async () => {
        try {
          const res = await api.get(`/messages/${selectedChatId}`);
          setMessages(res.data || []);
          flatListRef.current?.scrollToEnd({ animated: true });
        } catch (err) {
          console.error("ChatScreen - Error polling messages:", err);
        }
      }, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [selectedChatId]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedChatId) return;
    setSending(true);
    try {
      await api.post("/messages", {
        chat_id: selectedChatId,
        message: input,
        type: "text",
      });
      setInput("");
      const res = await api.get(`/messages/${selectedChatId}`);
      setMessages(res.data || []);
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (err) {
      console.error("ChatScreen - Error sending message:", err);
    }
    setSending(false);
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => setSelectedChatId(item.id)}
    >
      <Text style={styles.chatTitle}>{item.title || `Chat ${item.id}`}</Text>
      <Text style={styles.chatPreview}>
        {item.lastMessage || "No messages yet"}
      </Text>
    </TouchableOpacity>
  );

  const renderMessageItem = ({ item }: { item: Message }) => (
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.container}>
        <View style={styles.chatListContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : (
            <FlatList
              data={chats}
              renderItem={renderChatItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.chatList}
            />
          )}
        </View>
        <View style={styles.messageContainer}>
          {selectedChatId ? (
            <>
              <FlatList
                showsVerticalScrollIndicator={false}
                ref={flatListRef}
                data={messages}
                renderItem={renderMessageItem}
                keyExtractor={(item) => item.id}
                inverted
                contentContainerStyle={{ paddingBottom: 70, paddingTop: 10 }}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
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
                  disabled={sending}
                />
              </View>
            </>
          ) : (
            <View style={styles.noChatSelected}>
              <Text style={styles.noChatText}>
                Select a chat to view messages
              </Text>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    paddingTop: 40,
  },
  chatListContainer: {
    flex: 1,
    marginRight: 10,
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  messageContainer: {
    flex: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  chatList: {
    paddingBottom: 20,
  },
  chatItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  chatPreview: {
    fontSize: 14,
    color: "#666",
  },
  noChatSelected: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noChatText: {
    fontSize: 16,
    color: "#666",
  },
});
