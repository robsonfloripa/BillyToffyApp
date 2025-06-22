import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Modal,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { persistence } from '../persistence';
// Removendo a importação problemática
// import * as DateTimePicker from 'expo-date-picker';

const ProductFormScreen = ({ route, navigation }) => {
  const existingProduct = route.params?.product;
  const onProductSaved = route.params?.onProductSaved;

  // Form state
  const [name, setName] = useState(existingProduct?.name || '');
  const [type, setType] = useState(existingProduct?.type || '');
  const [applicationDate, setApplicationDate] = useState(
    existingProduct?.application_date ? new Date(existingProduct.application_date) : null
  );
  const [expiryDate, setExpiryDate] = useState(
    existingProduct?.expiry_date ? new Date(existingProduct.expiry_date) : null
  );
  const [notes, setNotes] = useState(existingProduct?.notes || '');
  const [petId, setPetId] = useState(existingProduct?.pet_id || null);
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [pets, setPets] = useState([]);
  const [isLoadingPets, setIsLoadingPets] = useState(true);
  const [showApplicationDatePicker, setShowApplicationDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [selectedPetName, setSelectedPetName] = useState('');

  // Product types for selection
  const productTypes = ['Medicamento', 'Vacina', 'Higiene', 'Alimento', 'Outro'];

  // Load pets for selection
  useEffect(() => {
    const loadPets = async () => {
      try {
        const storedPets = await persistence.getPets();
        setPets(storedPets);
        
        // Set selected pet name if petId exists
        if (petId) {
          const selectedPet = storedPets.find(pet => pet.id === petId);
          if (selectedPet) {
            setSelectedPetName(selectedPet.name);
          }
        }
      } catch (error) {
        console.error('Error loading pets:', error);
        Alert.alert('Erro', 'Não foi possível carregar a lista de pets.');
      } finally {
        setIsLoadingPets(false);
      }
    };

    loadPets();
  }, [petId]);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    
    try {
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return '';
    }
  };

  // Handle application date change
  const onApplicationDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || applicationDate;
    setShowApplicationDatePicker(Platform.OS === 'ios');
    setApplicationDate(currentDate);
  };

  // Handle expiry date change
  const onExpiryDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || expiryDate;
    setShowExpiryDatePicker(Platform.OS === 'ios');
    setExpiryDate(currentDate);
  };

  // Handle pet selection
  const handleSelectPet = (pet) => {
    setPetId(pet.id);
    setSelectedPetName(pet.name);
    setShowPetSelector(false);
  };

  // Handle save product
  const handleSaveProduct = async () => {
    if (!name) {
      Alert.alert('Erro', 'Nome do produto é obrigatório.');
      return;
    }

    if (!type) {
      Alert.alert('Erro', 'Tipo do produto é obrigatório.');
      return;
    }

    setIsSaving(true);

    const productData = {
      id: existingProduct?.id || Date.now().toString(),
      name,
      type,
      application_date: applicationDate ? applicationDate.toISOString() : null,
      expiry_date: expiryDate ? expiryDate.toISOString() : null,
      notes,
      pet_id: petId
    };

    try {
      await persistence.saveProduct(productData);
      setIsSaving(false);
      Alert.alert(
        'Sucesso', 
        `Produto ${existingProduct ? 'atualizado' : 'adicionado'} com sucesso!`
      );
      
      if (onProductSaved) {
        onProductSaved();
      }
      
      navigation.goBack();
    } catch (error) {
      setIsSaving(false);
      console.error('Error saving product:', error);
      Alert.alert('Erro', `Não foi possível salvar o produto. Detalhes: ${error.message}`);
    }
  };

  // Função simplificada para selecionar data sem usar o DateTimePicker
  const selectDate = (isApplicationDate) => {
    // Aqui usamos uma abordagem simplificada sem o DateTimePicker
    // Em um app real, você poderia implementar um seletor de data personalizado
    const today = new Date();
    
    if (isApplicationDate) {
      setApplicationDate(today);
    } else {
      // Para data de validade, definimos como 1 ano a partir de hoje
      const nextYear = new Date();
      nextYear.setFullYear(today.getFullYear() + 1);
      setExpiryDate(nextYear);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>
          {existingProduct ? 'Editar Produto' : 'Adicionar Produto'}
        </Text>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome do Produto:</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Antipulgas"
            editable={!isSaving}
          />
        </View>

        {/* Type Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tipo:</Text>
          <View style={styles.typeContainer}>
            {productTypes.map((productType) => (
              <TouchableOpacity
                key={productType}
                style={[
                  styles.typeButton,
                  type === productType && styles.typeButtonSelected
                ]}
                onPress={() => setType(productType)}
                disabled={isSaving}
              >
                <Text 
                  style={[
                    styles.typeButtonText,
                    type === productType && styles.typeButtonTextSelected
                  ]}
                >
                  {productType}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Application Date Picker - Simplified */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data de Aplicação:</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => selectDate(true)}
            disabled={isSaving}
          >
            <Text style={styles.datePickerButtonText}>
              {applicationDate ? formatDate(applicationDate) : 'Definir como hoje'}
            </Text>
            <Ionicons name="calendar" size={20} color="#38761D" />
          </TouchableOpacity>
        </View>

        {/* Expiry Date Picker - Simplified */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data de Validade:</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => selectDate(false)}
            disabled={isSaving}
          >
            <Text style={styles.datePickerButtonText}>
              {expiryDate ? formatDate(expiryDate) : 'Definir como 1 ano'}
            </Text>
            <Ionicons name="calendar" size={20} color="#38761D" />
          </TouchableOpacity>
        </View>

        {/* Pet Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Associar a um Pet (opcional):</Text>
          <TouchableOpacity
            style={styles.petPickerButton}
            onPress={() => setShowPetSelector(true)}
            disabled={isSaving || isLoadingPets}
          >
            {isLoadingPets ? (
              <ActivityIndicator size="small" color="#38761D" />
            ) : (
              <>
                <Text style={styles.petPickerButtonText}>
                  {selectedPetName || 'Selecionar Pet'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#38761D" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Notes Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Observações:</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Informações adicionais sobre o produto..."
            multiline
            editable={!isSaving}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProduct}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pet Selector Modal */}
      <Modal
        visible={showPetSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPetSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Pet</Text>
              <TouchableOpacity onPress={() => setShowPetSelector(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {pets.length === 0 ? (
              <Text style={styles.noPetsText}>
                Nenhum pet cadastrado. Adicione pets primeiro.
              </Text>
            ) : (
              <ScrollView style={styles.petList}>
                {pets.map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    style={styles.petItem}
                    onPress={() => handleSelectPet(pet)}
                  >
                    <View style={styles.petIconContainer}>
                      <Ionicons name="paw" size={20} color="#38761D" />
                    </View>
                    <View style={styles.petItemInfo}>
                      <Text style={styles.petItemName}>{pet.name}</Text>
                      <Text style={styles.petItemSpecies}>
                        {pet.species}{pet.breed ? ` - ${pet.breed}` : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            
            <TouchableOpacity
              style={styles.clearSelectionButton}
              onPress={() => {
                setPetId(null);
                setSelectedPetName('');
                setShowPetSelector(false);
              }}
            >
              <Text style={styles.clearSelectionButtonText}>Limpar Seleção</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F9F1',
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#38761D',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
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
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D9EAD3',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    marginBottom: 8,
  },
  typeButtonSelected: {
    backgroundColor: '#38761D',
    borderColor: '#38761D',
  },
  typeButtonText: {
    color: '#38761D',
    fontSize: 14,
  },
  typeButtonTextSelected: {
    color: '#FFFFFF',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9EAD3',
    borderRadius: 8,
    padding: 12,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  petPickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9EAD3',
    borderRadius: 8,
    padding: 12,
  },
  petPickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#38761D',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#F3F9F1',
    borderWidth: 1,
    borderColor: '#38761D',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#38761D',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#D9EAD3',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#38761D',
  },
  noPetsText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  petList: {
    maxHeight: 300,
  },
  petItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  petIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  petItemInfo: {
    flex: 1,
  },
  petItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  petItemSpecies: {
    fontSize: 14,
    color: '#666',
  },
  clearSelectionButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  clearSelectionButtonText: {
    color: '#E06666',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ProductFormScreen;
