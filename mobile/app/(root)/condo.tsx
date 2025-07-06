import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useCondos } from "@/hooks/useCondos";
import { styles } from "@/assets/styles/condo.styles";
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
    console.log("Condo data:", condos); // Log the condos data
  }, [loadCondos]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardImageContainer}>
        {item.images && item.images[0] && (
          <Image
            source={{ uri: item.images[0] }}
            style={styles.cardImage}
            onError={(error) =>
              console.error("Image load error:", error.nativeEvent)
            }
          />
        )}
        <View style={styles.detailsContainer}>
          {item.name && <Text style={styles.overlayText}>{item.name}</Text>}
          {item.rent_fee !== undefined && (
            <Text style={styles.modalText}>
              <Image
                style={styles.amenityIcon}
                source={require("@/assets/images/money_icon.png")}
              />{" "}
              THB {item.rent_fee}/ month
            </Text>
          )}
          {item.address && (
            <Text style={styles.modalText}>📍 {item.address}</Text>
          )}
          <View style={styles.amenitiesContainer}>
            {item.swimming_pool && (
              <View style={styles.amenityRow}>
                <Text style={styles.modalText}>🏊 Swimming Pool</Text>
              </View>
            )}
            {item.free_wifi && (
              <View style={styles.amenityRow}>
                <Text style={styles.modalText}>🛜 Free Wi-Fi</Text>
              </View>
            )}
            {item.gym && (
              <View style={styles.amenityRow}>
                <Text style={styles.modalText}>🏋️ Gym</Text>
              </View>
            )}
            {item.garden && (
              <View style={styles.amenityRow}>
                <Text style={styles.modalText}>🌿 Garden</Text>
              </View>
            )}
            {item.co_working_space && (
              <View style={styles.amenityRow}>
                <Text style={styles.modalText}>📚 Co-working Space: </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.contactContainer}>
        {item.created_at && (
          <Text style={styles.modalText}>
            Posted: {formatDate(item.created_at)}
          </Text>
        )}
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => console.log("Contact button pressed for:", item.name)}
        >
          <Text style={styles.contactButtonText}>Contact</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.imageOverlay}></View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View>
        <View style={styles.cardTitle}>
          <Text style={styles.cardTitleText1}>City Life.</Text>
          <Text style={styles.cardTitleText2}>Simplified.</Text>
        </View>
        {condos.length === 0 ? (
          <Text style={styles.title}>Loading condos...</Text>
        ) : (
          <FlatList
            data={condos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            horizontal={false} // Vertical column
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContainer}
            ListEmptyComponent={<Text>No condos available</Text>}
          />
        )}
      </View>
    </ScrollView>
  );
};

export default Condo;
