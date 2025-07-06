import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "@/constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 15,
  },
  gridContainer: {
    justifyContent: "space-between",
    marginTop: 10,
    rowGap: 20, // Gap between rows
  },
  card: {
    width: "45%", // Adjusted for two columns with gap
    height: "auto",
    padding: 10,
    backgroundColor: " rgba(248, 249, 250, 0.80)",
    borderRadius: 12,
    marginBottom: 10,
    marginHorizontal: 10, // Gap between columns
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: "100%",
    height: 135,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    margin: "auto",
  },
  textContainer: {
    flexDirection: "column",
    padding: 5,
    gap: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: "400",
    color: COLORS.black,
    fontFamily: "SF Pro",
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 5,
    margin: "auto",
  },
  logo: {
    width: 18,
    height: 18,
    marginRight: 5,
  },
  logoContainer: {
    flexDirection: "row",
  },
  star: {
    fontSize: 18,
    color: COLORS.black,
    marginRight: 2,
  },
  location: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: "SF Pro",
    fontWeight: "400",
    letterSpacing: 0.12,
    lineHeight: 15,
    fontStyle: "normal",
  },
  detailText: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: "SF Pro",
    fontWeight: "400",
    letterSpacing: 0.12,
    lineHeight: 15,
    fontStyle: "normal",
    marginTop: 5,
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
});
