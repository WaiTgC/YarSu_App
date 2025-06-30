import { useState, useCallback } from "react";

const API_URL = "https://yarsu-backend.onrender.com/api";

export const useHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchHotels = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/hotels`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setHotels(data);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
  }, []);

  const fetchHotelDetails = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/hotels/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedHotel(data);
      setShowDetails(true);
    } catch (error) {
      console.error("Error fetching hotel details:", error);
    }
  }, []);

  const handleMoreInfo = useCallback(
    (hotel) => {
      fetchHotelDetails(hotel.id);
    },
    [fetchHotelDetails]
  );

  const loadHotels = useCallback(async () => {
    await fetchHotels();
  }, [fetchHotels]);

  return {
    hotels,
    selectedHotel,
    showDetails,
    fetchHotels,
    handleMoreInfo,
    loadHotels,
    setShowDetails,
  };
};
