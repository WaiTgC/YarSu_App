// components/SignOutButton.tsx
import { useClerk } from "@clerk/clerk-expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Alert, Text, TouchableOpacity, Platform } from "react-native";
import { COLORS } from "@/constants/colors";
import { styles } from "../assets/styles/home.styles";

interface SignOutButtonProps {
  onSignOut: () => void; // Callback to handle navigation after sign-out
}

export const SignOutButton = ({ onSignOut }: SignOutButtonProps) => {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    console.log("handleSignOut called, Platform:", Platform.OS); // Debug log
    try {
      // Use Platform-specific alert for confirmation
      const showAlert = Platform.select({
        web: () => window.confirm("Are you sure you want to logout?"), // Web uses confirm dialog
        default: () =>
          new Promise((resolve) => {
            Alert.alert(
              "Logout",
              "Are you sure you want to logout?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                  onPress: () => {
                    console.log("Cancel pressed"); // Debug log
                    resolve(false);
                  },
                },
                {
                  text: "Logout",
                  style: "destructive",
                  onPress: () => {
                    console.log("Logout confirmed"); // Debug log
                    resolve(true);
                  },
                },
              ],
              {
                cancelable: true,
                onDismiss: () => {
                  console.log("Alert dismissed"); // Debug dismissal
                  resolve(false);
                },
              }
            );
          }),
      });

      const confirmed = await showAlert;
      if (!confirmed) return;

      console.log("Proceeding with sign out");
      try {
        await signOut(); // Await signOut
        console.log("Sign out successful");
        onSignOut(); // Trigger navigation after successful sign-out
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error signing out:", error.message);
          Alert.alert("Error", `Failed to sign out: ${error.message}`);
        } else {
          console.error("Error signing out:", error);
          Alert.alert("Error", "Failed to sign out due to an unknown error.");
        }
      }
    } catch (error) {
      console.error("Error showing logout alert:", error);
      // Fallback alert for unexpected errors
      const fallbackConfirmed = Platform.select({
        web: window.confirm("Fallback: Are you sure you want to logout?"),
        default: false, // Mobile fallback won't proceed
      });
      if (fallbackConfirmed) {
        try {
          await signOut();
          console.log("Sign out successful via fallback");
          onSignOut();
        } catch (fallbackError) {
          console.error("Fallback sign out error:", fallbackError);
          Alert.alert("Error", "Failed to sign out.");
        }
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.logoutButton}
      onPress={() => {
        console.log("Logout button pressed"); // Debug log
        handleSignOut();
      }}
      accessible={true}
      accessibilityLabel="Sign out button"
    >
      <Ionicons name="log-out-outline" size={22} color={COLORS.text} />
      {Platform.OS === "web" && (
        <Text style={styles.logoutText}>Sign Out</Text> // Optional text for web
      )}
    </TouchableOpacity>
  );
};
