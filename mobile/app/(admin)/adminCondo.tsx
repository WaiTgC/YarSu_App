// app/(admin)/admincondo.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { styles } from "@/assets/styles/adminstyles/condo.styles";

// Define the Condo type
type CondoType = {
  id: number;
  name: string;
  location: string;
  price: string;
};

const AdminCondo = () => {
  const router = useRouter();
  const [condos, setCondos] = useState<CondoType[]>([]);
  const [newCondo, setNewCondo] = useState<Partial<CondoType>>({});

  const handleAddCondo = () => {
    if (newCondo.name && newCondo.location && newCondo.price) {
      const condoToAdd = {
        ...newCondo,
        id: Date.now(), // Temporary ID; replace with real ID from backend
      } as CondoType;
      setCondos([...condos, condoToAdd]);
      setNewCondo({});
      Alert.alert("Added", "New condo has been added!");
    } else {
      Alert.alert("Error", "Please fill all required fields!");
    }
  };

  const handleSave = () => {
    Alert.alert("Saved", "Changes have been saved!");
    // Replace with API call to persist changes
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Condo Management</Text>
      <FlatList
        data={condos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              value={item.name}
              onChangeText={(text) =>
                setCondos(
                  condos.map((c) =>
                    c.id === item.id ? { ...c, name: text } : c
                  )
                )
              }
            />
            <TextInput
              style={styles.input}
              value={item.location}
              onChangeText={(text) =>
                setCondos(
                  condos.map((c) =>
                    c.id === item.id ? { ...c, location: text } : c
                  )
                )
              }
            />
            <TextInput
              style={styles.input}
              value={item.price}
              onChangeText={(text) =>
                setCondos(
                  condos.map((c) =>
                    c.id === item.id ? { ...c, price: text } : c
                  )
                )
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.title}>No condos available</Text>
        }
      />
      <View style={styles.editSection}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={newCondo.name || ""}
          onChangeText={(text) => setNewCondo({ ...newCondo, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={newCondo.location || ""}
          onChangeText={(text) => setNewCondo({ ...newCondo, location: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Price"
          value={newCondo.price || ""}
          onChangeText={(text) => setNewCondo({ ...newCondo, price: text })}
        />
        <TouchableOpacity style={styles.button} onPress={handleAddCondo}>
          <Text style={styles.buttonText}>Add Condo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AdminCondo;
