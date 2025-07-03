// app/(admin)/AdminCategoryGrid.tsx
import { Link, useRouter } from "expo-router";
import { Text, View, TouchableOpacity } from "react-native";
import { styles } from "@/assets/styles/admin.styles"; // Adjust to admin styles if needed
import { COLORS } from "@/constants/colors";

const adminCategories = [
  {
    name: "Admin Jobs",
    icon: "briefcase",
    color: COLORS.blue,
    route: "/(admin)/adminjob",
  },
  {
    name: "Admin Condo",
    icon: "home",
    color: COLORS.purple,
    route: "/(admin)/admincondo",
  },
  {
    name: "Admin Travel",
    icon: "airplane",
    color: COLORS.green,
    route: "/(admin)/admintravel",
  },
];

const AdminCategoryGrid = () => {
  const router = useRouter();

  const handleCategoryClick = (route: string) => {
    console.log(`Navigating to ${route}`);
    router.push(route);
  };

  return (
    <View style={styles.grid}>
      {adminCategories.map((category, index) => (
        <TouchableOpacity
          key={category.name}
          style={[styles.card, { animationDelay: `${index * 0.1}s` }]}
          onPress={() => handleCategoryClick(category.route)}
          activeOpacity={0.7}
        >
          <View
            style={[styles.iconContainer, { backgroundColor: category.color }]}
          >
            <Text style={styles.cardText}>{category.name}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default AdminCategoryGrid;
