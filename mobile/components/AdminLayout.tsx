import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Redirect, useRouter } from "expo-router";
import { Text, View, Image, TouchableOpacity } from "react-native";
import { SignOutButton } from "@/components/SignOutButton";
import { useState } from "react";
import { styles } from "@/assets/styles/adminstyles/dashboard.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import AdminSidebar from "@/components/AdminSideBar";
import { COLORS } from "@/constants/colors";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useUser();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navigateTo = (route: string) => {
    router.push(route);
  };

  return (
    <View style={styles.container}>
      <SignedIn>
        <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={toggleSidebar}
                style={styles.sidebarTrigger}
              >
                <Ionicons name="menu" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Admin Panel,</Text>
                <Text style={styles.usernameText}>
                  {user?.username ||
                    user?.emailAddresses[0]?.emailAddress ||
                    "Admin"}
                </Text>
              </View>
            </View>
            <View style={styles.headerCenter}>
              <Image
                source={require("@/assets/images/YarSuLogo.png")}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.headerRight}>
              <SignOutButton />
            </View>
          </View>
          <View style={styles.contentContainer}>{children}</View>
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => navigateTo("/(admin)/dashboard")}
            >
              <Ionicons name="home-outline" size={40} color={COLORS.shadow} />
              <Text style={styles.tabText}>Dashboard</Text>
            </TouchableOpacity>
            <View style={styles.separatorcol} />
            <TouchableOpacity
              style={styles.tab}
              onPress={() => navigateTo("/(admin)/chat")}
            >
              <Ionicons
                name="chatbubbles-outline"
                size={40}
                color={COLORS.shadow}
              />
              <Text style={styles.tabText}>Chat Conversation</Text>
            </TouchableOpacity>
            <View style={styles.plusButtonContainer}>
              <TouchableOpacity style={styles.plusButton} onPress={() => {}}>
                <Ionicons name="add" size={30} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => navigateTo("/(admin)/members")}
            >
              <Ionicons name="people-outline" size={40} color={COLORS.shadow} />
              <Text style={styles.tabText}>Members</Text>
            </TouchableOpacity>
            <View style={styles.separatorcol} />
            <TouchableOpacity
              style={styles.tab}
              onPress={() => navigateTo("/(admin)/settings")}
            >
              <Ionicons
                name="settings-outline"
                size={40}
                color={COLORS.shadow}
              />
              <Text style={styles.tabText}>General Setting</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SignedIn>
      <SignedOut>
        <Redirect href={"/(auth)"} />
      </SignedOut>
    </View>
  );
}
