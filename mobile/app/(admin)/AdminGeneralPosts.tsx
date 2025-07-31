import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
  Dimensions,
  Video,
} from "react-native";
import { useGeneralPost } from "@/hooks/useGeneralPost";
import { styles } from "@/assets/styles/generalPost.styles";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

type GeneralPostType = {
  id: number;
  text: string;
  images: string[];
  videos: string[];
  created_at: string;
  users: { email: string };
};

type EditedGeneralPostType = Partial<{
  text: string;
  images: string;
  videos: string;
}>;

const AdminGeneralPosts = () => {
  const { generalPosts, loadGeneralPosts, addGeneralPost, updateGeneralPost, deleteGeneralPost } = useGeneralPost();
  const [posts, setPosts] = useState<GeneralPostType[]>([]);
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [editedValues, setEditedValues] = useState<{ [key: number]: EditedGeneralPostType }>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState<number | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newPost, setNewPost] = useState<{ text: string; images: string; videos: string }>({
    text: "",
    images: "",
    videos: "",
  });
  const [currentIndices, setCurrentIndices] = useState<{ [key: number]: number }>({});
  const [numColumns, setNumColumns] = useState(1);
  const isInitialMount = useRef(true);
  const carouselRefs = useRef<{ [key: number]: ICarouselInstance | null }>({});

  useEffect(() => {
    const updateColumns = () => {
      const width = Dimensions.get("window").width;
      setNumColumns(width >= 768 ? 1 : 1);
    };
    updateColumns();
    const subscription = Dimensions.addEventListener("change", updateColumns);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      loadGeneralPosts();
      isInitialMount.current = false;
    }
  }, [loadGeneralPosts]);

  useEffect(() => {
    setPosts(generalPosts);
    const initialIndices = generalPosts.reduce((acc, post) => {
      acc[post.id] = 0;
      return acc;
    }, {} as { [key: number]: number });
    setCurrentIndices(initialIndices);
  }, [generalPosts]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndices((prev) => {
        const newIndices = { ...prev };
        posts.forEach((post) => {
          if (!editMode[post.id] && carouselRefs.current[post.id]) {
            const totalMedia = (post.images?.length || 0) + (post.videos?.length || 0) || 1;
            const newIndex = (prev[post.id] + 1) % totalMedia;
            newIndices[post.id] = newIndex;
            carouselRefs.current[post.id]?.scrollTo({ index: newIndex, animated: true });
          }
        });
        return newIndices;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [posts, editMode]);

  const handleEdit = (id: number, field: string, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id: number) => {
    const updatedPost = editedValues[id] || {};
    const convertedPost: Partial<GeneralPostType> = {};

    if (updatedPost.text) convertedPost.text = updatedPost.text;
    if (updatedPost.images) {
      convertedPost.images = updatedPost.images.split(",").map((item) => item.trim());
    }
    if (updatedPost.videos) {
      convertedPost.videos = updatedPost.videos.split(",").map((item) => item.trim());
    }

    try {
      if (Object.keys(convertedPost).length > 0) {
        await updateGeneralPost(id, convertedPost);
        setEditMode({ ...editMode, [id]: false });
        setEditedValues((prev) => {
          const newValues = { ...prev };
          delete newValues[id];
          return newValues;
        });
        Alert.alert("Saved", "Changes have been saved!");
      } else {
        setEditMode({ ...editMode, [id]: false });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update post");
    }
  };

  const handleConfirmDelete = async (id: number) => {
    try {
      await deleteGeneralPost(id);
      setDeleteModalVisible(null);
      setPosts(posts.filter((post) => post.id !== id));
      Alert.alert("Deleted", "Post has been deleted!");
    } catch (error) {
      Alert.alert("Error", "Failed to delete post");
    }
  };

  const handleCreatePost = async () => {
    try {
      const postData: Partial<GeneralPostType> = {};
      if (newPost.text) postData.text = newPost.text;
      if (newPost.images) postData.images = newPost.images.split(",").map((item) => item.trim());
      if (newPost.videos) postData.videos = newPost.videos.split(",").map((item) => item.trim());

      if (!postData.text && (!postData.images || postData.images.length === 0) && (!postData.videos || postData.videos.length === 0)) {
        Alert.alert("Error", "At least one of text, images, or videos must be provided");
        return;
      }

      await addGeneralPost(postData);
      setCreateModalVisible(false);
      setNewPost({ text: "", images: "", videos: "" });
      loadGeneralPosts();
      Alert.alert("Created", "Post has been created!");
    } catch (error) {
      Alert.alert("Error", "Failed to create post");
    }
  };

  const handlePrev = (id: number) => {
    if (carouselRefs.current[id]) {
      const currentIndex = currentIndices[id] || 0;
      const totalMedia = (posts.find((p) => p.id === id)?.images?.length || 0) + (posts.find((p) => p.id === id)?.videos?.length || 0) || 1;
      const newIndex = (currentIndex - 1 + totalMedia) % totalMedia;
      setCurrentIndices((prev) => ({ ...prev, [id]: newIndex }));
      carouselRefs.current[id]?.scrollTo({ index: newIndex, animated: true });
    }
  };

  const handleNext = (id: number) => {
    if (carouselRefs.current[id]) {
      const currentIndex = currentIndices[id] || 0;
      const totalMedia = (posts.find((p) => p.id === id)?.images?.length || 0) + (posts.find((p) => p.id === id)?.videos?.length || 0) || 1;
      const newIndex = (currentIndex + 1) % totalMedia;
      setCurrentIndices((prev) => ({ ...prev, [id]: newIndex }));
      carouselRefs.current[id]?.scrollTo({ index: newIndex, animated: true });
    }
  };

  const renderItem = ({ item }: { item: GeneralPostType }) => {
    if (!item) return null;
    const media = [...(item.images || []), ...(item.videos || [])];
    const isEditing = editMode[item.id] || false;
    const currentValues = editedValues[item.id] || {};

    return (
      <View style={styles.card}>
        <View style={styles.detailsContainer}>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Text:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={currentValues.text || item.text || ""}
                onChangeText={(text) => handleEdit(item.id, "text", text)}
                placeholder="Enter text"
              />
            ) : (
              <Text style={styles.value}>{item.text || "N/A"}</Text>
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Images:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={currentValues.images || (item.images ? item.images.join(", ") : "")}
                onChangeText={(text) => handleEdit(item.id, "images", text)}
                placeholder="Enter image URLs (comma-separated)"
              />
            ) : (
              <Text style={styles.value}>{item.images?.join(", ") || "N/A"}</Text>
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Videos:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={currentValues.videos || (item.videos ? item.videos.join(", ") : "")}
                onChangeText={(text) => handleEdit(item.id, "videos", text)}
                placeholder="Enter video URLs (comma-separated)"
              />
            ) : (
              <Text style={styles.value}>{item.videos?.join(", ") || "N/A"}</Text>
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Posted by:</Text>
            <Text style={styles.value}>{item.users?.email || "Unknown"}</Text>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <View style={styles.imageContainer}>
            {isEditing ? null : (
              <>
                <View style={styles.imageBackground}>
                  <Carousel
                    ref={(ref) => {
                      if (ref) carouselRefs.current[item.id] = ref;
                    }}
                    width={200}
                    height={150}
                    data={media.length > 0 ? media : ["https://picsum.photos/340/200"]}
                    scrollAnimationDuration={300}
                    defaultIndex={currentIndices[item.id] || 0}
                    onSnapToItem={(index) =>
                      setCurrentIndices((prev) => ({ ...prev, [item.id]: index }))
                    }
                    renderItem={({ item: url }) => (
                      url.includes('.mp4') ? (
                        <Video
                          source={{ uri: url }}
                          style={styles.innerImage}
                          resizeMode="contain"
                          paused={true}
                          onError={(error) => console.error("Video load error:", error)}
                        />
                      ) : (
                        <Image
                          source={{ uri: url }}
                          style={styles.innerImage}
                          onError={(error) => console.error("Image load error:", error.nativeEvent)}
                        />
                      )
                    )}
                  />
                </View>
                {media.length === 1 && <View style={styles.noImages}></View>}
                {(media.length > 1 || (media.length === 0 && ["https://picsum.photos/340/200"].length > 1)) && (
                  <View style={styles.sliderControls}>
                    <TouchableOpacity onPress={() => handlePrev(item.id)}>
                      <Text style={styles.arrow}>{"<"}</Text>
                    </TouchableOpacity>
                    <FlatList
                      horizontal
                      contentContainerStyle={styles.indicatorContainer}
                      data={media.length > 0 ? media : ["https://picsum.photos/340/200"]}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ index }) => (
                        <View
                          style={[
                            styles.indicator,
                            currentIndices[item.id] === index && styles.activeIndicator,
                          ]}
                        />
                      )}
                      showsHorizontalScrollIndicator={false}
                    />
                    <TouchableOpacity onPress={() => handleNext(item.id)}>
                      <Text style={styles.arrow}>{">"}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
          <View style={styles.buttonContainer}>
            {isEditing ? (
              <TouchableOpacity style={styles.button} onPress={() => handleSave(item.id)}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={() => setEditMode({ ...editMode, [item.id]: true })}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={() => setDeleteModalVisible(item.id)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Modal
          transparent={true}
          visible={deleteModalVisible === item.id}
          onRequestClose={() => setDeleteModalVisible(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Are you sure you want to delete this post?</Text>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setDeleteModalVisible(null)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={() => handleConfirmDelete(item.id)}
                >
                  <Text style={styles.modalButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setCreateModalVisible(true)}>
        <Text style={styles.buttonText}>Create New Post</Text>
      </TouchableOpacity>
      <View style={styles.listContainer}>
        <FlatList
          showsVerticalScrollIndicator={false}
          key={`flatlist-${numColumns}`}
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
          ListEmptyComponent={<Text style={styles.title}>No posts available</Text>}
        />
      </View>
      <Modal
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Create New Post</Text>
            <TextInput
              style={styles.input}
              value={newPost.text}
              onChangeText={(text) => setNewPost((prev) => ({ ...prev, text }))}
              placeholder="Enter text"
            />
            <TextInput
              style={styles.input}
              value={newPost.images}
              onChangeText={(text) => setNewPost((prev) => ({ ...prev, images: text }))}
              placeholder="Enter image URLs (comma-separated)"
            />
            <TextInput
              style={styles.input}
              value={newPost.videos}
              onChangeText={(text) => setNewPost((prev) => ({ ...prev, videos: text }))}
              placeholder="Enter video URLs (comma-separated)"
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCreateModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleCreatePost}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminGeneralPosts;