// app/(admin)/admin.styles.ts
import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "@/constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: COLORS.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sidebarTrigger: {
    padding: 10,
  },
  welcomeContainer: {
    marginLeft: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.text,
  },
  usernameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerLogo: {
    width: 100,
    height: 40,
  },
  headerRight: {
    padding: 10,
  },
  contentContainer: {
    flex: 1,
  },
  greetingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  banner: {
    width: "100%",
    height: 150,
  },
  telegramText: {
    fontSize: 14,
    color: COLORS.shadow,
    textAlign: "center",
    marginVertical: 10,
  },
  joinTele: {
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  iconTele: {
    marginRight: 5,
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
  button: {
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: COLORS.background,
    fontWeight: "600",
    textAlign: "center",
  },
});
