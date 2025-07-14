import { useClerk } from "@clerk/clerk-expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Alert,
  Pressable,
  Platform,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { COLORS } from "@/constants/colors";
import { styles } from "@/assets/styles/Sidebar.styles";

export const SignOutButton = () => {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    console.log("handleSignOut called, Platform:", Platform.OS);
    try {
      if (Platform.OS === "web") {
        const confirmed = window.confirm("Are you sure you want to logout?");
        console.log("Web confirm result:", confirmed);
        if (!confirmed) {
          console.log("Logout cancelled");
          return;
        }
      } else {
        Alert.alert(
          "Logout",
          "Are you sure you want to logout?",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => console.log("Cancel pressed"),
            },
            {
              text: "Logout",
              style: "destructive",
              onPress: async () => {
                await performSignOut();
              },
            },
          ],
          { cancelable: true, onDismiss: () => console.log("Alert dismissed") }
        );
        return; // Exit to avoid duplicate sign-out on non-web platforms
      }
      await performSignOut();
    } catch (error) {
      console.error("Error in handleSignOut:", error);
      if (Platform.OS === "web") {
        window.alert(`Failed to sign out: ${JSON.stringify(error)}`);
      } else {
        Alert.alert("Error", `Failed to sign out: ${JSON.stringify(error)}`);
      }
    }
  };

  const performSignOut = async () => {
    console.log("Performing sign out");
    try {
      await signOut();
      console.log("Sign out successful");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error; // Re-throw to handle in the caller
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
