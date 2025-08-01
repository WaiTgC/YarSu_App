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
  Platform,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { styles } from "@/assets/styles/home.styles";
import CategoryGrid from "@/components/CategoryGrid";
import Ionicons from "@expo/vector-icons/Ionicons";
import { supabase } from "@/libs/supabase";
import { getUserRole } from "@/services/authService";
import { getItem } from "@/utils/storage";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";
import { useUser } from "@/context/UserContext";

const getGreeting = (language: "en" | "my") => {
  const hour = new Date().getHours();
  if (hour < 12) return labels[language].goodMorning;
  if (hour < 18) return labels[language].goodAfternoon;
  return labels[language].goodEvening;
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
  const { language, setLanguage } = useLanguage();
  const { profile } = useUser();

  const defaultBanners = [
    require("@/assets/images/banner.png"),
    require("@/assets/images/banner1.png"),
    require("@/assets/images/banner2.png"),
    require("@/assets/images/banner3.png"),
  ];

  const images = [
    profile.bannerImage1 || defaultBanners[0],
    profile.bannerImage2 || defaultBanners[1],
    profile.bannerImage3 || defaultBanners[2],
    profile.bannerImage4 || defaultBanners[3],
  ].map((image) => {
    if (typeof image === "string") {
      return { uri: image };
    }
    return image; // Local asset from defaultBanners
  });

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

  useEffect(() => {
    console.log(`Home - Current language: ${language}`);
  }, [language]);

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
        useNativeDriver: true,
      }).start(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [images]);

  const handleTelegramPress = async () => {
    const url = profile.telegram || "https://t.me";
    if (url) {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          console.error("Home - Cannot open Telegram URL:", url);
        }
      } catch (error: any) {
        console.error("Home - Error opening Telegram link:", error.message);
      }
    }
  };

  const handleTikTokPress = async () => {
    const url = profile.tiktok || "https://tiktok.com";
    if (url) {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          console.error("Home - Cannot open TikTok URL:", url);
        }
      } catch (error: any) {
        console.error("Home - Error opening TikTok link:", error.message);
      }
    }
  };

  const handleYouTubePress = async () => {
    const url = profile.youtube || "https://youtube.com";
    if (url) {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          console.error("Home - Cannot open YouTube URL:", url);
        }
      } catch (error: any) {
        console.error("Home - Error opening YouTube link:", error.message);
      }
    }
  };

  const handleFacebookPress = async () => {
    const url = profile.facebook || "https://facebook.com";
    if (url) {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          console.error("Home - Cannot open Facebook URL:", url);
        }
      } catch (error: any) {
        console.error("Home - Error opening Facebook link:", error.message);
      }
    }
  };

  const setLanguageToEnglish = () => {
    console.log("Home - Setting language to English");
    setLanguage("en");
  };

  const setLanguageToMyanmar = () => {
    console.log("Home - Setting language to Myanmar");
    setLanguage("my");
  };

  if (isSignedIn === null) {
    return <View style={styles.container}></View>;
  }

  return (
    <View
      style={styles.container}
      {...(Platform.OS !== "web"
        ? { onStartShouldSetResponder: () => true }
        : {})}
    >
      {isSignedIn && user ? (
        <View style={styles.content}>
          <FlatList
            data={[{ key: "content" }]}
            showsVerticalScrollIndicator={false}
            renderItem={() => (
              <View>
                <View style={styles.greetingContainer}>
                  <Text style={styles.greetingText}>
                    {getGreeting(language)},{" "}
                    {user.username || user.email?.split("@")[0] || "User"}!
                  </Text>
                  <View style={styles.lanButton}>
                    <TouchableOpacity
                      onPress={setLanguageToMyanmar}
                      {...(Platform.OS !== "web"
                        ? { onStartShouldSetResponder: () => true }
                        : {})}
                    >
                      <Image
                        source={require("@/assets/images/MY.png")}
                        style={styles.logo}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    <View style={styles.separator} />
                    <TouchableOpacity
                      onPress={setLanguageToEnglish}
                      {...(Platform.OS !== "web"
                        ? { onStartShouldSetResponder: () => true }
                        : {})}
                    >
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
                    onError={(error) => {
                      console.log(
                        `Home - Image load error for banner ${currentImage}:`,
                        error.nativeEvent,
                        `URL: ${JSON.stringify(images[currentImage])}`
                      );
                    }}
                  />
                </View>
                <Text style={styles.telegramText}>
                  {labels[language].socialMediaPrompt}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    marginHorizontal: "auto",
                  }}
                >
                  <TouchableOpacity
                    style={styles.joinTele}
                    onPress={handleTelegramPress}
                    {...(Platform.OS !== "web"
                      ? { onStartShouldSetResponder: () => true }
                      : {})}
                  >
                    <Image
                      source={require("@/assets/images/tele.png")}
                      style={styles.iconTele}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.joinTele}
                    onPress={handleFacebookPress}
                    {...(Platform.OS !== "web"
                      ? { onStartShouldSetResponder: () => true }
                      : {})}
                  >
                    <Image
                      source={require("@/assets/images/fb.png")}
                      style={styles.iconTele}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.joinTele}
                    onPress={handleTikTokPress}
                    {...(Platform.OS !== "web"
                      ? { onStartShouldSetResponder: () => true }
                      : {})}
                  >
                    <Image
                      source={require("@/assets/images/tiktok.png")}
                      style={styles.iconTele}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.joinTele}
                    onPress={handleYouTubePress}
                    {...(Platform.OS !== "web"
                      ? { onStartShouldSetResponder: () => true }
                      : {})}
                  >
                    <Image
                      source={require("@/assets/images/utube.png")}
                      style={styles.iconTele}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
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
        <Text style={styles.welcomeText}>{labels[language].signInPrompt}</Text>
      )}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>{labels[language].footerText}</Text>
      </View>
    </View>
  );
}
