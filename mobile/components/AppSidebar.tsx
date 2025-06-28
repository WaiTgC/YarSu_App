import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, FlatList, Animated } from "react-native";
import { SignOutButton } from "@/components/SignOutButton";
import { useState, useEffect, useRef } from "react";
import { styles } from "@/assets/styles/Sidebar.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constants/colors";

interface AppSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const AppSidebar = ({ isOpen, toggleSidebar }: AppSidebarProps) => {
  const router = useRouter();
  const { user } = useUser();
  const translateX = useRef(new Animated.Value(isOpen ? 0 : -250)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -250,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const handleChangePassword = () => {
    console.log("Change password clicked");
    router.push("/change-password");
    toggleSidebar();
  };

  const navigationItems = [
    { name: "Home", icon: "home", route: "/home" },
    // { name: "Create", icon: "add", route: "/create" },
  ];

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
          <View style={styles.sidebarGroup}>
            <Text style={styles.groupLabel}>Navigation</Text>
            {navigationItems.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.menuButton,
                  router.pathname === item.route && styles.activeMenuButton,
                ]}
                onPress={() => {
                  router.push(item.route);
                  toggleSidebar();
                }}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={
                      router.pathname === item.route
                        ? COLORS.white
                        : COLORS.text
                    }
                  />
                  <Text
                    style={[
                      styles.menuText,
                      router.pathname === item.route && styles.activeMenuText,
                    ]}
                  >
                    {item.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <SignedIn>
            <View style={styles.sidebarGroup}>
              <Text style={styles.groupLabel}>Account</Text>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={handleChangePassword}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons name="lock-closed" size={20} color={COLORS.text} />
                  <Text style={styles.menuText}>Change Password</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuButton, styles.logoutButton]}
              >
                <View style={styles.menuItemContent}>
                  <SignOutButton />
                </View>
              </TouchableOpacity>
            </View>
          </SignedIn>
        </View>
      </Animated.View>
    </>
  );
};

export default AppSidebar;
