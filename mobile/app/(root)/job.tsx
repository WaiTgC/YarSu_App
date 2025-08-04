import React, { useEffect, useRef, useState } from "react";
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
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { styles } from "@/assets/styles/job.styles";
import { useJobs } from "@/hooks/useJobs";
import { formatDate, fetchWithTimeout } from "@/libs/utils";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

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
  const { language } = useLanguage();

  const slideAnimDetails = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;
  const slideAnimApply = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;
  const headerHeight = 0;

  // State for custom calendar
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    formData.birthday
      ? new Date(formData.birthday)
      : new Date(Date.UTC(2025, 6, 29)) // Use UTC to avoid timezone issues
  );
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate ? selectedDate.getUTCMonth() : 6 // Initialize with UTC month
  );
  const [currentYear, setCurrentYear] = useState(
    selectedDate ? selectedDate.getUTCFullYear() : 2025 // Initialize with UTC year
  );

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
        duration: 400,
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

  useEffect(() => {}, [language]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(Date.UTC(year, month, 1)).getUTCDay();
  };

  const handleDaySelect = (day: number) => {
    const date = new Date(Date.UTC(currentYear, currentMonth, day));
    const maxDate = new Date(Date.UTC(2025, 6, 29));
    if (date > maxDate) {
      date.setUTCFullYear(maxDate.getUTCFullYear());
      date.setUTCMonth(maxDate.getUTCMonth());
      date.setUTCDate(maxDate.getUTCDate());
    }
    setSelectedDate(date);
    const formattedDate = `${date.getUTCFullYear()}-${String(
      date.getUTCMonth() + 1
    ).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
    handleFormChange("birthday", formattedDate);
    setShowCalendar(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    setCurrentYear((prev) => (currentMonth === 0 ? prev - 1 : prev));
  };

  const handleNextMonth = () => {
    const maxDate = new Date(Date.UTC(2025, 6, 29));
    const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    if (new Date(Date.UTC(newYear, newMonth, 1)) > maxDate) return;
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];
    const maxDate = new Date(Date.UTC(2025, 6, 29));

    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(currentYear, currentMonth, day));
      const isSelectable = date <= maxDate;
      const isSelected =
        selectedDate &&
        selectedDate.getUTCFullYear() === currentYear &&
        selectedDate.getUTCMonth() === currentMonth &&
        selectedDate.getUTCDate() === day;
      days.push(
        <TouchableOpacity
          key={day}
          style={styles.calendarDay}
          onPress={() => isSelectable && handleDaySelect(day)}
          disabled={!isSelectable}
        >
          <Text
            style={[
              styles.calendarDayText,
              isSelected && styles.selectedDayText,
              !isSelectable && { color: "#999999" },
            ]}
          >
            {day}
          </Text>
          {isSelected && <View style={styles.selectedDay} />}
        </TouchableOpacity>
      );
    }

    return days;
  };

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return labels[language].birthday || "Birthday";
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getUTCDate()).padStart(2, "0")}`;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[currentMonth];

  return (
    <View style={styles.container}>
      {jobs.length === 0 ? (
        <Text style={styles.title}>{labels[language].loadingJobs}</Text>
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
                <Text style={styles.title}>{labels[language].bhatNeeded}</Text>
                <Text style={styles.date}>
                  {labels[language].posted}: {formatDate(item.created_at)}
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
                  <Text style={styles.buttonText}>
                    {labels[language].moreInfo}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text>{labels[language].noJobs}</Text>}
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
                        <Text style={styles.modaTitle}>
                          {labels[language].typeOfJob}
                        </Text>
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
                        <Text style={styles.modaTitle}>
                          {labels[language].notes}
                        </Text>
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
                        <Text style={styles.modaTitle}>
                          {labels[language].thai}
                        </Text>
                        <Text style={styles.modalTitle}>
                          {selectedJob.thai
                            ? labels[language].yes
                            : labels[language].no}
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
                        <Text style={styles.modaTitle}>
                          {labels[language].pinkCard}
                        </Text>
                        <Text style={styles.modalTitle}>
                          {selectedJob.pinkcard
                            ? labels[language].yes
                            : labels[language].no}
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
                        <Text style={styles.modaTitle}>
                          {labels[language].paymentMethod}
                        </Text>
                        <Text style={styles.modalTitle}>
                          {selectedJob.payment_type
                            ? labels[language].daily
                            : labels[language].monthly}
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
                        <Text style={styles.modaTitle}>
                          {labels[language].stayProvided}
                        </Text>
                        <Text style={styles.modalTitle}>
                          {selectedJob.stay
                            ? labels[language].yes
                            : labels[language].no}
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
                        <Text style={styles.modaTitle}>
                          {labels[language].jobLocation}
                        </Text>
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
                        <Text style={styles.modaTitle}>
                          {labels[language].postedDate}
                        </Text>
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
              <Text style={styles.buttonText}>{labels[language].apply}</Text>
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
                <Text style={styles.modalHeader}>
                  {labels[language].applyForJob}
                </Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{labels[language].name}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={labels[language].name}
                    value={formData.name}
                    onChangeText={(text) => handleFormChange("name", text)}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    {labels[language].phoneNumber}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={labels[language].phoneNumber}
                    value={formData.phonenumber}
                    onChangeText={(text) =>
                      handleFormChange("phonenumber", text)
                    }
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{labels[language].address}</Text>
                  <TextInput
                    style={[styles.input, { color: "#000000" }]}
                    placeholder={labels[language].address}
                    placeholderTextColor="#999999"
                    value={formData.address}
                    onChangeText={(text) => handleFormChange("address", text)}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{labels[language].birthday}</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowCalendar(true)}
                  >
                    <Text style={styles.dateText}>
                      {formatDisplayDate(selectedDate)}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    {labels[language].thaiLanguage}
                  </Text>
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
                      <Text style={styles.radioText}>
                        {labels[language].yes}
                      </Text>
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
                      <Text style={styles.radioText}>
                        {labels[language].no}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{labels[language].gender}</Text>
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
                      <Text style={styles.radioText}>
                        {labels[language].male}
                      </Text>
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
                      <Text style={styles.radioText}>
                        {labels[language].female}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
            <TouchableOpacity style={styles.applyButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>{labels[language].apply}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showCalendar}
        onRequestClose={() => setShowCalendar(false)}
      >
        <TouchableOpacity
          style={styles.calendarModal}
          activeOpacity={1}
          onPress={() => setShowCalendar(false)}
        >
          <View
            style={styles.calendarContainer}
            onStartShouldSetResponder={() => true} // Prevent touches from propagating
          >
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={handlePrevMonth}
              >
                <Text style={styles.calendarNavText}>{"<"}</Text>
              </TouchableOpacity>
              <Text style={styles.calendarNavText}>
                {monthName} {currentYear}
              </Text>
              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={handleNextMonth}
              >
                <Text style={styles.calendarNavText}>{">"}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={renderCalendarDays()}
              renderItem={({ item }) => item}
              keyExtractor={(item, index) => index.toString()}
              numColumns={7}
              style={styles.calendarGrid}
              scrollEnabled={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Job;
