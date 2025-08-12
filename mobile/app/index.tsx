import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";
import { styles } from "@/assets/styles/auth.styles";
import { supabase } from "@/libs/supabase";
import { getUserRole } from "@/services/authService";
import { getItem } from "@/utils/storage";

export default function Index() {
  // Check if user is already authenticated when component mounts
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const storedToken = await getItem("authToken");
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session || storedToken) {
          // User is already authenticated, redirect to home screen
          try {
            const userData = await getUserRole();
            if (
              userData &&
              userData.id &&
              (userData.role === "user" || userData.role === "admin")
            ) {
              console.log(
                "Index - User already authenticated, redirecting to home"
              );
              router.replace("/home");
            }
          } catch (error) {
            console.error("Index - Error checking existing auth:", error);
          }
        }
      } catch (error) {
        console.error("Index - Error checking authentication:", error);
      }
    };

    checkExistingAuth();
  }, []);

  const handleTapHere = () => {
    router.push("/(auth)");
  };

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
