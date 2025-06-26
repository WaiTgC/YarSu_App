import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import { SignOutButton } from "@/components/SignOutButton";
import { useState } from "react";
import { styles } from "@/assets/styles/home.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constants/colors";

const categories = [
  { name: "Job", icon: "briefcase", color: COLORS.blue, route: "/job" },
  { name: "Travel", icon: "airplane", color: COLORS.green, route: "/travel" },
  { name: "Condo", icon: "home", color: COLORS.purple, route: "/condo" },
  { name: "Hotel", icon: "bed", color: COLORS.gray, route: "/hotel" },
  { name: "Course", icon: "school", color: COLORS.orange, route: "/course" },
  {
    name: "Document",
    icon: "document",
    color: COLORS.yellow,
    route: "/document",
  },
  {
    name: "Restaurant",
    icon: "restaurant",
    color: COLORS.red,
    route: "/restaurant",
  },
  { name: "General", icon: "apps", color: COLORS.indigo, route: "/general" },
];

const CategoryGrid = () => {
  const router = useRouter();

  const handleCategoryClick = (route: string) => {
    console.log(`Navigating to ${route}`);
    router.push(route);
  };

  return (
    <View style={styles.grid}>
      {categories.map((category, index) => (
        <TouchableOpacity
          key={category.name}
          style={[styles.card, { animationDelay: `${index * 0.1}s` }]}
          onPress={() => handleCategoryClick(category.route)}
          activeOpacity={0.7}
        >
          <View
            style={[styles.iconContainer, { backgroundColor: category.color }]}
          >
            <Ionicons name={category.icon} size={24} color={COLORS.white} />
          </View>
          <Text style={styles.cardText}>{category.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default CategoryGrid;
