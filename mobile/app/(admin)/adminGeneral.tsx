import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Video } from "expo-av";
import { useGeneral } from "@/hooks/useGeneral";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";
import { styles } from "@/assets/styles/adminstyles/general.styles";

type GeneralType = {
  id: number;
  text: string;
  media: string[];
  created_at: string;
  users: { email: string };
};

const General = () => {
  const {
    generalPosts,
    loadGeneralPosts,
    handleMoreInfo,
    showDetails,
    selectedPost,
    setShowDetails,
  } = useGeneral();
  const { language } = useLanguage();
  const [numColumns, setNumColumns] = useState(2);

  // Update numColumns based on screen width
  useEffect(() => {
    const updateColumns = () => {
      const width = Dimensions.get("window").width;
      setNumColumns(width >= 768 ? 2 : 1);
    };
    updateColumns();
    const subscription = Dimensions.addEventListener("change", updateColumns);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    loadGeneralPosts();
  }, [loadGeneralPosts]);

  const renderItem = ({ item }: { item: GeneralType }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleMoreInfo(item)}>
      {item.media[0] ? (
        item.media[0].includes(".mp4") ? (
          <Video
            source={{ uri: item.media[0] }}
            style={styles.cardImage}
            resizeMode="cover"
            isMuted={true}
            shouldPlay={false}
            onError={(error) => console.error("Video load error:", error)}
          />
        ) : (
          <Image
            source={{ uri: item.media[0] }}
            style={styles.cardImage}
            onError={(error) =>
              console.error("Image load error:", error.nativeEvent)
            }
          />
        )
      ) : (
        <Image
          source={{ uri: "https://picsum.photos/340/200" }}
          style={styles.cardImage}
          onError={(error) =>
            console.error("Placeholder image load error:", error.nativeEvent)
          }
        />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          {item.text || labels[language].noDescription || "No description"}
        </Text>
        <Text style={styles.detailText}>
          {labels[language].postedBy || "Posted by"}:{" "}
          {item.users?.email || labels[language].unknown || "Unknown"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.cardTitle}>
        <Text style={styles.cardTitleText1}>
          {labels[language].yourGeneral || "Your"}
        </Text>
        <Text style={styles.cardTitleText2}>
          {labels[language].general || "General"}
        </Text>
      </View>
      {showDetails && selectedPost ? (
        <View style={styles.detailContainer}>
          <Text style={styles.title}>
            {selectedPost.text ||
              labels[language].noDescription ||
              "No description"}
          </Text>
          {selectedPost.media.length > 0 ? (
            selectedPost.media.map((url, index) =>
              url.includes(".mp4") ? (
                <Video
                  key={index}
                  source={{ uri: url }}
                  style={styles.detailMedia}
                  resizeMode="contain"
                  useNativeControls={true}
                  onError={(error) => console.error("Video load error:", error)}
                />
              ) : (
                <Image
                  key={index}
                  source={{ uri: url }}
                  style={styles.detailMedia}
                  onError={(error) =>
                    console.error("Image load error:", error.nativeEvent)
                  }
                />
              )
            )
          ) : (
            <Image
              source={{ uri: "https://picsum.photos/340/200" }}
              style={styles.detailMedia}
              onError={(error) =>
                console.error(
                  "Placeholder image load error:",
                  error.nativeEvent
                )
              }
            />
          )}
          <Text style={styles.detailText}>
            {labels[language].postedBy || "Posted by"}:{" "}
            {selectedPost.users?.email || labels[language].unknown || "Unknown"}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowDetails(false)}
          >
            <Text style={styles.backButtonText}>
              {labels[language].back || "Back"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : generalPosts.length === 0 ? (
        <Text style={styles.title}>
          {labels[language].loadingGeneral || "Loading general..."}
        </Text>
      ) : (
        <FlatList
          data={generalPosts}
          contentContainerStyle={styles.gridContainer}
          key={`grid-${numColumns}`}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={numColumns}
          columnWrapperStyle={
            numColumns > 1 ? { justifyContent: "space-between" } : undefined
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.title}>
              {labels[language].noGeneral || "No general available"}
            </Text>
          }
        />
      )}
    </View>
  );
};

export default General;
