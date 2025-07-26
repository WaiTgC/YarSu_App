import { Redirect, useRouter, usePathname } from "expo-router";
import { Text, View, Image, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { styles } from "@/assets/styles/home.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import AppSidebar from "@/components/AppSidebar";
import { COLORS } from "@/constants/colors";
import { supabase } from "@/libs/supabase";
import { getUserRole, getAuthToken } from "@/services/authService";
import { SignOutButton } from "@/components/SignOutButton";
import ChatButton from "./ChatButton";

interface AppLayoutProps {
  children?: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{
    role: string;
    email: string | null;
    id: string | null;
    username?: string;
  } | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  const checkSessionWithRetry = async (retries = 3, delay = 500) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const storedToken = await getAuthToken();
        console.log(
          `AppLayout - Attempt ${attempt} - Stored authToken:`,
          storedToken ? "Found" : "Not found"
        );

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error(
            `AppLayout - Attempt ${attempt} - Session check error:`,
            error.message
          );
          if (storedToken) {
            console.log(
              `AppLayout - Attempt ${attempt} - Falling back to stored token`
            );
            const userData = await getUserRole();
            console.log(
              `AppLayout - Attempt ${attempt} - User data:`,
              userData
            );
            if (userData.role === "user" || userData.role === "admin") {
              setUser(userData);
              setIsSignedIn(true);
              return true;
            }
          }
          if (attempt === retries) {
            setIsSignedIn(false);
            setUser(null);
            console.log(
              "AppLayout - All retries failed, navigating to /(auth)"
            );
            router.replace("/(auth)");
            return false;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        if (session) {
          console.log(
            `AppLayout - Attempt ${attempt} - Session found:`,
            session.user.email,
            session.user.id
          );
          const userData = await getUserRole();
          console.log(`AppLayout - Attempt ${attempt} - User data:`, userData);
          if (userData.role === "user" || userData.role === "admin") {
            setUser(userData);
            setIsSignedIn(true);
            return true;
          } else {
            console.log(
              `AppLayout - Attempt ${attempt} - Invalid role:`,
              userData.role
            );
            if (attempt === retries) {
              setIsSignedIn(false);
              setUser(null);
              console.log(
                "AppLayout - Invalid role after retries, navigating to /(auth)"
              );
              router.replace("/(auth)");
              return false;
            }
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        } else {
          console.log(`AppLayout - Attempt ${attempt} - No session found`);
          if (storedToken) {
            console.log(
              `AppLayout - Attempt ${attempt} - Falling back to stored token`
            );
            const userData = await getUserRole();
            console.log(
              `AppLayout - Attempt ${attempt} - User data:`,
              userData
            );
            if (userData.role === "user" || userData.role === "admin") {
              setUser(userData);
              setIsSignedIn(true);
              return true;
            }
          }
          if (attempt === retries) {
            setIsSignedIn(false);
            setUser(null);
            console.log(
              "AppLayout - All retries failed, navigating to /(auth)"
            );
            router.replace("/(auth)");
            return false;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      } catch (error: any) {
        console.error(
          `AppLayout - Attempt ${attempt} - Error checking session:`,
          error.message
        );
        if (attempt === retries) {
          const storedToken = await getAuthToken();
          if (storedToken) {
            console.log(
              `AppLayout - Attempt ${attempt} - Falling back to stored token`
            );
            const userData = await getUserRole();
            console.log(
              `AppLayout - Attempt ${attempt} - User data:`,
              userData
            );
            if (userData.role === "user" || userData.role === "admin") {
              setUser(userData);
              setIsSignedIn(true);
              return true;
            }
          }
          setIsSignedIn(false);
          setUser(null);
          console.log("AppLayout - All retries failed, navigating to /(auth)");
          router.replace("/(auth)");
          return false;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    return false;
  };

  useEffect(() => {
    checkSessionWithRetry();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navigateTo = (route: string) => {
    router.push(route);
    setSidebarOpen(false);
  };

  if (isSignedIn === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.welcomeText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} onStartShouldSetResponder={() => true}>
      {isSignedIn && user ? (
        <>
          <AppSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <TouchableOpacity
                  onPress={toggleSidebar}
                  style={styles.sidebarTrigger}
                  onStartShouldSetResponder={() => true}
                >
                  <Ionicons name="menu" size={24} color={COLORS.text} />
                </TouchableOpacity>
                {/* <View style={styles.welcomeContainer}>
                  <Text style={styles.welcomeText}>Welcome,</Text>
                  <Text style={styles.usernameText}>
                    {user.username || user.email || "User"}
                  </Text>
                </View> */}
              </View>
              <View style={styles.headerCenter}>
                <Image
                  source={require("@/assets/images/YarSuLogo.png")}
                  style={styles.headerLogo}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.headerRight}>
                {/* <TouchableOpacity
                  style={styles.tab}
                  onPress={() => navigateTo("/(root)/chat")}
                >
                  <Ionicons
                    name="chatbubbles-outline"
                    size={40}
                    color={COLORS.shadow}
                  />
                  <Text style={styles.tabText}>Chat</Text>
                </TouchableOpacity> */}
                <ChatButton chatId={user.id} />
              </View>
            </View>
            <View style={styles.contentContainer}>{children}</View>
          </View>
        </>
      ) : (
        <Redirect href="/(auth)" />
      )}
    </View>
  );
}
