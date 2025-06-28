// hooks/useJobs.js
import { useState, useCallback } from "react";

const API_URL = "https://yarsu-backend.onrender.com/api";

export const useJobs = () => {
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
    console.log("Fetching jobs from:", `${API_URL}/jobs`);
    try {
      const response = await fetch(`${API_URL}/jobs`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Jobs data:", data);
      setJobs(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching jobs:", error.message);
      } else {
        console.error("Error fetching jobs:", error);
      }
    }
  }, []);

  const handleMoreInfo = useCallback((job) => {
    console.log("Showing details for job:", job.title);
    setSelectedJob(job);
    setShowDetails(true);
  }, []);

  const handleApply = useCallback(() => {
    console.log("Opening apply form for job:", selectedJob?.title);
    setShowDetails(false);
    setShowApplyForm(true);
  }, [selectedJob]);

  const handleFormChange = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedJob) return;

    console.log("Submitting application for job:", selectedJob.title, formData);
    try {
      const response = await fetch(`${API_URL}/user_inquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_id: selectedJob.id,
          user_id: "some-user-id", // Replace with actual user ID from Clerk
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
      } else {
        throw new Error("Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      alert("An error occurred. Please try again.");
    }
  }, [selectedJob, formData]);

  const loadJobs = useCallback(async () => {
    console.log("Loading jobs");
    await fetchJobs();
  }, [fetchJobs]);

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
  };
};
