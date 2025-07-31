import { Stack } from "expo-router";
import SafeScreen from "@/components/SafeScreen";
import { supabase } from "@/libs/supabase";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StatusBar } from "react-native";
import { styles } from "@/assets/styles/auth.styles";
import AppLayout from "@/components/AppLayout";
import { LanguageProvider } from "@/context/LanguageContext";
import { UserProvider } from "@/context/UserContext";

export default function RootLayout() {
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        console.log("RootLayout - Checking session...");
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (error) {
          console.error("RootLayout - Session check error:", error.message);
        } else if (session) {
          console.log(
            "RootLayout - Session found:",
            session.user.email,
            session.user.id
          );
        } else {
          console.log("RootLayout - No session found");
        }
      } catch (error: any) {
        console.error("RootLayout - Error checking session:", error.message);
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
        <Text style={styles.welcomeText}>Loading...</Text>
      </View>
    );
  }

  return (
    <UserProvider>
      <SafeScreen>
        <AppLayout>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="home" />
          </Stack>
        </AppLayout>
        <StatusBar style="auto" />
      </SafeScreen>
    </UserProvider>
  );
}
