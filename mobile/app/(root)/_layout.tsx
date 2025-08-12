import { Stack, router, useFocusEffect } from "expo-router";
import { useEffect, useCallback } from "react";
import { supabase } from "@/libs/supabase";
import { getUserRole } from "@/services/authService";
import { getItem } from "@/utils/storage";
import { BackHandler, StatusBar } from "react-native";
import AppLayout from "@/components/AppLayout";
import SafeScreen from "@/components/SafeScreen";

export default function RootRoutesLayout() {
  // Ensure only authenticated users can access root screens
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const storedToken = await getItem("authToken");
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session && !storedToken) {
          // User is not authenticated, redirect to welcome screen
          console.log(
            "RootRoutesLayout - User not authenticated, redirecting to welcome"
          );
          router.replace("/(auth)");
          return;
        }

        // Verify the user data is valid
        try {
          const userData = await getUserRole();
          if (!userData || !userData.id) {
            // Invalid user data, redirect to welcome
            console.log(
              "RootRoutesLayout - Invalid user data, redirecting to welcome"
            );
            router.replace("/(auth)");
          } else {
            console.log(
              "RootRoutesLayout - User authenticated:",
              userData.email
            );
          }
        } catch (error) {
          console.error("RootRoutesLayout - Error verifying user data:", error);
          router.replace("/(auth)");
        }
      } catch (error) {
        console.error("RootRoutesLayout - Error checking auth:", error);
        router.replace("/(auth)");
      }
    };

    checkAuthAndRedirect();
  }, []);

  // Handle back button in root screens to prevent going back to auth screens
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // For authenticated users in root screens, prevent going back to auth screens
        // Allow normal navigation within the root screens
        // The individual screens can handle their own back navigation logic
        return false; // Allow default back behavior within root screens
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [])
  );

  return (
    <SafeScreen>
      <AppLayout>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="home"
            options={{
              gestureEnabled: false, // Disable swipe back gesture
            }}
          />
          <Stack.Screen
            name="ChatScreen"
            options={{
              title: "Chat",
              gestureEnabled: true, // Allow swipe back to home
            }}
          />
          {/* Add other root screens here */}
        </Stack>
      </AppLayout>
      <StatusBar style="auto" />
    </SafeScreen>
  );
}
