import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "@/constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gridContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  card: {
    width: "100%",
    height: "auto", // Increased height to fit all details
    borderRadius: 24,
    marginBottom: 15, // Space between cards in column
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "column",
  },
  cardImageContainer: {
    flexDirection: "row",
    zIndex: 100,
  },
  cardImage: {
    width: 135,
    height: 135, // Adjusted for better proportion with details
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(243, 243, 243, 0.60)",
    overflow: "hidden",
    marginTop: 16,
    marginLeft: 8,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(248, 249, 250, 0.70)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
  },
  overlayText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "left",
    fontFamily: "Avenir",
    paddingVertical: 10,
  },
  detailsContainer: {
    padding: 10,
    zIndex: 100,
    marginTop: 0,
    width: "60%",
    height: "70%",
  },
  modalText: {
    fontSize: 14,
    fontWeight: "300",
    color: COLORS.black,
    marginVertical: 2,
    fontFamily: "Avenir",
  },
  cardTitle: {
    flexDirection: "column",
    padding: 17,
  },
  cardTitleText1: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: "Avenir",
  },
  cardTitleText2: {
    fontWeight: "600",
    fontSize: 30,
    color: COLORS.text,
    fontFamily: "Avenir",
  },
  title: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
  },
  amenitiesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
    columnGap: 5,
  },
  amenityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  amenityIcon: {
    width: 16,
    height: 10,
    marginRight: 6,
  },
  contactButton: {
    backgroundColor: COLORS.white, // Adjust color as needed
    paddingVertical: 10,
    paddingHorizontal: 35,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  contactButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
  contactContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    zIndex: 100,
    paddingHorizontal: 22,
  },
});
