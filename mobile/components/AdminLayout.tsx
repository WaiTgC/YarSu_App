import { Redirect, useRouter, usePathname } from "expo-router";
import { Text, View, Image, TouchableOpacity } from "react-native";
import { useState } from "react";
import { styles } from "@/assets/styles/adminstyles/dashboard.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import AdminSidebar from "@/components/AdminSideBar";
import { COLORS } from "@/constants/colors";
import { LanguageProvider } from "@/context/LanguageContext";
import AddButton from "@/components/AddButton";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Temporary admin check; replace with Supabase auth later
  const [isAdmin] = useState(true); // TODO: Replace with Supabase user role check

  if (!isAdmin) {
    return <Redirect href="/(auth)" />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navigateTo = (route: string) => {
    router.push(route);
    setSidebarOpen(false);
  };

  // Determine AddButton type based on route
  const getButtonType = () => {
    if (pathname.includes("/adminJob")) return "job";
    if (pathname.includes("/adminTravel")) return "travel";
    return null; // Hide button on /dashboard, /chat, /members, /settings
  };

  const buttonType = getButtonType();

  return (
    <LanguageProvider>
      <View style={styles.container}>
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
                <Text style={styles.usernameText}>Admin</Text>
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
              {buttonType && <AddButton type={buttonType} />}
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
            <View style={styles.separatorcol} />
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
      </View>
    </LanguageProvider>
  );
}
