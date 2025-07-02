// app/(admin)/dashboard.tsx
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
  TextInput,
  Alert,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { Redirect, useRouter } from "expo-router";
import { styles } from "@/assets/styles/admin.styles";
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

interface DashboardProps {
  toggleSidebar: () => void;
}

export default function Dashboard({ toggleSidebar }: DashboardProps) {
  const { user } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [editedImage, setEditedImage] = useState("");
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

  const handleEditBanner = () => {
    if (editedImage) {
      Alert.alert("Banner Updated", "Banner has been updated!");
      // Replace with API call to update banner
    } else {
      Alert.alert("Error", "Please enter a banner URL or select an image!");
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
                      "Admin"}
                    !
                  </Text>
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
                <TextInput
                  style={styles.input}
                  placeholder="Enter new banner URL"
                  value={editedImage}
                  onChangeText={setEditedImage}
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleEditBanner}
                >
                  <Text style={styles.buttonText}>Update Banner</Text>
                </TouchableOpacity>
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
        <Redirect href={"/(auth)"} />
      </SignedOut>
    </View>
  );
}
