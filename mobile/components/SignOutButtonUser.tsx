import { TouchableOpacity, Text, Platform, Modal, View } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/libs/supabase";
import { styles } from "@/assets/styles/Sidebar.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constants/colors";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";

export const SignOutButtonUser = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const { language } = useLanguage();

  const handleSignOut = async () => {
    try {
      console.log("SignOutButtonUser - Attempting sign-out");
      await supabase.auth.signOut();
      console.log(
        "SignOutButtonUser - Sign-out successful, navigating to /(auth)"
      );
      router.replace("/(auth)");
    } catch (error) {
      console.error("SignOutButtonUser - Sign-out error:", error);
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
          { marginTop: 15, marginLeft: 2 }, // Consistent margin for users
        ]}
        onPress={confirmSignOut}
        {...(Platform.OS !== "web"
          ? { onStartShouldSetResponder: () => true }
          : {})}
      >
        <Ionicons
          name="log-out"
          size={22}
          color={COLORS.text} // Standard text color for users
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
