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
    width: "48%",
    height: 136,
    borderRadius: 24,
    marginBottom: 15,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardActive: {
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
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
    fontFamily: "Avenir Next",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: COLORS.background,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    flexGrow: 1, // Allow content to grow and fill space
  },
  imageSlider: {
    flexDirection: "row",
  },
  modalImage: {
    width: Dimensions.get("window").width,
    height: 358,
  },
  modalTitle: {
    paddingHorizontal: 10,
    fontSize: 24,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 10,
    fontFamily: "Avenir Next",
  },
  modalHighlightTitle: {
    paddingHorizontal: 10,
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    marginVertical: 10,
    fontFamily: "Avenir Next",
  },
  highlightItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginVertical: 5,
    padding: 5,
    borderRadius: 5,
  },
  highlightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: "Avenir Next",
    verticalAlign: "center",
    marginLeft: 5,
  },
  star: {
    fontSize: 16,
    color: COLORS.shadow,
    marginRight: 2,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
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
    borderRadius: 5,
    alignItems: "center",
    margin: 20,
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
    padding: 10,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
  },
});
