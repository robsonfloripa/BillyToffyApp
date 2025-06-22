import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  SafeAreaView,
  Platform,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { persistence } from '../persistence';

const HealthRecordFormScreen = ({ route, navigation }) => {
  const { record, petId, onRecordSaved } = route.params || {};
  const isEditing = !!record;
  
  // Generate a unique ID for new health records
  const generateId = () => `health_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  // State for form fields
  const [formData, setFormData] = useState({
    id: record?.id || generateId(),
    type: record?.type || '',
    date: record?.date || new Date().toISOString().split('T')[0],
    pet_id: record?.pet_id || petId || '',
    pet_name: record?.pet_name || '',
    dose: record?.dose || '',
    expiry_date: record?.expiry_date || '',
    notes: record?.notes || '',
  });
  
  // State for available pets
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPetPicker, setShowPetPicker] = useState(false);
  
  // Load pets on component mount
  useEffect(() => {
    const loadPets = async () => {
      try {
        const storedPets = await persistence.getPets();
        setPets(storedPets);
        
        // If petId is provided and pet_name is not set, find the pet name
        if (petId && !formData.pet_name) {
          const selectedPet = storedPets.find(pet => pet.id === petId);
          if (selectedPet) {
            setFormData(prev => ({
              ...prev,
              pet_name: selectedPet.name
            }));
          }
        }
      } catch (error) {
        console.error('Error loading pets:', error);
        Alert.alert('Erro', 'Não foi possível carregar a lista de pets.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPets();
  }, []);
  
  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // Set today's date
  const setToday = () => {
    handleChange('date', new Date().toISOString().split('T')[0]);
  };
  
  // Set expiry date to one year from today
  const setOneYearExpiry = () => {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    handleChange('expiry_date', oneYearFromNow.toISOString().split('T')[0]);
  };
  
  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    
    try {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  };
  
  // Handle pet selection
  const handleSelectPet = (pet) => {
    setFormData({
      ...formData,
      pet_id: pet.id,
      pet_name: pet.name
    });
    setShowPetPicker(false);
  };
  
  // Render pet item in picker
  const renderPetItem = ({ item }) => (
    <TouchableOpacity
      style={styles.petItem}
      onPress={() => handleSelectPet(item)}
    >
      <Text style={styles.petItemText}>{item.name}</Text>
    </TouchableOpacity>
  );
  
  // Save health record
  const handleSave = async () => {
    // Validate required fields
    if (!formData.type) {
      Alert.alert('Erro', 'Por favor, informe o tipo de registro.');
      return;
    }
    
    if (!formData.date) {
      Alert.alert('Erro', 'Por favor, informe a data do registro.');
      return;
    }
    
    if (!formData.pet_id) {
      Alert.alert('Erro', 'Por favor, selecione um pet.');
      return;
    }
    
    try {
      // Save health record to storage
      await persistence.saveHealthRecord(formData);
      
      // Call the callback function if provided
      if (onRecordSaved) {
        onRecordSaved();
      }
      
      // Show success message and navigate back
      Alert.alert(
        'Sucesso', 
        `Registro de saúde ${isEditing ? 'atualizado' : 'adicionado'} com sucesso.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving health record:', error);
      Alert.alert('Erro', `Não foi possível ${isEditing ? 'atualizar' : 'adicionar'} o registro de saúde.`);
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tipo de Registro*</Text>
          <TextInput
            style={styles.input}
            value={formData.type}
            onChangeText={(value) => handleChange('type', value)}
            placeholder="Ex: Vacina, Vermífugo, Medicamento"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Data*</Text>
          <View style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInput}
              value={formatDateForDisplay(formData.date)}
              placeholder="DD/MM/AAAA"
              editable={false}
            />
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={setToday}
            >
              <Text style={styles.dateButtonText}>Hoje</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Pet*</Text>
          <TouchableOpacity 
            style={styles.petSelector}
            onPress={() => setShowPetPicker(true)}
          >
            <Text style={formData.pet_id ? styles.petSelectorText : styles.petSelectorPlaceholder}>
              {formData.pet_id ? formData.pet_name : 'Selecione um pet'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#38761D" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Dose</Text>
          <TextInput
            style={styles.input}
            value={formData.dose}
            onChangeText={(value) => handleChange('dose', value)}
            placeholder="Ex: 1 comprimido, 5ml"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Data de Validade</Text>
          <View style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInput}
              value={formatDateForDisplay(formData.expiry_date)}
              placeholder="DD/MM/AAAA"
              editable={false}
            />
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={setOneYearExpiry}
            >
              <Text style={styles.dateButtonText}>1 Ano</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(value) => handleChange('notes', value)}
            placeholder="Observações adicionais"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Atualizar' : 'Adicionar'} Registro
          </Text>
        </TouchableOpacity>
        
        {/* Add extra padding at the bottom for iOS */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      {/* Pet Picker Modal */}
      <Modal
        visible={showPetPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPetPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione um Pet</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowPetPicker(false)}
              >
                <Ionicons name="close" size={24} color="#38761D" />
              </TouchableOpacity>
            </View>
            
            {pets.length > 0 ? (
              <FlatList
                data={pets}
                renderItem={renderPetItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.petList}
              />
            ) : (
              <Text style={styles.noPetsText}>
                Nenhum pet cadastrado. Adicione um pet primeiro.
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F9F1',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F3F9F1',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#38761D',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9EAD3',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9EAD3',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dateButton: {
    backgroundColor: '#38761D',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  dateButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  petSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9EAD3',
    borderRadius: 8,
    padding: 12,
  },
  petSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  petSelectorPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  noPetsText: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9EAD3',
    borderRadius: 8,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: 16,
  },
  saveButton: {
    backgroundColor: '#38761D',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: Platform.OS === 'ios' ? 40 : 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D9EAD3',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#38761D',
  },
  modalCloseButton: {
    padding: 4,
  },
  petList: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  petItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D9EAD3',
  },
  petItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default HealthRecordFormScreen;
