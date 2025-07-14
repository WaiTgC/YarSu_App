import { useState, useCallback } from "react";

const API_URL = "https://yarsu-backend.onrender.com/api";

// Optional: Replace with your actual auth token if required
const AUTH_TOKEN = process.env.REACT_APP_API_TOKEN || ""; // Define in .env file

export const useTravel = () => {
  const [travelPosts, setTravelPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchTravelPosts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/travel-posts`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setTravelPosts(data);
    } catch (error) {
      console.error("Error fetching travel posts:", error);
    }
  }, []);

  const fetchTravelPostDetails = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/travel-posts/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedPost(data);
      setShowDetails(true);
    } catch (error) {
      console.error("Error fetching travel post details:", error);
    }
  }, []);

  const addTravelPost = useCallback(async (postData) => {
    try {
      const response = await fetch(`${API_URL}/travel-posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }), // Add token if required
        },
        body: JSON.stringify(postData),
      });
      if (!response.ok) {
        const errorText = await response.text(); // Log response body for details
        console.error("Server response:", errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const newPost = await response.json();
      setTravelPosts((prevPosts) => [...prevPosts, newPost]);
      return newPost;
    } catch (error) {
      console.error("Error creating travel post:", error);
      throw error;
    }
  }, []);

  const updateTravelPost = useCallback(
    async (id, postData) => {
      try {
        const response = await fetch(`${API_URL}/travel-posts/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
          },
          body: JSON.stringify(postData),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const updatedPost = await response.json();
        setTravelPosts((prevPosts) =>
          prevPosts.map((post) => (post.id === id ? updatedPost : post))
        );
        if (selectedPost?.id === id) {
          setSelectedPost(updatedPost);
        }
        return updatedPost;
      } catch (error) {
        console.error("Error updating travel post:", error);
        throw error;
      }
    },
    [selectedPost]
  );

  const deleteTravelPost = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/travel-posts/${id}`, {
          method: "DELETE",
          headers: {
            ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        setTravelPosts((prevPosts) =>
          prevPosts.filter((post) => post.id !== id)
        );
        if (selectedPost?.id === id) {
          setSelectedPost(null);
          setShowDetails(false);
        }
      } catch (error) {
        console.error("Error deleting travel post:", error);
        throw error;
      }
    },
    [selectedPost]
  );

  const handleMoreInfo = useCallback(
    (post) => {
      fetchTravelPostDetails(post.id);
    },
    [fetchTravelPostDetails]
  );

  const loadTravelPosts = useCallback(async () => {
    await fetchTravelPosts();
  }, [fetchTravelPosts]);

  return {
    travelPosts,
    selectedPost,
    showDetails,
    fetchTravelPosts,
    fetchTravelPostDetails,
    addTravelPost,
    updateTravelPost,
    deleteTravelPost,
    handleMoreInfo,
    loadTravelPosts,
    setShowDetails,
  };
};
