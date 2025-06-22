import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { persistence } from '../persistence'; // Import the central persistence interface

const PetFormScreen = ({ route, navigation }) => {
  const existingPet = route.params?.pet;
  const onPetSaved = route.params?.onPetSaved; // Callback to refresh list

  const [name, setName] = useState(existingPet?.name || '');
  const [species, setSpecies] = useState(existingPet?.species || '');
  const [breed, setBreed] = useState(existingPet?.breed || '');
  const [dob, setDob] = useState(existingPet?.dob || '');
  const [notes, setNotes] = useState(existingPet?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePet = async () => {
    if (!name || !species) {
      Alert.alert('Erro', 'Nome e Espécie são obrigatórios.');
      return;
    }
    setIsSaving(true);
    const petData = {
      id: existingPet?.id || Date.now().toString(),
      name,
      species,
      breed,
      dob,
      notes,
    };

    try {
      await persistence.savePet(petData); // Use the persistence interface
      setIsSaving(false);
      Alert.alert('Sucesso', `Pet ${existingPet ? 'atualizado' : 'adicionado'} com sucesso!`);
      if (onPetSaved) {
        onPetSaved(); // Call the callback to refresh the list
      }
      navigation.goBack(); // Go back to the list screen
    } catch (error) {
      setIsSaving(false);
      console.error("Error saving pet:", error);
      Alert.alert('Erro', `Não foi possível salvar o pet. Detalhes: ${error.message}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{existingPet ? 'Editar Pet' : 'Adicionar Novo Pet'}</Text>

      <Text style={styles.label}>Nome do Pet:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ex: Billy"
        editable={!isSaving}
      />

      <Text style={styles.label}>Espécie:</Text>
      <TextInput
        style={styles.input}
        value={species}
        onChangeText={setSpecies}
        placeholder="Ex: Cão, Gato"
        editable={!isSaving}
      />

      <Text style={styles.label}>Raça:</Text>
      <TextInput
        style={styles.input}
        value={breed}
        onChangeText={setBreed}
        placeholder="Ex: Poodle, Siamês (Opcional)"
        editable={!isSaving}
      />

      <Text style={styles.label}>Data de Nascimento:</Text>
      <TextInput
        style={styles.input}
        value={dob}
        onChangeText={setDob}
        placeholder="DD/MM/AAAA (Opcional)"
        editable={!isSaving}
        // Consider using a Date Picker component here later
      />

      <Text style={styles.label}>Anotações:</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Alergias, cuidados especiais, etc. (Opcional)"
        multiline
        editable={!isSaving}
      />

      <View style={styles.buttonContainer}>
        <Button title="Salvar Pet" onPress={handleSavePet} color="#38761D" disabled={isSaving} />
        <View style={styles.spacer} />
        <Button title="Cancelar" onPress={() => navigation.goBack()} color="#888" disabled={isSaving} />
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F3F9F1',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#38761D',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9EAD3',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40, // Add some bottom margin
  },
  spacer: {
    height: 10, // Space between buttons
  },
});

export default PetFormScreen;

