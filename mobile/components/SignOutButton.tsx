// components/SignOutButton.tsx
import { TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/libs/supabase";
import { styles } from "@/assets/styles/Sidebar.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constants/colors";

export const SignOutButton = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/(auth)");
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.menuButton, styles.logoutButton, styles.menuItemContent]}
      onPress={() => {
        handleSignOut();
      }}
    >
      <Ionicons name="log-out" size={22} color={COLORS.shadow} />
      <Text style={styles.menuText}>Log Out</Text>
    </TouchableOpacity>
  );
};
