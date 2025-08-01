import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { styles } from "@/assets/styles/general";
import { useGeneral } from "@/hooks/useGeneral";
import { COLORS } from "@/constants/colors";

interface GeneralPost {
  id: string;
  text?: string;
  images?: string[];
  videos?: string[];
  created_at: string;
}

const General = () => {
  const { language } = useLanguage();
  const { generalPosts, loadGeneralPosts } = useGeneral();
  const [posts, setPosts] = useState<GeneralPost[]>([]);
  const [currentIndices, setCurrentIndices] = useState<{
    [key: string]: number;
  }>({});
  const [isNoteExpanded, setIsNoteExpanded] = useState<{
    [key: string]: boolean;
  }>({});
  const [numColumns, setNumColumns] = useState(3);
  const isInitialMount = useRef(true);
  const carouselRefs = useRef<{ [key: string]: ICarouselInstance | null }>({});

  useEffect(() => {
    const updateColumns = () => {
      const width = Dimensions.get("window").width;
      if (width >= 1024) {
        setNumColumns(3);
      } else if (width >= 600) {
        setNumColumns(2);
      } else {
        setNumColumns(1);
      }
    };
    updateColumns();
    const subscription = Dimensions.addEventListener("change", updateColumns);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      console.log("General: Initial fetch of general posts");
      loadGeneralPosts();
      isInitialMount.current = false;
    }
  }, [loadGeneralPosts]);

  useEffect(() => {
    setPosts(generalPosts);
    const initialIndices = generalPosts.reduce((acc, post) => {
      acc[post.id] = 0;
      return acc;
    }, {} as { [key: string]: number });
    setCurrentIndices(initialIndices);
    const initialNoteExpanded = generalPosts.reduce((acc, post) => {
      acc[post.id] = false;
      return acc;
    }, {} as { [key: string]: boolean });
    setIsNoteExpanded(initialNoteExpanded);
  }, [generalPosts]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndices((prev) => {
        const newIndices = { ...prev };
        posts.forEach((post) => {
          if (carouselRefs.current[post.id]) {
            const totalMedia =
              (post?.images?.length || 0) + (post?.videos?.length || 0);
            const newIndex = (prev[post.id] + 1) % (totalMedia || 1);
            newIndices[post.id] = newIndex;
            carouselRefs.current[post.id]?.scrollTo({
              index: newIndex,
              animated: true,
            });
          }
        });
        return newIndices;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [posts]);

  const handlePrev = (id: string) => {
    const currentRef = carouselRefs.current[id];
    if (currentRef) {
      const currentIndex = currentIndices[id] || 0;
      const post = posts.find((p) => p.id === id);
      const totalMedia =
        (post?.images?.length || 0) + (post?.videos?.length || 0);
      const newIndex = (currentIndex - 1 + totalMedia) % totalMedia;
      setCurrentIndices((prev) => ({ ...prev, [id]: newIndex }));
      currentRef.scrollTo({ index: newIndex, animated: true });
    }
  };

  const handleNext = (id: string) => {
    const currentRef = carouselRefs.current[id];
    if (currentRef) {
      const currentIndex = currentIndices[id] || 0;
      const post = posts.find((p) => p.id === id);
      const totalMedia =
        (post?.images?.length || 0) + (post?.videos?.length || 0);
      const newIndex = (currentIndex + 1) % totalMedia;
      setCurrentIndices((prev) => ({ ...prev, [id]: newIndex }));
      currentRef.scrollTo({ index: newIndex, animated: true });
    }
  };

  const renderItem = ({ item }: { item: GeneralPost }) => {
    const media = [...(item.images || []), ...(item.videos || [])];
    return (
      <View
        style={[
          styles.card,
          { width: (Dimensions.get("window").width - 40) / numColumns - 16 },
        ]}
      >
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={() => handlePrev(item.id)}>
            <Text style={styles.arrow}>{"<"}</Text>
          </TouchableOpacity>
          <View style={styles.imageBackground}>
            <Carousel
              ref={(ref) => {
                if (ref) {
                  carouselRefs.current[item.id] = ref;
                }
              }}
              width={
                (Dimensions.get("window").width - 40) / numColumns - 16 - 40
              }
              height={200}
              data={
                media.length > 0 ? media : ["https://picsum.photos/340/200"]
              }
              scrollAnimationDuration={300}
              defaultIndex={currentIndices[item.id] || 0}
              onSnapToItem={(index) =>
                setCurrentIndices((prev) => ({ ...prev, [item.id]: index }))
              }
              renderItem={({ item: mediaItem }) => {
                const isVideo = mediaItem.endsWith(".mp4");
                return (
                  <Image
                    source={{ uri: mediaItem }}
                    style={styles.innerImage}
                    onError={(error) =>
                      console.error(
                        "General: Media load error for item",
                        item.id,
                        error.nativeEvent
                      )
                    }
                  />
                );
              }}
            />
          </View>
          <TouchableOpacity onPress={() => handleNext(item.id)}>
            <Text style={styles.arrow}>{">"}</Text>
          </TouchableOpacity>
          {media.length > 1 && (
            <View style={styles.sliderControls}>
              <FlatList
                horizontal
                contentContainerStyle={styles.indicatorContainer}
                data={media}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ index }) => (
                  <View
                    style={[
                      styles.indicator,
                      currentIndices[item.id] === index &&
                        styles.activeIndicator,
                    ]}
                  />
                )}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}
        </View>

        <View style={styles.detailsContainer}>
          {item.text && (
            <View style={styles.noteDropdownContainer}>
              <TouchableOpacity
                style={styles.noteTextBox}
                onPress={() =>
                  setIsNoteExpanded((prev) => ({
                    ...prev,
                    [item.id]: !prev[item.id],
                  }))
                }
              >
                <View
                  style={[
                    styles.noteTextContainer,
                    !isNoteExpanded[item.id] && styles.collapsedNoteText,
                  ]}
                >
                  <Text style={styles.value}>
                    {item.text || "No additional notes available"}
                  </Text>
                </View>
                <Ionicons
                  name={isNoteExpanded[item.id] ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={COLORS.black}
                  style={styles.dropdownArrow}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <FlatList
          showsVerticalScrollIndicator={false}
          key={`flatlist-${numColumns}`}
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={numColumns}
          columnWrapperStyle={
            numColumns > 1
              ? { justifyContent: "space-between", paddingHorizontal: 8 }
              : undefined
          }
          ListEmptyComponent={
            <Text style={styles.value}>
              {labels[language].noPosts || "No general posts available"}
            </Text>
          }
        />
      </View>
    </View>
  );
};

export default General;
