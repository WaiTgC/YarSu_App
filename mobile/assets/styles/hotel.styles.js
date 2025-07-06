import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "@/constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gridContainer: {
    padding: 17,
  },
  card: {
    borderWidth: 2,
    borderColor: "rgba(243, 243, 243, 0.6)",
    width: "100%", // Full width for single column
    height: 200,
    borderRadius: 24,
    marginBottom: 15,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    color: COLORS.white,
    fontFamily: "Avenir",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    textShadowColor: COLORS.background,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    alignSelf: "end",
    marginRight: 20,
  },
  imageSlider: {
    flexDirection: "row",
    marginBottom: 10,
  },
  modalImage: {
    paddingHorizontal: 16,
    paddingVertical: 21,
    width: Dimensions.get("window").width,
    height: 260,
    borderRadius: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 10,
    letterSpacing: 0.72,
    fontFamily: "Avenir Next",
  },
  modalHighlightTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    marginVertical: 10,
    fontFamily: "Avenir Next",
  },
  highlightItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 5,
  },
  highlightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  modalText: {
    fontSize: 14,
    color: COLORS.white,
    fontFamily: "Avenir Next Condensed",
    marginVertical: 5,
    fontWeight: "600",
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTextmap: {
    fontSize: 12,
    color: COLORS.white,
    fontFamily: "Avenir Next",
    textDecorationLine: "underline",
    fontWeight: "400",
    marginBottom: 5,
  },
  star: {
    fontSize: 16,
    color: COLORS.shadow,
    marginRight: 2,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: COLORS.text,
  },
  closeButton: {
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    alignItems: "center",

    marginHorizontal: 20,
  },
  buttonText: {
    color: COLORS.background,
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
  },
  cardTitle: {
    flexDirection: "column",
    padding: 17,
  },
  cardTitleText1: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: "Avenir Next",
  },
  cardTitleText2: {
    fontWeight: "600",
    fontSize: 30,
    color: COLORS.text,
    fontFamily: "Avenir Next",
  },
  detailsContainer: {
    padding: 15,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
  },
  customModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    height: "100%",
  },
  modalBody: {
    flexGrow: 1,
    padding: 10,
  },
});
