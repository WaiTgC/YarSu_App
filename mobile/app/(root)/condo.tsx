import React, { useEffect } from "react";
import { View, Text, FlatList, Image } from "react-native";
import { useCondos } from "@/hooks/useCondos";
import { styles } from "@/assets/styles/job.styles";
import { formatDate } from "@/libs/utils";

type CondoType = {
  id: number;
  name: string;
  address: string;
  rent_fee: number;
  images: string[];
  swimming_pool: boolean;
  free_wifi: boolean;
  gym: boolean;
  garden: boolean;
  co_working_space: boolean;
  created_at: string;
};

const Condo = () => {
  const { condos, loadCondos } = useCondos();

  useEffect(() => {
    loadCondos();
  }, [loadCondos]);

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
      <Text style={styles.location}>Address: {item.address}</Text>
      <Text style={styles.date}>Rent: ${item.rent_fee}/month</Text>
      <Text style={styles.detailText}>
        Swimming Pool: {item.swimming_pool ? "Yes" : "No"}
      </Text>
      <Text style={styles.detailText}>
        Free Wi-Fi: {item.free_wifi ? "Yes" : "No"}
      </Text>
      <Text style={styles.detailText}>Gym: {item.gym ? "Yes" : "No"}</Text>
      <Text style={styles.detailText}>
        Garden: {item.garden ? "Yes" : "No"}
      </Text>
      <Text style={styles.detailText}>
        Co-working Space: {item.co_working_space ? "Yes" : "No"}
      </Text>
      <Text style={styles.detailText}>
        Posted: {formatDate(item.created_at)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {condos.length === 0 ? (
        <Text style={styles.title}>Loading condos...</Text>
      ) : (
        <FlatList
          data={condos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text>No condos available</Text>}
        />
      )}
    </View>
  );
};

export default Condo;
