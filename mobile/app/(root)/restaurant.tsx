import React, { useEffect } from "react";
import { View, Text, FlatList, Image } from "react-native";
import { useRestaurants } from "@/hooks/useRestaurants";
import { styles } from "@/assets/styles/job.styles";
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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.images[0] }}
        style={styles.cardImage}
        onError={(error) =>
          console.error("Image load error:", error.nativeEvent)
        }
      />
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.location}>Location: {item.location}</Text>
      <Text style={styles.detailText}>Rating: {item.admin_rating}/5</Text>
      <Text style={styles.detailText}>
        Popular Picks: {item.popular_picks.join(", ")}
      </Text>
      <Text style={styles.detailText}>Notes: {item.notes || "N/A"}</Text>
      <Text style={styles.detailText}>
        Posted: {formatDate(item.created_at)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {restaurants.length === 0 ? (
        <Text style={styles.title}>Loading restaurants...</Text>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text>No restaurants available</Text>}
        />
      )}
    </View>
  );
};

export default Restaurant;
