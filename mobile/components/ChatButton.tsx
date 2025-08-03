import { View, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { supabase } from "@/libs/supabase";
import { getItem } from "@/utils/storage";

export default function ChatButton() {
  const router = useRouter();
  const [chatId, setChatId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrCreateChat = async () => {
      const userId = await getItem("userId");
      if (!userId) {
        console.log("ChatButton - No userId found");
        setIsLoading(false);
        return;
      }

      console.log("ChatButton - Fetching chat for userId:", userId);
      const { data, error } = await supabase
        .from("chats")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows
          console.log("ChatButton - No chat found for userId:", userId);
          const { data: newChat, error: createError } = await supabase
            .from("chats")
            .insert({ user_id: userId })
            .select("id")
            .single();
          if (createError) {
            console.error(
              "ChatButton - Error creating chat:",
              createError.message
            );
          } else {
            console.log("ChatButton - Chat created, chatId:", newChat.id);
            setChatId(newChat.id);
          }
        } else {
          console.error("ChatButton - Error fetching chat:", error.message);
        }
      } else {
        console.log("ChatButton - Chat found, chatId:", data.id);
        setChatId(data.id);
      }
      setIsLoading(false);
    };

    fetchOrCreateChat();
  }, []);

  const handlePress = async () => {
    if (isLoading) {
      console.log("ChatButton - Still loading, please wait");
      return;
    }
    if (chatId) {
      console.log("ChatButton - Navigating to ChatScreen with chatId:", chatId);
      router.push(`/ChatScreen?chatId=${chatId}`);
    } else {
      setIsLoading(true);
      console.log("ChatButton - No chatId, re-fetching...");
      const userId = await getItem("userId");
      const { data, error } = await supabase
        .from("chats")
        .select("id")
        .eq("user_id", userId)
        .single();
      if (error && error.code !== "PGRST116") {
        console.error("ChatButton - Error re-fetching chat:", error.message);
      } else if (data) {
        setChatId(data.id);
        router.push(`/ChatScreen?chatId=${data.id}`);
      } else {
        console.log("ChatButton - Still no chat found, creating one...");
        const { data: newChat, error: createError } = await supabase
          .from("chats")
          .insert({ user_id: userId })
          .select("id")
          .single();
        if (createError) {
          console.error(
            "ChatButton - Error creating chat:",
            createError.message
          );
        } else {
          setChatId(newChat.id);
          router.push(`/ChatScreen?chatId=${newChat.id}`);
        }
      }
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={{ padding: 10 }}>
      {isLoading ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <Text>Chat</Text>
      )}
    </TouchableOpacity>
  );
}
