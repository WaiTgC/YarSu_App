import { Link, useRouter } from "expo-router";
import { Text, View, TouchableOpacity, Image } from "react-native";
import { styles } from "@/assets/styles/home.styles";
import { COLORS } from "@/constants/colors";

const categories = [
  {
    name: "Job",
    icon: require("@/assets/images/jobicon.png"),
    color: COLORS.white,
    route: "/job",
  },
  {
    name: "Travel",
    icon: require("@/assets/images/travelicon.png"),
    color: COLORS.white,
    route: "/travel",
  },
  {
    name: "Condo",
    icon: require("@/assets/images/condoicon.png"),
    color: COLORS.white,
    route: "/condo",
  },
  {
    name: "Hotel",
    icon: require("@/assets/images/hotelicon.png"),
    color: COLORS.white,
    route: "/hotel",
  },
  {
    name: "Course",
    icon: require("@/assets/images/courseicon.png"),
    color: COLORS.white,
    route: "/course",
  },
  {
    name: "Document",
    icon: require("@/assets/images/detailicon.png"),
    color: COLORS.white,
    route: "/document",
  },
  {
    name: "Restaurant",
    icon: require("@/assets/images/restauranticon.png"),
    color: COLORS.white,
    route: "/restaurant",
  },
  {
    name: "General",
    icon: require("@/assets/images/generalicon.png"),
    color: COLORS.white,
    route: "/general",
  },
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
            <Image
              source={category.icon}
              style={styles.iconImage}
              resizeMode="contain"
            />
            <Text style={styles.cardText}>{category.name}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default CategoryGrid;
