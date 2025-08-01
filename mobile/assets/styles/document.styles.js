import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "@/constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 10,
  },
  listContainer: {
    flex: 1,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(44, 44, 44, 0.30)",
    backgroundColor: "rgba(248, 249, 250, 0.80)",
    margin: 8,
    padding: 15,
  },
  imageContainer: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  imageBackground: {
    width: "80%",
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
  },
  innerImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
  },
  sliderControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 5,
    gap: 5,
    position: "absolute",
    bottom: -20,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  indicator: {
    width: 5,
    height: 5,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#000",
  },
  arrow: {
    fontSize: 25,
    color: "#000000",
  },
  detailsContainer: {
    flex: 1,
  },
  noteContainer: {
    width: "100%",
    minHeight: 100,
    height: "auto",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(217, 217, 217, 0.30)",
    marginTop: 10,
    overflow: "hidden",
  },
  noteTextContainer: {
    width: "100%",
    overflow: "hidden",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  collapsedNoteText: {
    maxHeight: 60,
  },
  dropdownArrow: {
    position: "absolute",
    right: 10,
    bottom: 10,
  },
  value: {
    fontSize: 16,
    color: COLORS.black,
    flex: 1,
  },
});
