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
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useHotels } from "@/hooks/useHotels";
import { styles } from "@/assets/styles/hotel.styles";
import { formatDate } from "@/libs/utils";
import { COLORS } from "@/constants/colors";

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

  const slideAnimDetails = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

  useEffect(() => {
    if (showDetails && selectedHotel?.images?.length > 1) {
      const interval = setInterval(() => {
        const nextIndex = (currentImageIndex + 1) % selectedHotel.images.length;
        setCurrentImageIndex(nextIndex);
        scrollRef.current?.scrollTo({
          x: nextIndex * Dimensions.get("window").width,
          animated: true,
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [showDetails, selectedHotel, currentImageIndex]);

  useEffect(() => {
    Animated.timing(slideAnimDetails, {
      toValue: showDetails ? 0 : Dimensions.get("window").height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => !showDetails && setShowDetails(false));
  }, [showDetails, slideAnimDetails]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        handleMoreInfo(item);
        setShowDetails(true);
      }}
    >
      <Image
        source={{ uri: item.images[0] }}
        style={styles.cardImage}
        onError={(error) =>
          console.error("Image load error", error.nativeEvent)
        }
      />
      <View style={styles.imageOverlay}>
        <Text style={styles.overlayText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleIndicatorPress = (index: number) => {
    setCurrentImageIndex(index);
    scrollRef.current?.scrollTo({
      x: index * Dimensions.get("window").width,
      animated: true,
    });
  };

  const openMap = (address: string) => {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
    Linking.openURL(mapUrl).catch((err) =>
      console.error("Failed to open map", err)
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View>
        <View style={styles.cardTitle}>
          <Text style={styles.cardTitleText1}>Discover Your</Text>
          <Text style={styles.cardTitleText2}>Perfect Stay</Text>
        </View>
        {hotels.length === 0 ? (
          <Text style={styles.title}>Loading hotels...</Text>
        ) : (
          <FlatList
            data={hotels}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            numColumns={1}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContainer}
            ListEmptyComponent={<Text>No hotels available</Text>}
          />
        )}
      </View>
      {showDetails && selectedHotel && (
        <Animated.View
          style={[
            styles.customModalOverlay,
            { transform: [{ translateY: slideAnimDetails }] },
          ]}
        >
          <View style={styles.modalContainer}>
            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
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
                onScrollEndDrag={(event) =>
                  setCurrentImageIndex(
                    Math.round(
                      event.nativeEvent.contentOffset.x /
                        Dimensions.get("window").width
                    )
                  )
                }
                onMomentumScrollEnd={(event) =>
                  setCurrentImageIndex(
                    Math.round(
                      event.nativeEvent.contentOffset.x /
                        Dimensions.get("window").width
                    )
                  )
                }
              >
                {selectedHotel.images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.modalImage}
                    onError={(error) =>
                      console.error("Modal image load error", error.nativeEvent)
                    }
                  />
                ))}
              </Animated.ScrollView>
              <View style={styles.indicatorContainer}>
                {selectedHotel.images.map((_, index) => (
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
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>{selectedHotel.name}</Text>
                  <TouchableOpacity
                    onPress={() => openMap(selectedHotel.address)}
                  >
                    <Text style={styles.modalTextmap}>View Map</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalHighlightTitle}>
                  ⭐ {selectedHotel?.admin_rating || 0}
                </Text>
                <Text style={styles.modalText}>📍 {selectedHotel.address}</Text>
                <Text style={styles.modalText}>
                  💵 THB {selectedHotel.price ? selectedHotel.price : "N/A"} /
                  night
                </Text>
                <View style={styles.separator} />
                <Text style={styles.modalHighlightTitle}>Stay Include:</Text>
                {selectedHotel.breakfast && (
                  <View style={styles.highlightItem}>
                    <Image
                      source={require("@/assets/images/check.png")}
                      style={{ width: 16, height: 16 }}
                    />
                    <Text style={styles.modalText}>
                      Breakfast: {selectedHotel.breakfast ? "Yes" : "No"}
                    </Text>
                  </View>
                )}
                {selectedHotel.free_wifi && (
                  <View style={styles.highlightItem}>
                    <Image
                      source={require("@/assets/images/check.png")}
                      style={{ width: 16, height: 16 }}
                    />
                    <Text style={styles.modalText}>
                      Free Wi-Fi: {selectedHotel.free_wifi ? "Yes" : "No"}
                    </Text>
                  </View>
                )}
                {selectedHotel.swimming_pool && (
                  <View style={styles.highlightItem}>
                    <Image
                      source={require("@/assets/images/check.png")}
                      style={{ width: 16, height: 16 }}
                    />
                    <Text style={styles.modalText}>
                      Swimming Pool:{" "}
                      {selectedHotel.swimming_pool ? "Yes" : "No"}
                    </Text>
                  </View>
                )}
                <View style={styles.separator} />
                <Text style={styles.modalHighlightTitle}>🌆 Nearby Places</Text>
                {selectedHotel.nearby_famous_places.map((place, index) => (
                  <View key={index} style={styles.highlightItem}>
                    <LinearGradient
                      colors={["#FFF236", "#FFBA30"]}
                      style={styles.highlightDot}
                      start={{ x: 0.25, y: 0.15 }}
                      end={{ x: 0.75, y: 0.85 }}
                    />
                    <Text style={styles.modalText}>{place}</Text>
                  </View>
                ))}
                <Text style={styles.modalHighlightTitle}>
                  Notes: {selectedHotel.notes || "N/A"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDetails(false)}
              >
                <Text style={styles.buttonText}>Contact</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Animated.View>
      )}
    </ScrollView>
  );
};

export default Hotel;
