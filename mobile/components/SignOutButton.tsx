import { useClerk } from "@clerk/clerk-expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Alert, Text, TouchableOpacity, Platform } from "react-native";
import { COLORS } from "@/constants/colors";
import { styles } from "../assets/styles/home.styles";

export const SignOutButton = () => {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    console.log("handleSignOut called, Platform:", Platform.OS); // Debug log
    try {
      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => console.log("Cancel pressed"), // Debug log
          },
          {
            text: "Logout",
            style: "destructive",
            onPress: async () => {
              console.log("Logout confirmed"); // Debug log
              try {
                await signOut(); // Await signOut
                console.log("Sign out successful");
              } catch (error) {
                if (error instanceof Error) {
                  console.error("Error signing out:", error.message);
                  Alert.alert("Error", `Failed to sign out: ${error.message}`);
                } else {
                  console.error("Error signing out:", error);
                  Alert.alert(
                    "Error",
                    "Failed to sign out due to an unknown error."
                  );
                }
              }
            },
          },
        ],
        { cancelable: true, onDismiss: () => console.log("Alert dismissed") } // Debug dismissal
      );
    } catch (error) {
      console.error("Error showing logout alert:", error);
      alert("Fallback Alert: Are you sure you want to logout?"); // Fallback for debugging
    }
  };

  return (
    <TouchableOpacity
      style={styles.logoutButton}
      onPress={() => {
        console.log("Logout button pressed"); // Debug log
        handleSignOut();
      }}
    >
      <Ionicons name="log-out-outline" size={22} color={COLORS.text} />
    </TouchableOpacity>
  );
};
