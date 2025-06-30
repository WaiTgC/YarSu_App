import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
  ScrollView,
} from "react-native";
import { useHotels } from "@/hooks/useHotels";
import { styles } from "@/assets/styles/job.styles";
import { formatDate } from "@/libs/utils";

type HotelType = {
  id: number;
  name: string;
  address: string;
  price: number;
  nearby_famous_places: string[];
  breakfast: boolean;
  free_wifi: boolean;
  swimming_pool: boolean;
  images: string[];
  notes: string;
  admin_rating: number;
  created_at: string;
};

const Hotel = () => {
  const {
    hotels,
    selectedHotel,
    showDetails,
    handleMoreInfo,
    loadHotels,
    setShowDetails,
  } = useHotels();

  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleMoreInfo(item)}>
      <Image
        source={{ uri: item.images[0] }}
        style={styles.cardImage}
        onError={(error) =>
          console.error("Image load error:", error.nativeEvent)
        }
      />
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.location}>{item.address}</Text>
      <Text style={styles.date}>Price: ${item.price}/night</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {hotels.length === 0 ? (
        <Text style={styles.title}>Loading hotels...</Text>
      ) : (
        <FlatList
          data={hotels}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          ListEmptyComponent={<Text>No hotels available</Text>}
        />
      )}

      <Modal
        visible={showDetails}
        animationType="slide"
        onRequestClose={() => setShowDetails(false)}
      >
        <ScrollView style={styles.modalContainer}>
          {selectedHotel && (
            <>
              <Image
                source={{ uri: selectedHotel.images[0] }}
                style={styles.modalImage}
                onError={(error) =>
                  console.error("Image load error:", error.nativeEvent)
                }
              />
              <Text style={styles.modalTitle}>{selectedHotel.name}</Text>
              <Text style={styles.modalText}>
                Address: {selectedHotel.address}
              </Text>
              <Text style={styles.modalText}>
                Price: ${selectedHotel.price}/night
              </Text>
              <Text style={styles.modalText}>
                Nearby Places: {selectedHotel.nearby_famous_places.join(", ")}
              </Text>
              <Text style={styles.modalText}>
                Breakfast: {selectedHotel.breakfast ? "Yes" : "No"}
              </Text>
              <Text style={styles.modalText}>
                Free Wi-Fi: {selectedHotel.free_wifi ? "Yes" : "No"}
              </Text>
              <Text style={styles.modalText}>
                Swimming Pool: {selectedHotel.swimming_pool ? "Yes" : "No"}
              </Text>
              <Text style={styles.modalText}>
                Rating: {selectedHotel.admin_rating}/5
              </Text>
              <Text style={styles.modalText}>
                Notes: {selectedHotel.notes || "N/A"}
              </Text>
              <Text style={styles.modalText}>
                Posted: {formatDate(selectedHotel.created_at)}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDetails(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </Modal>
    </View>
  );
};

export default Hotel;
