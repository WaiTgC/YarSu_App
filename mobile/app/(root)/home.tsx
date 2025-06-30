import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
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
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
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
  }, [fadeAnim]);

  const handleTelegramPress = async () => {
    const url = "https://t.me/nannanbangkok";
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error("Cannot open URL:", url);
      }
    } catch (error) {
      console.error("Error opening Telegram link:", error);
    }
  };

  return (
    <View style={styles.container}>
      <SignedIn>
        <View style={styles.content}>
          <FlatList
            data={[{ key: "content" }]}
            renderItem={() => (
              <View>
                <View style={styles.greetingContainer}>
                  <Text style={styles.greetingText}>
                    {getGreeting()},{" "}
                    {user?.username ||
                      user?.emailAddresses[0]?.emailAddress ||
                      "User"}
                    !
                  </Text>
                  <View style={styles.lanButton}>
                    <TouchableOpacity>
                      <Image
                        source={require("@/assets/images/MY.png")}
                        style={styles.logo}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    <View style={styles.separator} />
                    <TouchableOpacity>
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
                      console.log("Image load error:", error.nativeEvent)
                    }
                  />
                </View>
                <Text style={styles.telegramText}>
                  Join our Telegram Channel & see Updates
                </Text>
                <TouchableOpacity
                  style={styles.joinTele}
                  onPress={handleTelegramPress}
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
      </SignedIn>
      <SignedOut>
        <Text style={styles.welcomeText}>
          Please sign in to view the home screen
        </Text>
      </SignedOut>
    </View>
  );
}
