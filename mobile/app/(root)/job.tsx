import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { styles } from "@/assets/styles/job.styles";
import { useJobs } from "@/hooks/useJobs";
import { formatDate, fetchWithTimeout } from "@/libs/utils";

// Define the Job type
type JobType = {
  id: number;
  title: string;
  job_location: string;
  location?: string;
  created_at: string;
  notes?: string;
  pinkcard?: boolean;
  thai?: boolean;
  payment_type?: boolean;
  stay?: boolean;
};

const Job = () => {
  const router = useRouter();
  const {
    jobs,
    selectedJob,
    showDetails,
    showApplyForm,
    formData,
    fetchJobs,
    handleMoreInfo,
    handleApply,
    handleFormChange,
    handleSubmit,
    loadJobs,
    setShowDetails,
    setShowApplyForm,
  } = useJobs() as {
    jobs: JobType[];
    selectedJob: JobType | null;
    showDetails: boolean;
    showApplyForm: boolean;
    formData: any;
    fetchJobs: () => void;
    handleMoreInfo: (job: JobType) => void;
    handleApply: () => void;
    handleFormChange: (field: string, value: any) => void;
    handleSubmit: () => void;
    loadJobs: () => void;
    setShowDetails: (show: boolean) => void;
    setShowApplyForm: (show: boolean) => void;
  };

  const slideAnimDetails = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;
  const slideAnimApply = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;
  const headerHeight = 0; // Adjust to match your Layout header height

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

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

  useEffect(() => {
    if (showApplyForm) {
      Animated.timing(slideAnimApply, {
        toValue: headerHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnimApply, {
        toValue: Dimensions.get("window").height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showApplyForm, slideAnimApply, headerHeight]);

  return (
    <View style={styles.container}>
      {jobs.length === 0 ? (
        <Text style={styles.title}>
          Loading jobs... (Check console for errors)
        </Text>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={require("@/assets/images/work-bag.png")}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.title}>Bhat Needed</Text>
                <Text style={styles.date}>
                  Posted: {formatDate(item.created_at)}
                </Text>
              </View>
              <View style={styles.detailsContainer}>
                <Text style={styles.location}>
                  {item.location && `${item.location}`}
                </Text>
                <TouchableOpacity
                  style={styles.moreInfoButton}
                  onPress={() => handleMoreInfo(item)}
                >
                  <Text style={styles.buttonText}>More Info</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text>No jobs available</Text>}
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
                {selectedJob && (
                  <>
                    <View style={styles.textbox}>
                      <Image
                        source={require("@/assets/images/clock.png")}
                        style={styles.image}
                        resizeMode="cover"
                      />
                      <View style={styles.textboxContainer}>
                        <Text>Type Of Job</Text>
                        <Text style={styles.modalTitle}>
                          {selectedJob.title}
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
                        <Text>Note</Text>
                        <Text style={styles.modalTitle}>
                          {selectedJob.notes || "N/A"}
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
                        <Text>Thai Language</Text>
                        <Text style={styles.modalTitle}>
                          {selectedJob.thai ? "Yes" : "No"}
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
                        <Text>Pink Card</Text>
                        <Text style={styles.modalTitle}>
                          {selectedJob.pinkcard ? "Yes" : "No"}
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
                        <Text>Payment Method</Text>
                        <Text style={styles.modalTitle}>
                          {selectedJob.payment_type ? "Hourly" : "Salary"}
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
                        <Text>Stay Provided</Text>
                        <Text style={styles.modalTitle}>
                          {selectedJob.stay ? "Yes" : "No"}
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
                        <Text>Job Location</Text>
                        <Text style={styles.modalTitle}>
                          {selectedJob.job_location}
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
                          {formatDate(selectedJob.created_at)}
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.buttonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {showApplyForm && (
        <Animated.View
          style={[
            styles.customModalOverlay,
            { transform: [{ translateY: slideAnimApply }] },
          ]}
        >
          <View style={styles.modalContainer}>
            <View style={styles.customModalContentblue}>
              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalHeader}>Apply for Job</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    value={formData.name}
                    onChangeText={(text) => handleFormChange("name", text)}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    value={formData.phonenumber}
                    onChangeText={(text) =>
                      handleFormChange("phonenumber", text)
                    }
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your address"
                    value={formData.address}
                    onChangeText={(text) => handleFormChange("address", text)}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Birthday</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={formData.birthday}
                    onChangeText={(text) => handleFormChange("birthday", text)}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Thai Language </Text>
                  <View style={styles.radioContainer}>
                    <TouchableOpacity
                      style={styles.radioButton}
                      onPress={() => handleFormChange("thailanguage", true)}
                    >
                      <View style={styles.radioCircle}>
                        {formData.thailanguage === true && (
                          <View style={styles.radioSelected} />
                        )}
                      </View>
                      <Text style={styles.radioText}>Yes </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.radioButton}
                      onPress={() => handleFormChange("thailanguage", false)}
                    >
                      <View style={styles.radioCircle}>
                        {formData.thailanguage === false && (
                          <View style={styles.radioSelected} />
                        )}
                      </View>
                      <Text style={styles.radioText}>No </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Gender </Text>
                  <View style={styles.radioContainer}>
                    <TouchableOpacity
                      style={styles.radioButton}
                      onPress={() => handleFormChange("gender", true)}
                    >
                      <View style={styles.radioCircle}>
                        {formData.gender === true && (
                          <View style={styles.radioSelected} />
                        )}
                      </View>
                      <Text style={styles.radioText}>Male </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.radioButton}
                      onPress={() => handleFormChange("gender", false)}
                    >
                      <View style={styles.radioCircle}>
                        {formData.gender === false && (
                          <View style={styles.radioSelected} />
                        )}
                      </View>
                      <Text style={styles.radioText}>Female </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
            <TouchableOpacity style={styles.applyButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default Job;
