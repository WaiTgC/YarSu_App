import React, { useEffect, useState } from "react";
import { TouchableOpacity, Image, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { api } from "@/libs/api";
import * as SecureStore from "expo-secure-store";

export default function ChatButton() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch userId from SecureStore
    SecureStore.getItemAsync("userId")
      .then((id) => {
        console.log("ChatButton - Retrieved userId:", id); // Debug log
        setUserId(id);
      })
      .catch((error) =>
        console.error("ChatButton - Error fetching userId:", error)
      );
  }, []);

  const handlePress = async () => {
    let currentUserId = userId;

    // If userId is not set, try fetching it again
    if (!currentUserId) {
      try {
        currentUserId = await SecureStore.getItemAsync("userId");
        console.log(
          "ChatButton - Fetched userId in handlePress:",
          currentUserId
        ); // Debug log
        setUserId(currentUserId);
      } catch (error) {
        console.error(
          "ChatButton - Error fetching userId in handlePress:",
          error
        );
      }
    }

    if (!currentUserId) {
      console.error("ChatButton - No userId found");
      return;
    }

    try {
      // Check for existing chat
      const response = await api.get(`/chats?user_id=${currentUserId}`);
      let chatId;

      if (response.data && response.data.length > 0) {
        // Use existing chat
        chatId = response.data[0].id;
      } else {
        // Create a new chat
        const createResponse = await api.post("/chats", {
          user_id: currentUserId,
        });
        chatId = createResponse.data.id;
      }

      // Navigate to ChatScreen with chatId
      const path = "/(root)/ChatScreen";
      console.log("ChatButton - Navigating to:", path, "with chatId:", chatId);
      router.push({ pathname: path, params: { chatId } });
    } catch (error) {
      console.error("ChatButton - Error handling chat navigation:", error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.tab}
      onPress={handlePress}
      {...(Platform.OS !== "web"
        ? { onStartShouldSetResponder: () => true }
        : {})}
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
