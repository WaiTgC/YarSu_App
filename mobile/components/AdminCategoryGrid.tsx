import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity } from "react-native";
import { styles } from "@/assets/styles/adminstyles/admin.styles";
import { COLORS } from "@/constants/colors";

const adminCategories = [
  {
    name: "Admin Jobs",
    icon: "briefcase",
    color: COLORS.blue,
    route: "/(admin)/adminJob",
  },

  {
    name: "Admin Travel",
    icon: "airplane",
    color: COLORS.green,
    route: "/(admin)/adminTravel",
  },
  {
    name: "Admin Condo",
    icon: "home",
    color: COLORS.purple,
    route: "/(admin)/adminCondo",
  },
  {
    name: "Admin Hotels",
    icon: "bed",
    color: COLORS.teal,
    route: "/(admin)/adminHotel",
  },
  {
    name: "Admin  Details",
    icon: "book",
    color: COLORS.orange,
    route: "/(admin)/adminDetail",
  },

  {
    name: "Admin Restaurants",
    icon: "restaurant",
    color: COLORS.red,
    route: "/(admin)/adminRestaurant",
  },
  {
    name: "Admin Courses",
    icon: "book",
    color: COLORS.orange,
    route: "/(admin)/adminCourse",
  },
  {
    name: "Admin General",
    icon: "book",
    color: COLORS.orange,
    route: "/(admin)/adminGeneral",
  },
];

const AdminCategoryGrid = () => {
  const router = useRouter();

  const handleCategoryClick = (route: string) => {
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
