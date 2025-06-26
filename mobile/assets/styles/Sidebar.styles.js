import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";

export const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: COLORS.background,
    padding: 16,
    flex: 1,
  },
  sidebarHeader: {
    padding: 16,
    alignItems: "center",
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  sidebarContent: {
    flex: 1,
    padding: 8,
  },
  sidebarGroup: {
    marginBottom: 16,
  },
  groupLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  menuButton: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  activeMenuButton: {
    backgroundColor: COLORS.primary,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuText: {
    fontSize: 16,
    color: COLORS.text,
  },
  activeMenuText: {
    color: COLORS.white,
  },
  logoutButton: {
    backgroundColor: COLORS.background,
  },
});
