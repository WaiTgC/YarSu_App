// app/(root)/job.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
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

  React.useEffect(() => {
    loadJobs();
  }, [loadJobs]);

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
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.location}>
                Location: {item.job_location}{" "}
                {item.location && `(${item.location})`}
              </Text>
              <Text style={styles.date}>
                Posted: {formatDate(item.created_at)}
              </Text>
              <TouchableOpacity
                style={styles.moreInfoButton}
                onPress={() => handleMoreInfo(item)}
              >
                <Text style={styles.buttonText}>More Info</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text>No jobs available</Text>}
        />
      )}

      <Modal
        visible={showDetails}
        animationType="slide"
        onRequestClose={() => setShowDetails(false)}
      >
        <ScrollView style={styles.modalContainer}>
          {selectedJob && (
            <>
              <Text style={styles.modalTitle}>{selectedJob.title}</Text>
              <Text>Location: {selectedJob.job_location}</Text>
              <Text>Notes: {selectedJob.notes || "N/A"}</Text>
              <Text>Pink Card: {selectedJob.pinkcard ? "Yes" : "No"}</Text>
              <Text>Thai Required: {selectedJob.thai ? "Yes" : "No"}</Text>
              <Text>
                Payment Type: {selectedJob.payment_type ? "Hourly" : "Salary"}
              </Text>
              <Text>Stay Provided: {selectedJob.stay ? "Yes" : "No"}</Text>
              <Text>Posted: {formatDate(selectedJob.created_at)}</Text>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApply}
              >
                <Text style={styles.buttonText}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDetails(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </Modal>

      <Modal
        visible={showApplyForm}
        animationType="slide"
        onRequestClose={() => setShowApplyForm(false)}
      >
        <ScrollView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Application Form</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={formData.name}
            onChangeText={(text) => handleFormChange("name", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={formData.phonenumber}
            onChangeText={(text) => handleFormChange("phonenumber", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={formData.address}
            onChangeText={(text) => handleFormChange("address", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Birthday (YYYY-MM-DD)"
            value={formData.birthday}
            onChangeText={(text) => handleFormChange("birthday", text)}
          />
          <View style={styles.checkboxContainer}>
            <Text>Thai Language:</Text>
            <TouchableOpacity
              onPress={() =>
                handleFormChange("thailanguage", !formData.thailanguage)
              }
            >
              <Text>{formData.thailanguage ? "Yes" : "No"}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.checkboxContainer}>
            <Text>Gender:</Text>
            <TouchableOpacity
              onPress={() => handleFormChange("gender", !formData.gender)}
            >
              <Text>{formData.gender ? "Male" : "Female"}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.applyButton} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Apply</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowApplyForm(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
};

export default Job;
