// // styles/home.styles.js
// import { StyleSheet } from "react-native";
// import { COLORS } from "@/constants/colors";

// export const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   content: {
//     padding: 20,
//     paddingBottom: 0,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//     paddingHorizontal: 0,
//     paddingVertical: 12,
//   },
//   headerLeft: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   headerLogo: {
//     width: 75,
//     height: 75,
//   },
//   welcomeContainer: {
//     flex: 1,
//   },
//   welcomeText: {
//     fontSize: 14,
//     color: COLORS.textLight,
//     marginBottom: 2,
//   },
//   usernameText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: COLORS.text,
//   },
//   headerRight: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: COLORS.text,
//   },
//   addButton: {
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 24,
//     flexDirection: "row",
//     alignItems: "center",
//     boxColor: "#000",
//     boxOffset: { width: 0, height: 2 },
//     boxOpacity: 0.1,
//     boxRadius: 4,
//     elevation: 3,
//   },
//   addButtonText: {
//     color: COLORS.white,
//     fontWeight: "600",
//     marginLeft: 4,
//   },
//   logoutButton: {
//     padding: 10,
//     borderRadius: 20,
//     backgroundColor: COLORS.card,
//     boxColor: "#000",
//     boxOffset: { width: 0, height: 1 },
//     boxOpacity: 0.05,
//     boxRadius: 2,
//     elevation: 1,
//   },
//   balanceCard: {
//     backgroundColor: COLORS.card,
//     borderRadius: 20,
//     padding: 20,
//     marginBottom: 20,
//     boxColor: COLORS.box,
//     boxOffset: {
//       width: 0,
//       height: 2,
//     },
//     boxOpacity: 0.1,
//     boxRadius: 3,
//     elevation: 3,
//   },
//   balanceTitle: {
//     fontSize: 16,
//     color: COLORS.textLight,
//     marginBottom: 8,
//   },
//   balanceAmount: {
//     fontSize: 32,
//     fontWeight: "bold",
//     color: COLORS.text,
//     marginBottom: 20,
//   },
//   balanceStats: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   balanceStatItem: {
//     flex: 1,
//     alignItems: "center",
//   },
//   statDivider: {
//     borderRightWidth: 1,
//     borderColor: COLORS.border,
//   },
//   balanceStatLabel: {
//     fontSize: 14,
//     color: COLORS.textLight,
//     marginBottom: 4,
//   },
//   balanceStatAmount: {
//     fontSize: 18,
//     fontWeight: "600",
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: COLORS.text,
//     marginBottom: 15,
//   },
//   transactionCard: {
//     backgroundColor: COLORS.card,
//     borderRadius: 12,
//     marginBottom: 10,
//     flexDirection: "row",
//     alignItems: "center",
//     boxColor: COLORS.box,
//     boxOffset: {
//       width: 0,
//       height: 1,
//     },
//     boxOpacity: 0.1,
//     boxRadius: 2,
//     elevation: 2,
//   },
//   transactionContent: {
//     flex: 1,
//     flexDirection: "row",
//     padding: 15,
//     alignItems: "center",
//   },
//   categoryIconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#F5F5F5",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   transactionLeft: {
//     flex: 1,
//   },
//   transactionTitle: {
//     fontSize: 16,
//     fontWeight: "500",
//     color: COLORS.text,
//     marginBottom: 4,
//   },
//   transactionCategory: {
//     fontSize: 14,
//     color: COLORS.textLight,
//   },
//   transactionRight: {
//     alignItems: "flex-end",
//   },
//   transactionAmount: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 4,
//   },
//   transactionDate: {
//     fontSize: 12,
//     color: COLORS.textLight,
//   },
//   deleteButton: {
//     padding: 15,
//     borderLeftWidth: 1,
//     borderLeftColor: COLORS.border,
//   },
//   transactionsContainer: {
//     marginBottom: 20,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: COLORS.background,
//   },
//   emptyState: {
//     backgroundColor: COLORS.card,
//     borderRadius: 16,
//     padding: 30,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 10,
//     boxColor: COLORS.box,
//     boxOffset: { width: 0, height: 1 },
//     boxOpacity: 0.1,
//     boxRadius: 2,
//     elevation: 2,
//   },
//   emptyStateIcon: {
//     marginBottom: 16,
//   },
//   emptyStateTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: COLORS.text,
//     marginBottom: 8,
//   },
//   emptyStateText: {
//     color: COLORS.textLight,
//     fontSize: 14,
//     textAlign: "center",
//     marginBottom: 20,
//     lineHeight: 20,
//   },
//   emptyStateButton: {
//     backgroundColor: COLORS.primary,
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     boxColor: "#000",
//     boxOffset: { width: 0, height: 2 },
//     boxOpacity: 0.1,
//     boxRadius: 3,
//     elevation: 2,
//   },
//   emptyStateButtonText: {
//     color: COLORS.white,
//     fontWeight: "600",
//     marginLeft: 6,
//   },
//   transactionsHeaderContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//     paddingBottom: 5,
//   },
//   transactionsList: {
//     flex: 1,
//     marginHorizontal: 20,
//   },
//   transactionsListContent: {
//     paddingBottom: 20,
//   },
// });
import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "@/constants/colors";
import { transform } from "@babel/core";

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
    padding: 16,
    backgroundColor: COLORS.white,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 1,
  },
  headerLogo: {
    width: 56,
    height: 51,
  },
  welcomeContainer: {
    flexDirection: "column",
  },
  welcomeText: {
    fontSize: 15,
    color: COLORS.textLight,
  },
  greetingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingText: {
    fontSize: 15,
    color: COLORS.textLight,
    margin: 20,
    fontWeight: "400",
    width: 157,
    height: 38,
  },
  lanButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  logo: {
    width: 25,
    height: 25,
  },
  separator: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.white,
    marginVertical: 10,
    marginHorizontal: 10,
  },
  telegramText: {
    fontSize: 15,
    color: COLORS.textLight,
    margin: 20,
    fontWeight: "400",
    textAlign: "center",
  },
  joinTele: {
    margin: "auto",
    backgroundColor: COLORS.white,
    width: 120,
    height: "auto",
    padding: 10,
    borderRadius: 10,
    flexShrink: 0,
    alignItems: "center",
    marginBottom: 10,
  },
  iconTele: {
    padding: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: "50%",
  },
  usernameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  headerCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.white,
    marginLeft: 4,
  },
  contentContainer: {
    flex: 1,
  },
  sidebarTrigger: {
    padding: 8,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gridTemplateRows: "repeat(4, 1fr)",
    gap: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 15,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    maxWidth: 200,
    width: "100% ",
    height: "58px",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    transform: [{ scale: 1 }],
    // Animation inspired by hover:scale-105 and animate-float-up
    animationDuration: "0.3s",
    animationTimingFunction: "ease-in-out",
  },
  iconContainer: {
    width: 170,
    height: 58,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12, // Adjusted from mb-3 (12px)
    flexDirection: "row",
  },

  icon: {
    color: COLORS.white,
    fontSize: 24,
    display: "flex",
  },
  cardText: {
    fontSize: 14, // Adjusted from text-sm (14px) to md:text-base (16px) context
    fontWeight: "600", // Adjusted from font-semibold
    color: COLORS.text,
    textAlign: "center",
  },
  banner: {
    width: 366,
    height: 148,
    borderRadius: 15,
    flexShrink: 0,
  },
});
