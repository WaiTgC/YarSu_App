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
  { name: "Home", icon: "home", color: COLORS.blue, route: "/home" },
  { name: "Shopping", icon: "cart", color: COLORS.green, route: "/shopping" },
  { name: "Users", icon: "people", color: COLORS.purple, route: "/users" },
  {
    name: "Settings",
    icon: "settings",
    color: COLORS.gray,
    route: "/settings",
  },
  {
    name: "Analytics",
    icon: "bar-chart",
    color: COLORS.orange,
    route: "/analytics",
  },
  { name: "Calendar", icon: "calendar", color: COLORS.red, route: "/calendar" },
  {
    name: "Messages",
    icon: "chatbubble",
    color: COLORS.indigo,
    route: "/messages",
  },
  {
    name: "Documents",
    icon: "document",
    color: COLORS.yellow,
    route: "/documents",
  },
];

const CategoryGrid = () => {
  const router = useRouter();

  const handleCategoryClick = (route: string) => {
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
