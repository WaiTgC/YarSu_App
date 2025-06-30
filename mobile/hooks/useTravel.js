import { useState, useCallback } from "react";

const API_URL = "https://yarsu-backend.onrender.com/api";

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
    handleMoreInfo,
    loadTravelPosts,
    setShowDetails,
  };
};
