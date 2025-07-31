import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  listContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 5,
    flex: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  cardImage: {
    width: "100%",
    height: 100,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  textContainer: {
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  cardTitle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitleText1: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  cardTitleText2: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff6347",
    marginLeft: 5,
  },
  gridContainer: {
    paddingBottom: 20,
  },
  detailsContainer: {
    padding: 10,
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    width: "40%",
  },
  value: {
    fontSize: 14,
    color: "#666",
    width: "55%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
    width: "55%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  button: {
    backgroundColor: "#ff6347",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
    minWidth: 80,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  imageBackground: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    overflow: "hidden",
  },
  innerImage: {
    width: 200,
    height: 150,
  },
  noImages: {
    height: 20,
  },
  sliderControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  arrow: {
    fontSize: 20,
    color: "#333",
    paddingHorizontal: 10,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#ff6347",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    padding: 10,
    borderRadius: 4,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  deleteButton: {
    backgroundColor: "#ff6347",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  detailContainer: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 10,
    elevation: 2,
  },
  detailMedia: {
    width: "100%",
    height: 200,
    marginVertical: 10,
    borderRadius: 8,
  },
  backButton: {
    backgroundColor: "#ff6347",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});