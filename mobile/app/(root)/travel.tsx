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
import { useTravel } from "@/hooks/useTravel";
import { styles } from "@/assets/styles/job.styles";
import { formatDate } from "@/libs/utils";

type TravelPostType = {
  id: number;
  name: string;
  place: string;
  highlights: string[];
  images: string[];
  admin_rating: number;
  created_at: string;
};

const Travel = () => {
  const {
    travelPosts,
    selectedPost,
    showDetails,
    handleMoreInfo,
    loadTravelPosts,
    setShowDetails,
  } = useTravel();

  useEffect(() => {
    loadTravelPosts();
  }, [loadTravelPosts]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleMoreInfo(item)}>
      <Image
        source={{ uri: item.images[0] }}
        style={styles.cardImage}
        onError={(error) =>
          console.error("Image load error:", error.nativeEvent)
        }
      />
      <Text style={styles.cardText}>{item.name}</Text>
      <Text style={styles.cardSubText}>{item.place}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {travelPosts.length === 0 ? (
        <Text style={styles.title}>Loading travel posts...</Text>
      ) : (
        <FlatList
          data={travelPosts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          ListEmptyComponent={<Text>No travel posts available</Text>}
        />
      )}

      <Modal
        visible={showDetails}
        animationType="slide"
        onRequestClose={() => setShowDetails(false)}
      >
        <ScrollView style={styles.modalContainer}>
          {selectedPost && (
            <>
              <Image
                source={{ uri: selectedPost.images[0] }}
                style={styles.modalImage}
                onError={(error) =>
                  console.error("Image load error:", error.nativeEvent)
                }
              />
              <Text style={styles.modalTitle}>{selectedPost.name}</Text>
              <Text style={styles.modalText}>Place: {selectedPost.place}</Text>
              <Text style={styles.modalText}>
                Highlights: {selectedPost.highlights.join(", ")}
              </Text>
              <Text style={styles.modalText}>
                Rating: {selectedPost.admin_rating}/5
              </Text>
              <Text style={styles.modalText}>
                Posted: {formatDate(selectedPost.created_at)}
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

export default Travel;
