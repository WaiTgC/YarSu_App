// app/(admin)/adminjob.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { styles } from "@/assets/styles/adminstyles/job.styles";
import { useJobs } from "@/hooks/useJobs";
import { formatDate } from "@/libs/utils";

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

const AdminJob = () => {
  const router = useRouter();
  const { jobs, loadJobs } = useJobs() as {
    jobs: JobType[];
    loadJobs: () => void;
  };
  const [editedJobs, setEditedJobs] = useState<JobType[]>([]);
  const [newJob, setNewJob] = useState<Partial<JobType>>({});

  useEffect(() => {
    loadJobs();
    setEditedJobs([...jobs]); // Initialize with current jobs
  }, [loadJobs, jobs]);

  const handleEdit = (id: number, field: string, value: string) => {
    setEditedJobs(
      editedJobs.map((job) =>
        job.id === id ? { ...job, [field]: value } : job
      )
    );
  };

  const handleSave = () => {
    Alert.alert("Saved", "Changes have been saved!");
    // Replace with API call to persist changes
  };

  const handleAddJob = () => {
    if (newJob.title && newJob.job_location && newJob.created_at) {
      const jobToAdd = {
        ...newJob,
        id: Date.now(), // Temporary ID; replace with real ID from backend
        pinkcard: false,
        thai: false,
        payment_type: false,
        stay: false,
      } as JobType;
      setEditedJobs([...editedJobs, jobToAdd]);
      setNewJob({});
      Alert.alert("Added", "New job has been added!");
    } else {
      Alert.alert("Error", "Please fill all required fields!");
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Job Management</Text>
      <FlatList
        data={editedJobs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              value={item.title}
              onChangeText={(text) => handleEdit(item.id, "title", text)}
            />
            <TextInput
              style={styles.input}
              value={item.job_location}
              onChangeText={(text) => handleEdit(item.id, "job_location", text)}
            />
            <TextInput
              style={styles.input}
              value={item.created_at}
              onChangeText={(text) => handleEdit(item.id, "created_at", text)}
            />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.title}>No jobs available</Text>}
      />
      <View style={styles.editSection}>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={newJob.title || ""}
          onChangeText={(text) => setNewJob({ ...newJob, title: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={newJob.job_location || ""}
          onChangeText={(text) => setNewJob({ ...newJob, job_location: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          value={newJob.created_at || ""}
          onChangeText={(text) => setNewJob({ ...newJob, created_at: text })}
        />
        <TouchableOpacity style={styles.button} onPress={handleAddJob}>
          <Text style={styles.buttonText}>Add Job</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AdminJob;
