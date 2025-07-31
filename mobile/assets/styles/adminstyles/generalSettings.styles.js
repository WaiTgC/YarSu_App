import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 10,
    flexDirection: "row",
    margin: "auto",
    gap: 48,
  },
  card: {
    backgroundColor: "rgba(217, 217, 217, 0.60)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 413,
    width: "auto",
    height: "auto",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,

    margin: "auto",
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: COLORS.white,
    flex: 1,
  },
  input: {
    flex: 2,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 5,
    color: COLORS.background,
  },
  valueContainer: {
    flex: 2,
    alignItems: "flex-end",
  },
  value: {
    fontSize: 16,
    color: COLORS.background,
  },
  bannerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  bannerPlaceholder: {
    position: "relative",
  },
  imageWrapper: {
    width: 78,
    height: 82,
    borderRadius: 10,
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    padding: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginLeft: 5,
  },
  actionText: {
    color: COLORS.white,
    fontSize: 16,
    marginLeft: 10,
  },
});
