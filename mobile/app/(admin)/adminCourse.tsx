// import React, { useEffect, useState, useCallback, useRef } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   Modal,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { styles } from "@/assets/styles/adminstyles/course.styles"; // Ensure this path is correct
// import { useCourses } from "@/hooks/useCourses";
// import { useLanguage } from "@/context/LanguageContext";
// import { labels } from "@/libs/language";

// // Define the Course type based on the provided structure
// type CourseType = {
//   id: number;
//   name: string;
//   duration: string;
//   price: number;
//   centre_name: string;
//   location: string;
// };

// // Define type for edited values
// type EditedCourseType = Partial<{
//   name: string;
//   duration: string;
//   price: string | number;
//   centre_name: string;
//   location: string;
// }>;

// const AdminCourse = () => {
//   const router = useRouter();
//   const { language } = useLanguage();
//   const { courses, loadCourses, updateCourse, deleteCourse } = useCourses();
//   const [posts, setPosts] = useState<CourseType[]>([]);
//   const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
//   const [editedValues, setEditedValues] = useState<{
//     [key: number]: EditedCourseType;
//   }>({});
//   const [deleteModalVisible, setDeleteModalVisible] = useState<number | null>(
//     null
//   );

//   useEffect(() => {
//     loadCourses().catch((error) => {
//       console.error("Failed to load courses:", error);
//     });
//   }, [loadCourses]);

//   useEffect(() => {
//     console.log("AdminCourse: Updating posts with courses", courses);
//     setPosts(courses || []);
//   }, [courses]);

//   const handleEdit = (id: number, field: string, value: string) => {
//     setEditedValues((prev) => ({
//       ...prev,
//       [id]: { ...prev[id], [field]: value },
//     }));
//   };

//   const handleSave = async (id: number) => {
//     const courseData = editedValues[id] || {};
//     if (
//       courseData.name &&
//       courseData.duration &&
//       courseData.price &&
//       courseData.centre_name &&
//       courseData.location
//     ) {
//       const updatedData = {
//         ...courseData,
//         price: Number(courseData.price),
//       };
//       try {
//         await updateCourse(id, updatedData);
//         setEditMode((prev) => ({ ...prev, [id]: false }));
//         setEditedValues((prev) => {
//           const newValues = { ...prev };
//           delete newValues[id];
//           return newValues;
//         });
//         Alert.alert(
//           "Saved",
//           labels[language].saved || "Changes have been saved!"
//         );
//       } catch (error) {
//         Alert.alert("Error", "Failed to update course");
//       }
//     } else {
//       setEditMode((prev) => ({ ...prev, [id]: false }));
//     }
//   };

//   const handleDelete = async (id: number) => {
//     try {
//       await deleteCourse(id);
//       setDeleteModalVisible(null);
//       setPosts(posts.filter((post) => post.id !== id));
//       Alert.alert(
//         "Deleted",
//         labels[language].deleted || "Course has been deleted!"
//       );
//     } catch (error) {
//       Alert.alert("Error", "Failed to delete course");
//     }
//   };

//   const renderItem = ({ item }: { item: CourseType }) => {
//     if (!item) return null; // Safeguard against undefined item
//     return (
//       <View style={styles.card}>
//         <View style={styles.detailsContainer}>
//           <View style={styles.fieldRow}>
//             <Text style={styles.label}>{labels[language].name || "Name"}:</Text>
//             {editMode[item.id] ? (
//               <TextInput
//                 style={styles.input}
//                 value={editedValues[item.id]?.name || item.name || ""}
//                 onChangeText={(text) => handleEdit(item.id, "name", text)}
//                 placeholder="Enter name"
//               />
//             ) : (
//               <Text style={styles.value}>{item.name || "N/A"}</Text>
//             )}
//           </View>
//           <View style={styles.fieldRow}>
//             <Text style={styles.label}>
//               {labels[language].duration || "Duration"}:
//             </Text>
//             {editMode[item.id] ? (
//               <TextInput
//                 style={styles.input}
//                 value={editedValues[item.id]?.duration || item.duration || ""}
//                 onChangeText={(text) => handleEdit(item.id, "duration", text)}
//                 placeholder="Enter duration"
//               />
//             ) : (
//               <Text style={styles.value}>{item.duration || "N/A"}</Text>
//             )}
//           </View>
//           <View style={styles.fieldRow}>
//             <Text style={styles.label}>
//               {labels[language].price || "Price"}:
//             </Text>
//             {editMode[item.id] ? (
//               <TextInput
//                 style={styles.input}
//                 value={
//                   editedValues[item.id]?.price !== undefined
//                     ? String(editedValues[item.id].price)
//                     : String(item.price || 0)
//                 }
//                 onChangeText={(text) => handleEdit(item.id, "price", text)}
//                 placeholder="Enter price"
//                 keyboardType="numeric"
//               />
//             ) : (
//               <Text style={styles.value}>
//                 {item.price ? `THB ${item.price}` : "N/A"}
//               </Text>
//             )}
//           </View>
//           <View style={styles.fieldRow}>
//             <Text style={styles.label}>
//               {labels[language].centreName || "Centre Name"}:
//             </Text>
//             {editMode[item.id] ? (
//               <TextInput
//                 style={styles.input}
//                 value={
//                   editedValues[item.id]?.centre_name || item.centre_name || ""
//                 }
//                 onChangeText={(text) =>
//                   handleEdit(item.id, "centre_name", text)
//                 }
//                 placeholder="Enter centre name"
//               />
//             ) : (
//               <Text style={styles.value}>{item.centre_name || "N/A"}</Text>
//             )}
//           </View>
//           <View style={styles.fieldRow}>
//             <Text style={styles.label}>
//               {labels[language].location || "Location"}:
//             </Text>
//             {editMode[item.id] ? (
//               <TextInput
//                 style={styles.input}
//                 value={editedValues[item.id]?.location || item.location || ""}
//                 onChangeText={(text) => handleEdit(item.id, "location", text)}
//                 placeholder="Enter location"
//               />
//             ) : (
//               <Text style={styles.value}>{item.location || "N/A"}</Text>
//             )}
//           </View>
//         </View>
//         <View style={styles.buttonContainer}>
//           {editMode[item.id] ? (
//             <TouchableOpacity
//               style={styles.button}
//               onPress={() => handleSave(item.id)}
//             >
//               <Text style={styles.buttonText}>
//                 {labels[language].save || "Save"}
//               </Text>
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity
//               style={styles.button}
//               onPress={() => setEditMode({ ...editMode, [item.id]: true })}
//             >
//               <Text style={styles.buttonText}>
//                 {labels[language].edit || "Edit"}
//               </Text>
//             </TouchableOpacity>
//           )}
//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => setDeleteModalVisible(item.id)}
//           >
//             <Text style={styles.buttonText}>
//               {labels[language].delete || "Delete"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//         <Modal
//           transparent={true}
//           visible={deleteModalVisible === item.id}
//           onRequestClose={() => setDeleteModalVisible(null)}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContent}>
//               <Text style={styles.modalText}>
//                 {labels[language].deleteConfirm ||
//                   "Are you sure you want to delete this course?"}
//               </Text>
//               <View style={styles.modalButtonContainer}>
//                 <TouchableOpacity
//                   style={[styles.modalButton, styles.cancelButton]}
//                   onPress={() => setDeleteModalVisible(null)}
//                 >
//                   <Text style={styles.modalButtonText}>
//                     {labels[language].cancel || "Cancel"}
//                   </Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.modalButton, styles.deleteButton]}
//                   onPress={() => handleDelete(item.id)}
//                 >
//                   <Text style={styles.modalButtonText}>
//                     {labels[language].delete || "Delete"}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.listContainer}>
//         <FlatList
//           showsVerticalScrollIndicator={false}
//           data={posts}
//           numColumns={3} // Set to 3 items per row
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={renderItem}
//           showsHorizontalScrollIndicator={false}
//           columnWrapperStyle={styles.row} // Style for each row of 3 items
//           ListEmptyComponent={
//             <Text style={styles.title}>
//               {labels[language].noCourses || "No courses available"}
//             </Text>
//           }
//         />
//       </View>
//     </View>
//   );
// };

// export default AdminCourse;

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { styles } from "@/assets/styles/adminstyles/course.styles"; // Ensure this path is correct
import { useCourses } from "@/hooks/useCourses";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";

// Define the Course type based on the provided structure
type CourseType = {
  id: number;
  name: string;
  duration: string;
  price: number;
  centre_name: string;
  location: string;
};

// Define type for edited values
type EditedCourseType = Partial<{
  name: string;
  duration: string;
  price: string | number;
  centre_name: string;
  location: string;
}>;

const AdminCourse = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const { courses, loadCourses, updateCourse, deleteCourse } = useCourses();
  const [posts, setPosts] = useState<CourseType[]>([]);
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [editedValues, setEditedValues] = useState<{
    [key: number]: EditedCourseType;
  }>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState<number | null>(
    null
  );

  useEffect(() => {
    loadCourses().catch((error) => {
      console.error("Failed to load courses:", error);
    });
  }, [loadCourses]);

  useEffect(() => {
    console.log("AdminCourse: Updating posts with courses", courses);
    setPosts(courses || []);
  }, [courses]);

  const handleEdit = (id: number, field: string, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id: number) => {
    const courseData = editedValues[id] || {};
    if (
      courseData.name &&
      courseData.duration &&
      courseData.price &&
      courseData.centre_name &&
      courseData.location
    ) {
      const updatedData = {
        ...courseData,
        price: Number(courseData.price),
      };
      try {
        await updateCourse(id, updatedData);
        setEditMode((prev) => ({ ...prev, [id]: false }));
        setEditedValues((prev) => {
          const newValues = { ...prev };
          delete newValues[id];
          return newValues;
        });
        Alert.alert(
          "Saved",
          labels[language].saved || "Changes have been saved!"
        );
      } catch (error) {
        Alert.alert("Error", "Failed to update course");
      }
    } else {
      setEditMode((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCourse(id);
      setDeleteModalVisible(null);
      setPosts(posts.filter((post) => post.id !== id));
      Alert.alert(
        "Deleted",
        labels[language].deleted || "Course has been deleted!"
      );
    } catch (error) {
      Alert.alert("Error", "Failed to delete course");
    }
  };

  const renderItem = ({ item }: { item: CourseType }) => {
    if (!item) return null; // Safeguard against undefined item
    return (
      <View style={styles.card}>
        <View style={styles.detailsContainer}>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>{labels[language].name || "Name"}:</Text>
            {editMode[item.id] ? (
              <TextInput
                style={styles.input}
                value={editedValues[item.id]?.name || item.name || ""}
                onChangeText={(text) => handleEdit(item.id, "name", text)}
                placeholder="Enter name"
              />
            ) : (
              <Text style={styles.value}>{item.name || "N/A"}</Text>
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>
              {labels[language].duration || "Duration"}:
            </Text>
            {editMode[item.id] ? (
              <TextInput
                style={styles.input}
                value={editedValues[item.id]?.duration || item.duration || ""}
                onChangeText={(text) => handleEdit(item.id, "duration", text)}
                placeholder="Enter duration"
              />
            ) : (
              <Text style={styles.value}>{item.duration || "N/A"}</Text>
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>
              {labels[language].price || "Price"}:
            </Text>
            {editMode[item.id] ? (
              <TextInput
                style={styles.input}
                value={
                  editedValues[item.id]?.price !== undefined
                    ? String(editedValues[item.id].price)
                    : String(item.price || 0)
                }
                onChangeText={(text) => handleEdit(item.id, "price", text)}
                placeholder="Enter price"
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.value}>
                {item.price ? `THB ${item.price}` : "N/A"}
              </Text>
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>
              {labels[language].centreName || "Centre Name"}:
            </Text>
            {editMode[item.id] ? (
              <TextInput
                style={styles.input}
                value={
                  editedValues[item.id]?.centre_name || item.centre_name || ""
                }
                onChangeText={(text) =>
                  handleEdit(item.id, "centre_name", text)
                }
                placeholder="Enter centre name"
              />
            ) : (
              <Text style={styles.value}>{item.centre_name || "N/A"}</Text>
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>
              {labels[language].location || "Location"}:
            </Text>
            {editMode[item.id] ? (
              <TextInput
                style={styles.input}
                value={editedValues[item.id]?.location || item.location || ""}
                onChangeText={(text) => handleEdit(item.id, "location", text)}
                placeholder="Enter location"
              />
            ) : (
              <Text style={styles.value}>{item.location || "N/A"}</Text>
            )}
          </View>
        </View>
        <View style={styles.buttonContainer}>
          {editMode[item.id] ? (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleSave(item.id)}
            >
              <Text style={styles.buttonText}>
                {labels[language].save || "Save"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setEditMode({ ...editMode, [item.id]: true })}
            >
              <Text style={styles.buttonText}>
                {labels[language].edit || "Edit"}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setDeleteModalVisible(item.id)}
          >
            <Text style={styles.buttonText}>
              {labels[language].delete || "Delete"}
            </Text>
          </TouchableOpacity>
        </View>
        <Modal
          transparent={true}
          visible={deleteModalVisible === item.id}
          onRequestClose={() => setDeleteModalVisible(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                {labels[language].deleteConfirm ||
                  "Are you sure you want to delete this course?"}
              </Text>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setDeleteModalVisible(null)}
                >
                  <Text style={styles.modalButtonText}>
                    {labels[language].cancel || "Cancel"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.modalButtonText}>
                    {labels[language].delete || "Delete"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.title}>
              {labels[language].noCourses || "No courses available"}
            </Text>
          }
        />
      </View>
    </View>
  );
};

export default AdminCourse;
