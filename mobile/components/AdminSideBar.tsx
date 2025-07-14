import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, Animated, Image } from "react-native";
import { SignOutButton } from "@/components/SignOutButton";
import { useState, useEffect, useRef } from "react";
import { styles } from "@/assets/styles/adminstyles/Sidebar.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";
import { Language } from "@/libs/language";

interface AdminSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const AdminSidebar = ({ isOpen, toggleSidebar }: AdminSidebarProps) => {
  const router = useRouter();
  const { user } = useUser();
  const { language, setLanguage } = useLanguage();
  const translateX = useRef(new Animated.Value(isOpen ? 0 : -250)).current;

  useEffect(() => {
    return Animated.timing(translateX, {
      toValue: isOpen ? 0 : -250,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  const handleChangePassword = () => {
    router.push("/change-password");
    toggleSidebar();
  };

  const handleEditProfile = () => {
    router.push("/edit-profile");
    toggleSidebar();
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    toggleSidebar();
  };

  return (
    <>
      {isOpen && (
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 99,
          }}
          onPress={toggleSidebar}
          activeOpacity={1}
        />
      )}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX }],
            width: 250,
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            zIndex: 100,
            backgroundColor: COLORS.background,
            shadowColor: COLORS.text,
            shadowOffset: { width: 2, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
          },
        ]}
      >
        <View style={styles.sidebarHeader}>
          <SignedIn>
            <View style={styles.userContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.username?.slice(0, 2).toUpperCase() ||
                    user?.emailAddresses[0].emailAddress
                      .slice(0, 2)
                      .toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.welcomeText}>Welcome,</Text>
                <Text style={styles.usernameText}>
                  {user?.username || user?.emailAddresses[0].emailAddress}
                </Text>
              </View>
            </View>
          </SignedIn>
          <SignedOut>
            <Text style={styles.welcomeText}>Please sign in</Text>
          </SignedOut>
          <TouchableOpacity style={styles.closeButton} onPress={toggleSidebar}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        <View style={styles.sidebarContent}>
          <TouchableOpacity
            style={styles.groupLabel}
            onPress={() => router.push("/(admin)/dashboard")}
          >
            <Text style={styles.menuText}>Dashboard</Text>
          </TouchableOpacity>
          <View style={styles.sidebarGroup}>
            <Text style={styles.groupLabel}>Account</Text>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleEditProfile}
            >
              <View style={styles.menuItemContent}>
                <Ionicons name="person" size={20} color={COLORS.shadow} />
                <Text style={styles.menuText}>Edit Profile</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleChangePassword}
            >
              <View style={styles.menuItemContent}>
                <Ionicons name="lock-closed" size={20} color={COLORS.shadow} />
                <Text style={styles.menuText}>Change Password</Text>
              </View>
            </TouchableOpacity>

            <SignOutButton />

            <View style={styles.lanButton}>
              <TouchableOpacity onPress={() => handleLanguageChange("my")}>
                <Image
                  source={require("@/assets/images/MY.png")}
                  style={[styles.logo]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View style={styles.separatorcol} />
              <TouchableOpacity onPress={() => handleLanguageChange("en")}>
                <Image
                  source={require("@/assets/images/US.png")}
                  style={[styles.logo]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </>
  );
};

export default AdminSidebar;
