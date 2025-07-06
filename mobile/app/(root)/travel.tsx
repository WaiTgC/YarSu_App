import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Animated,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTravel } from "@/hooks/useTravel";
import { styles } from "@/assets/styles/travel.styles";
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

  const slideAnimDetails = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView | null>(null);
  const headerHeight = 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    console.log("Travel: useEffect triggered, calling loadTravelPosts");
    loadTravelPosts();
  }, [loadTravelPosts]);

  useEffect(() => {
    let interval;
    if (showDetails && selectedPost?.images && selectedPost.images.length > 1) {
      console.log("Travel: Starting auto-slide interval", selectedPost.images);
      interval = setInterval(() => {
        const nextIndex = (currentImageIndex + 1) % selectedPost.images.length;
        console.log("Travel: Sliding to index", nextIndex);
        setCurrentImageIndex(nextIndex);
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            x: nextIndex * Dimensions.get("window").width,
            animated: true,
          });
        } else {
          console.log("Travel: scrollRef is not set");
        }
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
      console.log("Travel: Cleared auto-slide interval");
    };
  }, [showDetails, selectedPost, currentImageIndex]);

  useEffect(() => {
    if (showDetails) {
      Animated.timing(slideAnimDetails, {
        toValue: headerHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnimDetails, {
        toValue: Dimensions.get("window").height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showDetails, slideAnimDetails, headerHeight]);

  const renderItem = ({ item, index }) => {
    console.log(`Travel: Rendering item ${item.id} at index ${index}`);
    const baseHeight = 150;
    const doubleHeight = baseHeight * 2 + 8;

    const isDiv1 = index === 0;
    const isDiv3 = index === 3;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isDiv1 && { height: doubleHeight - 118 },
          isDiv3 && {
            height: doubleHeight - 118,
            marginTop: -baseHeight * 0.36,
          },
        ]}
        onPress={() => {
          console.log(`Travel: handleMoreInfo called for item ${item.id}`);
          handleMoreInfo(item);
          setShowDetails(true);
        }}
      >
        <Image
          source={{ uri: item.images[0] }}
          style={styles.cardImage}
          onError={(error) =>
            console.error(
              "Travel: Image load error for item",
              item.id,
              error.nativeEvent
            )
          }
        />
        <View style={styles.imageOverlay}>
          <Text style={styles.overlayText}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStar = () => {
    const stars = [];
    const fullStars = Math.floor(selectedPost?.admin_rating || 0);
    const hasHalfStar = selectedPost?.admin_rating % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Text key={i} style={styles.star}>
            ★
          </Text>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Text key={i} style={styles.star}>
            ⯪
          </Text>
        );
      } else {
        stars.push(
          <Text key={i} style={styles.star}>
            ☆
          </Text>
        );
      }
    }
    return stars;
  };

  const handleIndicatorPress = (index: number) => {
    console.log("Travel: Indicator pressed, moving to index", index);
    setCurrentImageIndex(index);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        x: index * Dimensions.get("window").width,
        animated: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardTitle}>
        <Text style={styles.cardTitleText1}>Make every trip a</Text>
        <Text style={styles.cardTitleText2}>Memory</Text>
      </View>
      {travelPosts.length === 0 ? (
        <Text style={styles.title}>
          Travel: Loading travel posts... (Length: {travelPosts.length})
        </Text>
      ) : (
        <FlatList
          data={travelPosts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          ListEmptyComponent={<Text>Travel: No travel posts available</Text>}
        />
      )}

      {showDetails && selectedPost && (
        <Animated.View
          style={[
            styles.customModalOverlay,
            { transform: [{ translateY: slideAnimDetails }] },
          ]}
        >
          <View style={styles.modalContainer}>
            <View style={styles.customModalContent}>
              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                <>
                  <Animated.ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.imageSlider}
                    pagingEnabled
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                      [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                      { useNativeDriver: false }
                    )}
                    onScrollEndDrag={(event) => {
                      const newIndex = Math.round(
                        event.nativeEvent.contentOffset.x /
                          Dimensions.get("window").width
                      );
                      console.log("Travel: Scrolled to index (drag)", newIndex);
                      setCurrentImageIndex(newIndex);
                    }}
                    onMomentumScrollEnd={(event) => {
                      const newIndex = Math.round(
                        event.nativeEvent.contentOffset.x /
                          Dimensions.get("window").width
                      );
                      console.log("Travel: Scrolled to index", newIndex);
                      setCurrentImageIndex(newIndex);
                    }}
                  >
                    {selectedPost.images.map((image, index) => (
                      <Image
                        key={index}
                        source={{ uri: image }}
                        style={styles.modalImage}
                        onError={(error) =>
                          console.error(
                            "Travel: Modal image load error for",
                            selectedPost.id,
                            error.nativeEvent
                          )
                        }
                      />
                    ))}
                  </Animated.ScrollView>
                  <View style={styles.indicatorContainer}>
                    {selectedPost.images.map((_, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleIndicatorPress(index)}
                        style={[
                          styles.indicator,
                          currentImageIndex === index && styles.activeIndicator,
                        ]}
                      />
                    ))}
                  </View>
                  <View style={styles.detailsContainer}>
                    <Text style={styles.modalTitle}>{selectedPost.name}</Text>
                    <View style={{ flexDirection: "row" }}>
                      <Image
                        source={require("@/assets/images/ping.png")}
                        style={{ height: 24, width: 24 }}
                      />
                      <Text style={styles.modalText}>
                        Place: {selectedPost.place}
                      </Text>
                    </View>
                    <Text style={styles.modalHighlightTitle}>Highlights</Text>
                    {selectedPost.highlights.map((highlight, index) => (
                      <View style={styles.highlightItem}>
                        <LinearGradient
                          key={index}
                          colors={["#FFF236", "#FFBA30"]}
                          style={styles.highlightDot}
                          start={{ x: 0.25, y: 0.15 }}
                          end={{ x: 0.75, y: 0.85 }}
                        />
                        <Text style={styles.modalText}>{highlight}</Text>
                      </View>
                    ))}
                    <Text style={styles.modalHighlightTitle}>
                      Rating - {renderStar()}{" "}
                    </Text>
                    <Text style={styles.modalHighlightTitle}>
                      Posted -
                      <Text style={styles.modalText}>
                        {formatDate(selectedPost.created_at)}
                      </Text>
                    </Text>
                  </View>
                </>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    console.log(
                      "Travel: Close button pressed for",
                      selectedPost?.id
                    );
                    setShowDetails(false);
                  }}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default Travel;
