import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { styles } from "@/assets/styles/adminstyles/job.styles";
import { useJobs } from "@/hooks/useJobs";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";

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

// Define type for edited values to allow string for boolean fields during editing
type EditedJobType = Partial<{
  title: string;
  job_location: string;
  notes: string;
  pinkcard: string | boolean;
  thai: string | boolean;
  payment_type: string | boolean;
  stay: string | boolean;
}>;

const AdminJob = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const {
    jobs: fetchedJobs,
    loadJobs,
    editJob,
    deleteJob,
  } = useJobs() as {
    jobs: JobType[];
    loadJobs: () => void;
    editJob: (id: number, updatedJob: Partial<JobType>) => void;
    deleteJob: (id: number) => void;
  };
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [editedValues, setEditedValues] = useState<{
    [key: number]: EditedJobType;
  }>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState<number | null>(
    null
  );
  const [numColumns, setNumColumns] = useState(2); // Default to 2 columns

  // Update numColumns based on screen width
  useEffect(() => {
    const updateColumns = () => {
      const width = Dimensions.get("window").width;
      setNumColumns(width >= 768 ? 2 : 1); // 2 columns for wide screens, 1 for narrow
    };
    updateColumns();
    const subscription = Dimensions.addEventListener("change", updateColumns);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    loadJobs();
    setJobs(fetchedJobs);
  }, [loadJobs, fetchedJobs]);

  const handleEdit = (id: number, field: string, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = (id: number) => {
    const updatedJob = editedValues[id] || {};
    const convertedJob: Partial<JobType> = {};

    // Convert string inputs to appropriate types
    if (updatedJob.title) {
      convertedJob.title = updatedJob.title;
    }
    if (updatedJob.job_location) {
      convertedJob.job_location = updatedJob.job_location;
    }
    if (updatedJob.notes !== undefined) {
      convertedJob.notes = updatedJob.notes;
    }
    if (updatedJob.pinkcard !== undefined) {
      const lowerValue =
        typeof updatedJob.pinkcard === "string"
          ? updatedJob.pinkcard.toLowerCase()
          : updatedJob.pinkcard;
      if (lowerValue === "yes") {
        convertedJob.pinkcard = true;
      } else if (lowerValue === "no") {
        convertedJob.pinkcard = false;
      }
    }
    if (updatedJob.thai !== undefined) {
      const lowerValue =
        typeof updatedJob.thai === "string"
          ? updatedJob.thai.toLowerCase()
          : updatedJob.thai;
      if (lowerValue === "yes") {
        convertedJob.thai = true;
      } else if (lowerValue === "no") {
        convertedJob.thai = false;
      }
    }
    if (updatedJob.payment_type !== undefined) {
      const lowerValue =
        typeof updatedJob.payment_type === "string"
          ? updatedJob.payment_type.toLowerCase()
          : updatedJob.payment_type;
      if (lowerValue === "yes") {
        convertedJob.payment_type = true;
      } else if (lowerValue === "no") {
        convertedJob.payment_type = false;
      }
    }
    if (updatedJob.stay !== undefined) {
      const lowerValue =
        typeof updatedJob.stay === "string"
          ? updatedJob.stay.toLowerCase()
          : updatedJob.stay;
      if (lowerValue === "yes") {
        convertedJob.stay = true;
      } else if (lowerValue === "no") {
        convertedJob.stay = false;
      }
    }

    if (Object.keys(convertedJob).length > 0) {
      editJob(id, convertedJob);
      setEditMode({ ...editMode, [id]: false });
      setEditedValues((prev) => {
        const newValues = { ...prev };
        delete newValues[id];
        return newValues;
      });
      Alert.alert(
        "Saved",
        labels[language].saved || "Changes have been saved!"
      );
    } else {
      setEditMode({ ...editMode, [id]: false });
    }
  };

  const handleConfirmDelete = (id: number) => {
    deleteJob(id);
    setDeleteModalVisible(null);
    setJobs(jobs.filter((job) => job.id !== id));
    Alert.alert("Deleted", labels[language].deleted || "Job has been deleted!");
  };

  const renderItem = ({ item }: { item: JobType }) => (
    <View style={styles.card}>
      <View style={styles.detailsContainer}>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>{labels[language].title}:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={editedValues[item.id]?.title || item.title}
              onChangeText={(text) => handleEdit(item.id, "title", text)}
            />
          ) : (
            <Text style={styles.value}>{item.title}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>{labels[language].location}:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={editedValues[item.id]?.job_location || item.job_location}
              onChangeText={(text) => handleEdit(item.id, "job_location", text)}
            />
          ) : (
            <Text style={styles.value}>{item.job_location}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>{labels[language].pinkCard}:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={
                editedValues[item.id]?.pinkcard !== undefined
                  ? String(editedValues[item.id].pinkcard)
                  : item.pinkcard
                  ? "Yes"
                  : "No"
              }
              onChangeText={(text) => handleEdit(item.id, "pinkcard", text)}
              placeholder="Yes or No"
            />
          ) : (
            <Text style={styles.value}>{item.pinkcard ? "Yes" : "No"}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>{labels[language].thai}:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={
                editedValues[item.id]?.thai !== undefined
                  ? String(editedValues[item.id].thai)
                  : item.thai
                  ? "Yes"
                  : "No"
              }
              onChangeText={(text) => handleEdit(item.id, "thai", text)}
              placeholder="Yes or No"
            />
          ) : (
            <Text style={styles.value}>{item.thai ? "Yes" : "No"}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>{labels[language].paymentType}:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={
                editedValues[item.id]?.payment_type !== undefined
                  ? String(editedValues[item.id].payment_type)
                  : item.payment_type
                  ? "Yes"
                  : "No"
              }
              onChangeText={(text) => handleEdit(item.id, "payment_type", text)}
              placeholder="Monthly or Daily"
            />
          ) : (
            <Text style={styles.value}>
              {item.payment_type ? "Monthly" : "Daily"}
            </Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>{labels[language].stay}:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={
                editedValues[item.id]?.stay !== undefined
                  ? String(editedValues[item.id].stay)
                  : item.stay
                  ? "Yes"
                  : "No"
              }
              onChangeText={(text) => handleEdit(item.id, "stay", text)}
              placeholder="Yes or No"
            />
          ) : (
            <Text style={styles.value}>{item.stay ? "Yes" : "No"}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>{labels[language].notes}:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={editedValues[item.id]?.notes || item.notes || ""}
              onChangeText={(text) => handleEdit(item.id, "notes", text)}
              placeholder="Enter notes"
            />
          ) : (
            <Text style={styles.value}>{item.notes || "N/A"}</Text>
          )}
        </View>
        <View style={styles.buttonContainer}>
          {editMode[item.id] ? (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleSave(item.id)}
            >
              <Text style={styles.buttonText}>
                {labels[language].save || "Save"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setEditMode({ ...editMode, [item.id]: true })}
            >
              <Text style={styles.buttonText}>
                {labels[language].edit || "Edit"}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setDeleteModalVisible(item.id)}
          >
            <Text style={styles.buttonText}>{labels[language].delete}</Text>
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
            <Text style={styles.modalText}>
              {labels[language].deleteConfirm}
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(null)}
              >
                <Text style={styles.modalButtonText}>
                  {labels[language].cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={() => handleConfirmDelete(item.id)}
              >
                <Text style={styles.modalButtonText}>
                  {labels[language].delete}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          numColumns={numColumns} // Use dynamic numColumns
          key={`flatlist-${numColumns}`} // Force re-render when numColumns changes
          columnWrapperStyle={numColumns > 1 ? styles.row : undefined} // Apply row styling for multi-column
          ListEmptyComponent={
            <Text style={styles.title}>{labels[language].noJobs}</Text>
          }
        />
      </View>
    </View>
  );
};

export default AdminJob;
