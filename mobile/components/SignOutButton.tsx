import {
  TouchableOpacity,
  Text,
  Platform,
  Modal,
  View,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/libs/supabase";
import { styles } from "@/assets/styles/Sidebar.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constants/colors";
import { getUserRole } from "@/services/authService";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";

export const SignOutButton = () => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { language } = useLanguage();

  useEffect(() => {
    getUserRole()
      .then((userData) => {
        console.log("SignOutButton - User data:", userData);
        setIsAdmin(userData.role === "admin");
      })
      .catch((error) => {
        console.error("SignOutButton - Error fetching user role:", error);
        setIsAdmin(false); // Default to non-admin if role fetch fails
      });
  }, []);

  const handleSignOut = async () => {
    try {
      console.log("SignOutButton - Attempting sign-out");
      await supabase.auth.signOut();
      console.log("SignOutButton - Sign-out successful, navigating to /(auth)");
      router.replace("/(auth)");
    } catch (error) {
      console.error("SignOutButton - Sign-out error:", error);
    }
  };

  const confirmSignOut = () => {
    setModalVisible(true);
  };

  const handleYes = () => {
    setModalVisible(false);
    handleSignOut();
  };

  const handleNo = () => {
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.menuButton,
          styles.logoutButton,
          styles.menuItemContent,
          !isAdmin && { marginTop: 15, marginLeft: 2 }, // Margin for non-admin users
        ]}
        onPress={confirmSignOut}
        {...(Platform.OS !== "web"
          ? { onStartShouldSetResponder: () => true }
          : {})}
      >
        <Ionicons
          name="log-out"
          size={22}
          color={isAdmin ? COLORS.shadow : COLORS.text} // Black for admin, text color for user
        />
        <Text style={styles.menuText}>Log Out</Text>
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={handleNo}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              {labels[language].signOutModalText}
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleYes}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleNo}>
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
