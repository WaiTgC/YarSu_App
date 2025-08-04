import { useState, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

const API_URL = "https://yarsu-backend.onrender.com/api";

export const useJobs = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phonenumber: "",
    address: "",
    birthday: "",
    thailanguage: false,
    gender: false,
  });

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/jobs`);
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error.message);
    }
  }, []);

  const handleMoreInfo = useCallback((job) => {
    setSelectedJob(job);
    setShowDetails(true);
  }, []);

  const handleApply = useCallback(() => {
    setShowDetails(false);
    setShowApplyForm(true);
  }, [selectedJob]);

  const handleFormChange = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedJob) return;

    const userId = await SecureStore.getItemAsync("userId");
    if (!userId) {
      alert("Please log in to apply.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: selectedJob.id,
          user_id: userId,
          ...formData,
        }),
      });
      if (response.ok) {
        alert("Application submitted successfully!");
        setShowApplyForm(false);
        setFormData({
          name: "",
          phonenumber: "",
          address: "",
          birthday: "",
          thailanguage: false,
          gender: false,
        });
        // Redirect to chat screen (assuming chatId is created or linked by backend)
        const { chatId } = await response.json(); // Expect chatId from backend
        if (chatId) {
          router.push(`/ChatScreen?chatId=${chatId}`);
        } else {
          console.error("No chatId returned from inquiry submission");
        }
      } else {
        throw new Error("Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      alert("An error occurred. Please try again.");
    }
  }, [selectedJob, formData, router]);

  const loadJobs = useCallback(async () => {
    await fetchJobs();
  }, [fetchJobs]);

  const editJob = useCallback(async (id, updatedJob) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedJob),
      });
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const updatedData = await response.json();
      setJobs((prevJobs) =>
        prevJobs.map((job) => (job.id === id ? updatedData : job))
      );
    } catch (error) {
      console.error("Error editing job:", error.message);
      alert("An error occurred while editing the job.");
    }
  }, []);

  const deleteJob = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: "DELETE",
      });
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
    } catch (error) {
      console.error("Error deleting job:", error.message);
      alert("An error occurred while deleting the job.");
    }
  }, []);

  const addJob = useCallback(async (newJob) => {
    try {
      const response = await fetch(`${API_URL}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newJob,
          pinkcard: false,
          thai: false,
          payment_type: false,
          stay: false,
        }),
      });
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const addedJob = await response.json();
      setJobs((prevJobs) => [...prevJobs, addedJob]);
      alert("Job added successfully!");
    } catch (error) {
      console.error("Error adding job:", error.message);
      alert("An error occurred while adding the job.");
    }
  }, []);

  return {
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
    editJob,
    deleteJob,
    addJob,
  };
};
