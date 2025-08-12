import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { styles } from "@/assets/styles/auth.styles";
import { supabase } from "@/libs/supabase";
import { getUserRole } from "@/services/authService";
import { getItem } from "@/utils/storage";

export default function Index() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status immediately when component mounts
  useEffect(() => {
    const checkAuthenticationAndRedirect = async () => {
      try {
        console.log("Index - Checking authentication status...");

        // Check for stored token first
        const storedToken = await getItem("authToken");

        // Check Supabase session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (session || storedToken) {
          // User is authenticated, verify user data and redirect
          try {
            const userData = await getUserRole();
            if (
              userData &&
              userData.id &&
              (userData.role === "user" || userData.role === "admin")
            ) {
              console.log("Index - User is authenticated, redirecting to home");
              setIsAuthenticated(true);
              // Immediately redirect to home screen
              router.replace("/(root)/home");
              return;
            }
          } catch (userError) {
            console.error("Index - Error getting user data:", userError);
            // If user data is invalid, clear tokens and stay on index
            await removeItem("authToken");
            await removeItem("userId");
          }
        }

        // User is not authenticated, show the welcome screen
        console.log(
          "Index - User is not authenticated, showing welcome screen"
        );
        setIsAuthenticated(false);
      } catch (error) {
        console.error("Index - Error checking authentication:", error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthenticationAndRedirect();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Index - Auth state changed:", event);

      if (event === "SIGNED_IN" && session) {
        // User just signed in, redirect to home
        try {
          const userData = await getUserRole();
          if (
            userData &&
            userData.id &&
            (userData.role === "user" || userData.role === "admin")
          ) {
            console.log("Index - User signed in, redirecting to home");
            router.replace("/(root)/home");
          }
        } catch (error) {
          console.error("Index - Error after sign in:", error);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleTapHere = () => {
    router.push("/(auth)");
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        {/* <Text style={styles.welcomeText}>Loading...</Text> */}
      </View>
    );
  }

  // If user is authenticated, don't show anything (they should be redirected)
  if (isAuthenticated) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        {/* <Text style={styles.welcomeText}>Redirecting...</Text> */}
      </View>
    );
  }

  // Only show welcome screen for unauthenticated users
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/YarSu.png")}
        style={styles.illustration}
      />
      <TouchableOpacity onPress={handleTapHere}>
        <Text style={styles.taphere}>Tap Here</Text>
      </TouchableOpacity>
    </View>
  );
}
