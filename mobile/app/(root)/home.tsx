import { router } from "expo-router";
import {
  Text,
  View,
  FlatList,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { styles } from "@/assets/styles/home.styles";
import CategoryGrid from "@/components/CategoryGrid";
import Ionicons from "@expo/vector-icons/Ionicons";
import { supabase } from "@/libs/supabase";
import { getUserRole } from "@/services/authService";
import { getItem } from "@/utils/storage";

const images = [
  require("@/assets/images/banner.png"),
  require("@/assets/images/banner1.png"),
  require("@/assets/images/banner2.png"),
  require("@/assets/images/banner3.png"),
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

interface HomeProps {
  toggleSidebar: () => void;
}

export default function Home({ toggleSidebar }: HomeProps) {
  const [user, setUser] = useState<{
    role: string;
    email: string | null;
    id: string | null;
    username?: string;
  } | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const checkSessionWithRetry = async (retries = 3, delay = 500) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const storedToken = await getItem("authToken");
        console.log(
          `Home - Attempt ${attempt} - Stored authToken:`,
          storedToken ? "Found" : "Not found"
        );

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error(
            `Home - Attempt ${attempt} - Session check error:`,
            error.message
          );
          if (storedToken) {
            console.log(
              `Home - Attempt ${attempt} - Falling back to stored token`
            );
            const userData = await getUserRole();
            console.log(
              `Home - Attempt ${attempt} - User data from stored token:`,
              userData
            );
            setUser(userData);
            setIsSignedIn(true);
            return true;
          }
          if (attempt === retries) {
            setIsSignedIn(false);
            setUser(null);
            console.log("Home - All retries failed, navigating to /index");
            router.replace("/index");
            return false;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        if (session) {
          console.log(
            `Home - Attempt ${attempt} - Session found:`,
            session.user.email,
            session.user.id
          );
          const userData = await getUserRole();
          console.log(`Home - Attempt ${attempt} - User data:`, userData);
          setUser(userData);
          setIsSignedIn(true);
          return true;
        } else {
          console.log(`Home - Attempt ${attempt} - No session found`);
          if (storedToken) {
            console.log(
              `Home - Attempt ${attempt} - Falling back to stored token`
            );
            const userData = await getUserRole();
            console.log(
              `Home - Attempt ${attempt} - User data from stored token:`,
              userData
            );
            setUser(userData);
            setIsSignedIn(true);
            return true;
          }
          if (attempt === retries) {
            setIsSignedIn(false);
            setUser(null);
            console.log("Home - All retries failed, navigating to /index");
            router.replace("/index");
            return false;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      } catch (error: any) {
        console.error(
          `Home - Attempt ${attempt} - Error checking session:`,
          error.message
        );
        if (attempt === retries) {
          const storedToken = await getItem("authToken");
          if (storedToken) {
            console.log(
              `Home - Attempt ${attempt} - Falling back to stored token`
            );
            const userData = await getUserRole();
            console.log(
              `Home - Attempt ${attempt} - User data from stored token:`,
              userData
            );
            setUser(userData);
            setIsSignedIn(true);
            return true;
          }
          setIsSignedIn(false);
          setUser(null);
          console.log("Home - All retries failed, navigating to /index");
          router.replace("/index");
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

  const onRefresh = async () => {
    setRefreshing(true);
    const success = await checkSessionWithRetry();
    if (success) {
      console.log("Home - Refresh: Session or token validated successfully");
    } else {
      console.log("Home - Refresh: Failed to validate session or token");
    }
    setRefreshing(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }).start(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }).start();
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTelegramPress = async () => {
    const url = "https://t.me/nannanbangkok";
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error("Home - Cannot open URL:", url);
      }
    } catch (error: any) {
      console.error("Home - Error opening Telegram link:", error.message);
    }
  };

  if (isSignedIn === null) {
    return <View style={styles.container}></View>;
  }

  return (
    <View style={styles.container} onStartShouldSetResponder={() => true}>
      {isSignedIn && user ? (
        <View style={styles.content}>
          <FlatList
            data={[{ key: "content" }]}
            showsVerticalScrollIndicator={false}
            renderItem={() => (
              <View>
                <View style={styles.greetingContainer}>
                  <Text style={styles.greetingText}>
                    {getGreeting()},{" "}
                    {user.username || user.email?.split("@")[0] || "User"}!
                  </Text>
                  <View style={styles.lanButton}>
                    <TouchableOpacity onStartShouldSetResponder={() => true}>
                      <Image
                        source={require("@/assets/images/MY.png")}
                        style={styles.logo}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    <View style={styles.separator} />
                    <TouchableOpacity onStartShouldSetResponder={() => true}>
                      <Image
                        source={require("@/assets/images/US.png")}
                        style={styles.logo}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ height: 150, alignItems: "center" }}>
                  <Animated.Image
                    source={images[currentImage]}
                    style={[styles.banner, { opacity: fadeAnim }]}
                    resizeMode="cover"
                    onError={(error) =>
                      console.log("Home - Image load error:", error.nativeEvent)
                    }
                  />
                </View>
                <Text style={styles.telegramText}>
                  Join our Telegram Channel & see Updates
                </Text>
                <TouchableOpacity
                  style={styles.joinTele}
                  onPress={handleTelegramPress}
                  onStartShouldSetResponder={() => true}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="paper-plane"
                      size={20}
                      color="#000"
                      style={styles.iconTele}
                    />
                    <Text>Join Now</Text>
                  </View>
                </TouchableOpacity>
                <CategoryGrid />
              </View>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            style={styles.contentContainer}
          />
        </View>
      ) : (
        <Text style={styles.welcomeText}>
          Please sign in to view the home screen
        </Text>
      )}
    </View>
  );
}
