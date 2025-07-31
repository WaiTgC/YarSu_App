import React, { useEffect } from "react";
import { View, Text, FlatList, Image, Video, TouchableOpacity } from "react-native";
import { useDoc } from "@/hooks/useDoc";
import { styles } from "@/assets/styles/doc.styles";

type DocType = {
  id: number;
  text: string;
  media: string[];
  created_at: string;
  users: { email: string };
};

const Docs = () => {
  const { docPosts, loadDocPosts, handleMoreInfo, showDetails, selectedPost, setShowDetails } = useDoc();

  useEffect(() => {
    loadDocPosts();
  }, [loadDocPosts]);

  const renderItem = ({ item }: { item: DocType }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleMoreInfo(item)}>
      {item.media[0] && (
        item.media[0].includes('.mp4') ? (
          <Video
            source={{ uri: item.media[0] }}
            style={styles.cardImage}
            resizeMode="cover"
            paused={true}
            onError={(error) => console.error("Video load error:", error)}
          />
        ) : (
          <Image
            source={{ uri: item.media[0] || "https://picsum.photos/340/200" }}
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
        <Text style={styles.cardTitleText2}>Documents</Text>
      </View>
      {showDetails && selectedPost ? (
        <View style={styles.detailContainer}>
          <Text style={styles.title}>{selectedPost.text || "No description"}</Text>
          {selectedPost.media.map((url, index) => (
            url.includes('.mp4') ? (
              <Video
                key={index}
                source={{ uri: url }}
                style={styles.detailMedia}
                resizeMode="contain"
                controls={true}
                onError={(error) => console.error("Video load error:", error)}
              />
            ) : (
              <Image
                key={index}
                source={{ uri: url }}
                style={styles.detailMedia}
                onError={(error) => console.error("Image load error:", error.nativeEvent)}
              />
            )
          ))}
          <Text style={styles.detailText}>Posted by: {selectedPost.users?.email || "Unknown"}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => setShowDetails(false)}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        docPosts.length === 0 ? (
          <Text style={styles.title}>Loading documents...</Text>
        ) : (
          <FlatList
            data={docPosts}
            contentContainerStyle={styles.gridContainer}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text>No documents available</Text>}
          />
        )
      )}
    </View>
  );
};

export default Docs;