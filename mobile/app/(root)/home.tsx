import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import {
  Text,
  View,
  Image,
  FlatList,
  RefreshControl,
  Animated,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { styles } from "@/assets/styles/home.styles";
import CategoryGrid from "@/components/CategoryGrid";
import { COLORS } from "@/constants/colors";

const images = [
  require("@/assets/images/banner.png"),
  require("@/assets/images/banner1.png"),
  require("@/assets/images/banner2.png"),
  require("@/assets/images/banner3.png"),
];

const getGreeting = () => {
  const hour = new Date().getHours();
  console.log(`Current hour: ${hour}`); // Debug log
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

export default function Home() {
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const onRefresh = () => {
    console.log("Refreshing..."); // Debug log
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  useEffect(() => {
    console.log("Setting up image slider interval"); // Debug log
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setCurrentImage((prev) => {
          const next = (prev + 1) % images.length;
          console.log(`Switching to image index: ${next}`); // Debug log
          return next;
        });
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 5000);
    return () => {
      console.log("Clearing image slider interval"); // Debug log
      clearInterval(interval);
    };
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <SignedIn>
        <View style={styles.content}>
          <FlatList
            data={[{ key: "content" }]}
            renderItem={() => (
              <View>
                <Text
                  style={[
                    styles.welcomeText,
                    { fontSize: 24, marginVertical: 16, textAlign: "center" },
                  ]}
                >
                  {getGreeting()},{" "}
                  {user?.username ||
                    user?.emailAddresses[0]?.emailAddress ||
                    "User"}
                  !
                </Text>
                <View
                  style={{ height: 200, display: "flex", alignItems: "center" }}
                >
                  <Animated.Image
                    source={images[currentImage]}
                    style={[
                      {
                        opacity: fadeAnim,
                      },
                      styles.banner,
                    ]}
                    resizeMode="cover"
                    onError={(error) =>
                      console.log("Image load error:", error.nativeEvent)
                    }
                  />
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
      </SignedIn>
      <SignedOut>
        <Text style={styles.welcomeText}>
          Please sign in to view the home screen
        </Text>
      </SignedOut>
    </View>
  );
}
