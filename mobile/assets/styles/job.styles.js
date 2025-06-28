import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "@/constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 10,
  },
  card: {
    width: "100%",
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  location: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 10,
  },
  moreInfoButton: {
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    alignItems: "center",
  },
  applyButton: {
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  closeButton: {
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "600",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.white,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  date: {
    height: 40,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
  },
});
