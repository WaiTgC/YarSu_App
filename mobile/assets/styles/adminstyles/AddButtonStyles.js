import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";

export const styles = StyleSheet.create({
  addButton: {
    padding: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 804,
    height: "auto",
    backgroundColor: COLORS.white,
    borderRadius: 24,
  },
  modalHeader: {
    height: 70,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: COLORS.background,
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
  },
  modalText: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.white,
    margin: "auto",
  },
  closeButton: {
    position: "absolute",
    right: 20,
  },
  modalBody: {
    flex: 1,
    alignItems: "center",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    width: "90%",
  },
  label: {
    fontSize: 15,
    fontWeight: "400",
    color: COLORS.black,
    marginRight: 20,
    width: 120,
    textAlign: "right",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: COLORS.black,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
  },
  booleanInput: {
    width: 120,
  },
  radioGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    marginBottom: 5,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.black,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },
  radioLabel: {
    fontSize: 14,
    color: COLORS.lightGray,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "90%",
    marginVertical: 20,
  },
  modalButton: {
    padding: 12,
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    width: 223,
    margin: "auto",
  },
  addButtonModal: {
    backgroundColor: COLORS.background,
  },
  modalButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
  },
  icon: {
    width: 40,
    height: 40,
  },
  imageInput: {
    width: 90,
    height: 90,
    borderColor: COLORS.black,
    borderWidth: 1,
    borderBottomWidth: 2, // Underline effect
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  imagePreview: {
    width: 90,
    height: 90,
    borderRadius: 10,
    resizeMode: "cover",
  },
});
