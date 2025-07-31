import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/libs/supabase";
import { getUserRole } from "@/services/authService";
import { getItem } from "@/utils/storage";
import { api } from "@/libs/api";
import { COLORS } from "@/constants/colors";
import * as ImagePicker from "expo-image-picker"; // For media selection

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at?: string;
  sender_username?: string;
  sender_email?: string;
  media_url?: string; // Add for media support
}

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState<{
    id: string | null;
    username?: string;
    email: string | null;
  } | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);

  const checkSessionWithRetry = async (retries = 3, delay = 500) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const storedToken = await getItem("authToken");
        console.log(
          `ChatScreen - Attempt ${attempt} - Stored authToken:`,
          storedToken ? "Found" : "Not found"
        );

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error(
            `ChatScreen - Attempt ${attempt} - Session check error:`,
            error.message
          );
          if (storedToken) {
            console.log(
              `ChatScreen - Attempt ${attempt} - Falling back to stored token`
            );
            const userData = await getUserRole();
            console.log(
              `ChatScreen - Attempt ${attempt} - User data:`,
              userData
            );
            setUser(userData);
            setIsSignedIn(true);
            return true;
          }
          if (attempt === retries) {
            setIsSignedIn(false);
            setUser(null);
            console.log(
              "ChatScreen - All retries failed, navigating to /index"
            );
            router.replace("/index");
            return false;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        if (session) {
          console.log(
            `ChatScreen - Attempt ${attempt} - Session found:`,
            session.user.email,
            session.user.id
          );
          const userData = await getUserRole();
          console.log(`ChatScreen - Attempt ${attempt} - User data:`, userData);
          setUser(userData);
          setIsSignedIn(true);
          return true;
        } else {
          console.log(`ChatScreen - Attempt ${attempt} - No session found`);
          if (storedToken) {
            console.log(
              `ChatScreen - Attempt ${attempt} - Falling back to stored token`
            );
            const userData = await getUserRole();
            console.log(
              `ChatScreen - Attempt ${attempt} - User data:`,
              userData
            );
            setUser(userData);
            setIsSignedIn(true);
            return true;
          }
          if (attempt === retries) {
            setIsSignedIn(false);
            setUser(null);
            console.log(
              "ChatScreen - All retries failed, navigating to /index"
            );
            router.replace("/index");
            return false;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      } catch (error: any) {
        console.error(
          `ChatScreen - Attempt ${attempt} - Error checking session:`,
          error.message
        );
        if (attempt === retries) {
          const storedToken = await getItem("authToken");
          if (storedToken) {
            console.log(
              `ChatScreen - Attempt ${attempt} - Falling back to stored token`
            );
            const userData = await getUserRole();
            console.log(
              `ChatScreen - Attempt ${attempt} - User data:`,
              userData
            );
            setUser(userData);
            setIsSignedIn(true);
            return true;
          }
          setIsSignedIn(false);
          setUser(null);
          console.log("ChatScreen - All retries failed, navigating to /index");
          router.replace("/index");
          return false;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    return false;
  };

  useEffect(() => {
    checkSessionWithRetry();
  }, []);

  useEffect(() => {
    if (isSignedIn && chatId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [isSignedIn, chatId]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets[0].uri) {
      await sendMedia(result.assets[0].uri, "image");
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets[0].uri) {
      await sendMedia(result.assets[0].uri, "image");
    }
  };

  const sendMedia = async (uri: string, type: "image" | "video") => {
    if (!chatId || !isSignedIn || !user?.id) return;
    setSending(true);
    try {
      const fileName = `${Date.now()}_${user.id}.${
        type === "image" ? "jpg" : "mp4"
      }`;
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: fileName,
        type: type === "image" ? "image/jpeg" : "video/mp4",
      } as any);
      formData.append("chat_id", chatId as string);
      formData.append("sender_id", user.id);
      formData.append("type", type);

      const res = await api.post("/messages/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("ChatScreen - Send media response:", res.data);
      fetchMessages();
    } catch (err) {
      console.error("ChatScreen - Error sending media:", err);
    }
    setSending(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !chatId || !isSignedIn) return;
    setSending(true);
    try {
      await api.post("/messages", {
        chat_id: chatId as string,
        message: input,
        type: "text",
        sender_id: user?.id,
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
        item.sender_id === user?.id ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text style={styles.senderLabel}>
        {item.sender_id === user?.id
          ? user?.username || user?.email?.split("@")[0] || "You"
          : item.sender_username || item.sender_email?.split("@")[0] || "Admin"}
      </Text>
      <Text>{item.message}</Text>
      {item.media_url && (
        <Image source={{ uri: item.media_url }} style={styles.mediaPreview} />
      )}
    </View>
  );

  if (isSignedIn === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Please sign in to view the chat</Text>
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
        {loading && messages.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            inverted
            contentContainerStyle={{ paddingBottom: 70, paddingTop: 10 }}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        )}
      </View>
      <View style={styles.inputRowFixed}>
        <TouchableOpacity onPress={pickImage} disabled={sending}>
          <Image
            source={require("@/assets/images/gallery.png")} // Replace with your gallery icon
            style={styles.iconButton}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={takePhoto} disabled={sending}>
          <Image
            source={require("@/assets/images/camera.png")} // Replace with your camera icon
            style={styles.iconButton}
          />
        </TouchableOpacity>
        <TextInput
          value={input}
          onChangeText={setInput}
          style={styles.input}
          placeholder="Type a message..."
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={sending || !isSignedIn}
        >
          <Image
            source={require("@/assets/images/send.png")}
            style={styles.iconButton}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 10,
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  inputRowFixed: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.lightgray,
    padding: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: COLORS.white,
    color: COLORS.text,
  },
  messageBubble: {
    marginVertical: 4,
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  myMessage: {
    backgroundColor: COLORS.myMessage,
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: COLORS.otherMessage,
    alignSelf: "flex-start",
  },
  senderLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  mediaPreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginTop: 5,
  },
  iconButton: {
    width: 30,
    height: 30,
    marginHorizontal: 5,
    tintColor: COLORS.black,
  },
});
