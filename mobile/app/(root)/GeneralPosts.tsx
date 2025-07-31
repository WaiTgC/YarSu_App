import React, { useEffect } from "react";
import { View, Text, FlatList, Image, Video, TouchableOpacity } from "react-native";
import { useGeneralPost } from "@/hooks/useGeneralPost";
import { styles } from "@/assets/styles/generalPost.styles";

type GeneralPostType = {
  id: number;
  text: string;
  images: string[];
  videos: string[];
  created_at: string;
  users: { email: string };
};

const GeneralPosts = () => {
  const { generalPosts, loadGeneralPosts, handleMoreInfo, showDetails, selectedPost, setShowDetails } = useGeneralPost();

  useEffect(() => {
    loadGeneralPosts();
  }, [loadGeneralPosts]);

  const renderItem = ({ item }: { item: GeneralPostType }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleMoreInfo(item)}>
      {(item.images[0] || item.videos[0]) && (
        item.videos[0] ? (
          <Video
            source={{ uri: item.videos[0] }}
            style={styles.cardImage}
            resizeMode="cover"
            paused={true}
            onError={(error) => console.error("Video load error:", error)}
          />
        ) : (
          <Image
            source={{ uri: item.images[0] || "https://picsum.photos/340/200" }}
            style={styles.cardImage}
            onError={(error) => console.error("Image load error:", error.nativeEvent)}
          />
        )
      )}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.text || "No description"}</Text>
        <Text style={styles.detailText}>Posted by: {item.users?.email || "Unknown"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.cardTitle}>
        <Text style={styles.cardTitleText1}>Your</Text>
        <Text style={styles.cardTitleText2}>General Posts</Text>
      </View>
      {showDetails && selectedPost ? (
        <View style={styles.detailContainer}>
          <Text style={styles.title}>{selectedPost.text || "No description"}</Text>
          {selectedPost.images.map((url, index) => (
            <Image
              key={`img-${index}`}
              source={{ uri: url }}
              style={styles.detailMedia}
              onError={(error) => console.error("Image load error:", error.nativeEvent)}
            />
          ))}
          {selectedPost.videos.map((url, index) => (
            <Video
              key={`vid-${index}`}
              source={{ uri: url }}
              style={styles.detailMedia}
              resizeMode="contain"
              controls={true}
              onError={(error) => console.error("Video load error:", error)}
            />
          ))}
          <Text style={styles.detailText}>Posted by: {selectedPost.users?.email || "Unknown"}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => setShowDetails(false)}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        generalPosts.length === 0 ? (
          <Text style={styles.title}>Loading posts...</Text>
        ) : (
          <FlatList
            data={generalPosts}
            contentContainerStyle={styles.gridContainer}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text>No posts available</Text>}
          />
        )
      )}
    </View>
  );
};

export default GeneralPosts;