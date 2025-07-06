import React, { useEffect } from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { useRestaurants } from "@/hooks/useRestaurants";
import { styles } from "@/assets/styles/restaurant.styles";
import { formatDate } from "@/libs/utils";

type RestaurantType = {
  id: number;
  name: string;
  location: string;
  images: string[];
  popular_picks: string[];
  admin_rating: number;
  notes: string;
  created_at: string;
};

const Restaurant = () => {
  const { restaurants, loadRestaurants } = useRestaurants();

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          {i <= rating ? "★" : "☆"}
        </Text>
      );
    }
    return stars;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => {}}>
      <Image
        source={{ uri: item.images[0] }}
        style={styles.cardImage}
        onError={(error) =>
          console.error("Image load error:", error.nativeEvent)
        }
      />
      <View style={styles.textContainer}>
        <View style={styles.ratingContainer}>
          {renderStars(item.admin_rating)}
        </View>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/food.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>{item.name}</Text>
        </View>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/ping.png")}
            style={styles.logo}
          />
          <Text style={styles.location}>{item.location}</Text>
        </View>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/thumb.png")}
            style={styles.logo}
          />
          <Text style={styles.detailText}>{item.popular_picks.join(", ")}</Text>
        </View>
        <Text style={styles.detailText}>Notes: {item.notes || "N/A"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.cardTitle}>
        <Text style={styles.cardTitleText1}>Your</Text>
        <Text style={styles.cardTitleText2}>Food Guide</Text>
      </View>
      {restaurants.length === 0 ? (
        <Text style={styles.title}>Loading restaurants...</Text>
      ) : (
        <FlatList
          data={restaurants}
          contentContainerStyle={styles.gridContainer}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2} // Two-column layout
          showsVerticalScrollIndicator={false} // Hide scrollbar
          ListEmptyComponent={<Text>No restaurants available</Text>}
        />
      )}
    </View>
  );
};

export default Restaurant;
