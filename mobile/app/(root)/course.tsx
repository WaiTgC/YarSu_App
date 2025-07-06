import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { styles } from "@/assets/styles/course.styles";
import { useCourses } from "@/hooks/useCourses";
import { formatDate } from "@/libs/utils";

// Define the Course type
type CourseType = {
  id: number;
  name: string;
  location: string;
  created_at: string;

  language_required?: boolean;
  duration?: string;
  online?: boolean;
  price?: number;
};

const Course = () => {
  const router = useRouter();
  const {
    courses,
    selectedCourse,
    showDetails,
    fetchCourses,
    handleMoreInfo,
    loadCourses,
    setShowDetails,
  } = useCourses() as {
    courses: CourseType[];
    selectedCourse: CourseType | null;
    showDetails: boolean;
    fetchCourses: () => void;
    handleMoreInfo: (course: CourseType) => void;
    loadCourses: () => void;
    setShowDetails: (show: boolean) => void;
  };

  const slideAnimDetails = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;
  const headerHeight = 0; // Adjust to match your Layout header height

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

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

  return (
    <View style={styles.container}>
      {courses.length === 0 ? (
        <Text style={styles.title}>Loading courses...</Text>
      ) : (
        <FlatList
          data={courses}
          contentContainerStyle={styles.gridContainer}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleMoreInfo(item)}
            >
              <View style={styles.textContainer}>
                <View style={styles.titleContainer}>
                  <Image
                    source={require("@/assets/images/course.png")} // Adjust image as needed
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <Text style={styles.title}>
                    {""} {item.name}
                  </Text>
                </View>
                <View style={styles.titleContainer}>
                  <Image
                    source={require("@/assets/images/calendar.png")} // Adjust image as needed
                    style={styles.image}
                    resizeMode="cover"
                  />

                  <Text style={styles.title}>
                    {""} {item.duration}
                  </Text>
                </View>
                <View style={styles.titleContainer}>
                  <Image
                    source={require("@/assets/images/pricetag.png")} // Adjust image as needed
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <Text style={styles.title}>
                    {""} {item.price}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          numColumns={2} // Two-column layout
          showsVerticalScrollIndicator={false} // Hide scrollbar
          ListEmptyComponent={<Text>No courses available</Text>}
        />
      )}

      {showDetails && (
        <Animated.View
          style={[
            styles.customModalOverlay,
            { transform: [{ translateY: slideAnimDetails }] },
          ]}
        >
          <View style={styles.modalContainer}>
            <View style={styles.customModalContent}>
              <ScrollView style={styles.modalBody}>
                {selectedCourse && (
                  <>
                    <View style={styles.textbox}>
                      <Image
                        source={require("@/assets/images/clock.png")}
                        style={styles.image}
                        resizeMode="cover"
                      />
                      <View style={styles.textboxContainer}>
                        <Text>Course Name</Text>
                        <Text style={styles.modalTitle}>
                          {selectedCourse.name}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.textbox}>
                      <Image
                        source={require("@/assets/images/clock.png")}
                        style={styles.image}
                        resizeMode="cover"
                      />
                      <View style={styles.textboxContainer}>
                        <Text>Duration</Text>
                        <Text style={styles.modalTitle}>
                          {selectedCourse.duration || "N/A"}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.textbox}>
                      <Image
                        source={require("@/assets/images/clock.png")}
                        style={styles.image}
                        resizeMode="cover"
                      />
                      <View style={styles.textboxContainer}>
                        <Text>Online</Text>
                        <Text style={styles.modalTitle}>
                          {selectedCourse.online ? "Yes" : "No"}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.textbox}>
                      <Image
                        source={require("@/assets/images/clock.png")}
                        style={styles.image}
                        resizeMode="cover"
                      />
                      <View style={styles.textboxContainer}>
                        <Text>Course Fees </Text>
                        <Text style={styles.modalTitle}>
                          {selectedCourse.price}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.textbox}>
                      <Image
                        source={require("@/assets/images/clock.png")}
                        style={styles.image}
                        resizeMode="cover"
                      />
                      <View style={styles.textboxContainer}>
                        <Text>Location</Text>
                        <Text style={styles.modalTitle}>
                          {selectedCourse.location}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.textbox}>
                      <Image
                        source={require("@/assets/images/clock.png")}
                        style={styles.image}
                        resizeMode="cover"
                      />
                      <View style={styles.textboxContainer}>
                        <Text>Language Required</Text>
                        <Text style={styles.modalTitle}>
                          {selectedCourse.language_required ? "Yes" : "No"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.textbox}>
                      <Image
                        source={require("@/assets/images/clock.png")}
                        style={styles.image}
                        resizeMode="cover"
                      />
                      <View style={styles.textboxContainer}>
                        <Text>Posted Date</Text>
                        <Text style={styles.modalTitle}>
                          {formatDate(selectedCourse.created_at)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setShowDetails(false)}
                    >
                      <Text style={styles.buttonText}>Contact</Text>
                    </TouchableOpacity>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default Course;
