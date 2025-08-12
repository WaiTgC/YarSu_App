import { Stack, router, useFocusEffect } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useEffect, useCallback } from "react";
import { supabase } from "@/libs/supabase";
import { getUserRole } from "@/services/authService";
import { getItem } from "@/utils/storage";
import { BackHandler } from "react-native";

export default function AuthRoutesLayout() {
  // Prevent authenticated users from accessing auth screens
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const storedToken = await getItem("authToken");
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session || storedToken) {
          // User is already authenticated, redirect them away from auth screens
          try {
            const userData = await getUserRole();
            if (
              userData &&
              userData.id &&
              (userData.role === "user" || userData.role === "admin")
            ) {
              console.log(
                "AuthLayout - Redirecting authenticated user to home"
              );
              router.replace("/home");
            }
          } catch (error) {
            console.error(
              "AuthLayout - Error redirecting authenticated user:",
              error
            );
          }
        }
      } catch (error) {
        console.error("AuthLayout - Error checking auth:", error);
      }
    };

    checkAuthAndRedirect();
  }, []);

  // Handle back button in auth screens
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Allow normal back navigation within auth screens
        // But prevent going back to authenticated screens if somehow accessed
        return false; // Allow default back behavior
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [])
  );

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
      </Stack>
    </KeyboardAwareScrollView>
  );
}
