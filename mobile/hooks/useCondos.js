import { useState, useCallback } from "react";

const API_URL = "https://yarsu-backend.onrender.com/api";

export const useCondos = () => {
  const [condos, setCondos] = useState([]);
  const [selectedCondo, setSelectedCondo] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchCondos = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/condos`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setCondos(data);
    } catch (error) {
      console.error("Error fetching condos:", error);
    }
  }, []);

  const fetchCondoDetails = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/condos/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedCondo(data);
      setShowDetails(true);
    } catch (error) {
      console.error("Error fetching condo details:", error);
    }
  }, []);

  const handleMoreInfo = useCallback(
    (condo) => {
      fetchCondoDetails(condo.id);
    },
    [fetchCondoDetails]
  );

  const loadCondos = useCallback(async () => {
    await fetchCondos();
  }, [fetchCondos]);

  return {
    condos,
    selectedCondo,
    showDetails,
    fetchCondos,
    handleMoreInfo,
    loadCondos,
    setShowDetails,
  };
};
