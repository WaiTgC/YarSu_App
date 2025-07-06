import { useState, useCallback } from "react";

const API_URL = "https://yarsu-backend.onrender.com/api";

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
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

  const fetchCourses = useCallback(async () => {
    console.log("Fetching courses from:", `${API_URL}/courses`);
    try {
      const response = await fetch(`${API_URL}/courses`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Courses data:", data);
      setCourses(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching courses:", error.message);
      } else {
        console.error("Error fetching courses:", error);
      }
    }
  }, []);

  const handleMoreInfo = useCallback((course) => {
    console.log("Showing details for course:", course.title);
    setSelectedCourse(course);
    setShowDetails(true);
  }, []);

  const handleApply = useCallback(() => {
    console.log("Opening apply form for course:", selectedCourse?.title);
    setShowDetails(false);
    setShowApplyForm(true);
  }, [selectedCourse]);

  const handleFormChange = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedCourse) return;

    console.log(
      "Submitting application for course:",
      selectedCourse.title,
      formData
    );
    try {
      const response = await fetch(`${API_URL}/user_inquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: selectedCourse.id,
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
  }, [selectedCourse, formData]);

  const loadCourses = useCallback(async () => {
    console.log("Loading courses");
    await fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    selectedCourse,
    showDetails,
    showApplyForm,
    formData,
    fetchCourses,
    handleMoreInfo,
    handleApply,
    handleFormChange,
    handleSubmit,
    loadCourses,
    setShowDetails,
    setShowApplyForm,
  };
};
