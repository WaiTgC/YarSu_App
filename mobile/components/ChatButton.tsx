import React, { useEffect, useState } from "react";
import { TouchableOpacity, Image, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { api } from "@/libs/api";
import { getItem } from "@/utils/storage";

export default function ChatButton() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch userId from storage
    getItem("userId")
      .then((id) => {
        console.log("ChatButton - Retrieved userId:", id);
        setUserId(id);
      })
      .catch((error) => console.error("ChatButton - Error fetching userId:", error));
  }, []);

  const handlePress = async () => {
    let currentUserId = userId;

    // If userId is not set, try fetching it again
    if (!currentUserId) {
      try {
        currentUserId = await getItem("userId");
        console.log("ChatButton - Fetched userId in handlePress:", currentUserId);
        setUserId(currentUserId);
      } catch (error) {
        console.error("ChatButton - Error fetching userId in handlePress:", error);
      }
    }

    if (!currentUserId) {
      console.error("ChatButton - No userId found");
      return;
    }

    try {
      // Log the auth token for debugging
      const token = await getItem("authToken");
      console.log("ChatButton - Auth token:", token);

      // Fetch the user's chat
      console.log("ChatButton - Fetching chat for userId:", currentUserId);
      const response = await api.get(`/chats?user_id=${currentUserId}`);
      if (!response.data || response.data.length === 0) {
        console.error("ChatButton - No chat found for userId:", currentUserId);
        return;
      }

      const chatId = response.data[0].id;
      console.log("ChatButton - Found chatId:", chatId);

      // Navigate to ChatScreen with chatId
      const path = "/(root)/ChatScreen";
      console.log("ChatButton - Navigating to:", path, "with chatId:", chatId);
      router.push({ pathname: path, params: { chatId } });
    } catch (error: any) {
      console.error("ChatButton - Error handling chat navigation:", error.message, error.response?.data);
    }
  };

  return (
    <TouchableOpacity
      style={styles.tab}
      onPress={handlePress}
      {...(Platform.OS !== "web" ? { onStartShouldSetResponder: () => true } : {})}
    >
      <Image
        source={require("@/assets/images/chatuser.png")}
        style={styles.chatImage}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tab: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  chatImage: {
    width: 40,
    height: 40,
  },
});