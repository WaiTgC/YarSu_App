import { Stack } from "expo-router";
import SafeScreen from "@/components/SafeScreen";
import { supabase } from "@/libs/supabase";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { styles } from "@/assets/styles/auth.styles";
import { StatusBar } from "expo-status-bar";
import { LanguageProvider } from "@/context/LanguageContext";

export default function Layout() {
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        console.log("Checking session...");
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session) {
          console.log("Session found, but staying on index.tsx");
          // Optionally handle session-based navigation here if needed
        } else {
          console.log("No session found, showing index.tsx");
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        if (isMounted) setIsCheckingSession(false);
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isCheckingSession) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </LanguageProvider>
  );
}
