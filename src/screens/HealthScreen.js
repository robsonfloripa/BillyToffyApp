import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { persistence } from '../persistence';

const HealthScreen = ({ navigation }) => {
  const [pets, setPets] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Load pets and health records on component mount and when the screen is focused
  useEffect(() => {
    loadData();
    
    // Add listener for when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    
    // Clean up the listener when component unmounts
    return unsubscribe;
  }, [navigation]);

  // Function to load pets and health records from storage
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load pets
      const storedPets = await persistence.getPets();
      setPets(storedPets);
      
      // If there's a selected pet, load its health records
      // Otherwise, load all health records
      let records;
      if (selectedPetId) {
        records = await persistence.getHealthRecordsByPetId(selectedPetId);
      } else {
        records = await persistence.getHealthRecords();
      }
      
      // Sort health records by date (newest first)
      const sortedRecords = records.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      
      setHealthRecords(sortedRecords);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados de saúde.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh when pull-to-refresh is triggered
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Handle pet selection
  const handleSelectPet = (petId) => {
    setSelectedPetId(petId === selectedPetId ? null : petId);
    // Reload data with the new pet filter
    setTimeout(() => loadData(), 100);
  };

  // Navigate to health record form screen for editing
  const handleEditHealthRecord = (record) => {
    navigation.navigate('HealthRecordForm', { 
      record,
      onRecordSaved: loadData
    });
  };

  // Delete health record after confirmation
  const handleDeleteHealthRecord = (recordId, recordType) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir este registro de ${recordType}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await persistence.deleteHealthRecord(recordId);
              loadData(); // Reload the list after deletion
              Alert.alert('Sucesso', 'Registro removido com sucesso.');
            } catch (error) {
              console.error('Error deleting health record:', error);
              Alert.alert('Erro', 'Não foi possível excluir o registro.');
            }
          }
        }
      ]
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return 'Data inválida';
    }
  };

  // Get status based on expiry date
  const getExpiryStatus = (expiryDateString) => {
    if (!expiryDateString) return { color: '#999', text: 'Sem data' };
    
    try {
      const today = new Date();
      const expiryDate = new Date(expiryDateString);
      
      // Calculate difference in days
      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return { color: '#E06666', text: 'Vencido' };
      } else if (diffDays <= 30) {
        return { color: '#F1C232', text: 'Próximo ao vencimento' };
      } else {
        return { color: '#6AA84F', text: 'Válido' };
      }
    } catch (e) {
      return { color: '#999', text: 'Erro na data' };
    }
  };

  // Render pet filter item
  const renderPetItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.petFilterItem,
        selectedPetId === item.id && styles.petFilterItemSelected
      ]}
      onPress={() => handleSelectPet(item.id)}
    >
      <Text 
        style={[
          styles.petFilterText,
          selectedPetId === item.id && styles.petFilterTextSelected
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Render each health record item
  const renderHealthRecordItem = ({ item }) => {
    const expiryStatus = getExpiryStatus(item.expiry_date);
    
    return (
      <View style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <View style={styles.recordTypeContainer}>
            <Text style={styles.recordType}>{item.type}</Text>
          </View>
          {item.expiry_date && (
            <View style={[styles.statusContainer, { backgroundColor: expiryStatus.color }]}>
              <Text style={styles.statusText}>{expiryStatus.text}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.recordInfo}>
          <Text style={styles.recordDate}>
            Data: {formatDate(item.date)}
          </Text>
          
          {item.pet_name && (
            <View style={styles.petContainer}>
              <Ionicons name="paw" size={16} color="#38761D" />
              <Text style={styles.petName}>{item.pet_name}</Text>
            </View>
          )}
          
          {item.dose && (
            <Text style={styles.recordDose}>Dose: {item.dose}</Text>
          )}
          
          {item.expiry_date && (
            <Text style={styles.recordExpiry}>
              Validade: {formatDate(item.expiry_date)}
            </Text>
          )}
          
          {item.notes && <Text style={styles.recordNotes}>{item.notes}</Text>}
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditHealthRecord(item)}
          >
            <Ionicons name="create-outline" size={22} color="#38761D" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteHealthRecord(item.id, item.type)}
          >
            <Ionicons name="trash-outline" size={22} color="#E06666" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Empty list component
  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="medkit-outline" size={60} color="#D9EAD3" />
      <Text style={styles.emptyText}>
        {selectedPetId 
          ? 'Nenhum registro de saúde para este pet' 
          : 'Nenhum registro de saúde cadastrado'}
      </Text>
      <Text style={styles.emptySubText}>
        Toque no botão "+" para adicionar um novo registro
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Pet filter */}
        {pets.length > 0 && (
          <View style={styles.petFilterContainer}>
            <FlatList
              data={pets}
              renderItem={renderPetItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.petFilterList}
            />
          </View>
        )}
        
        {/* Health records list */}
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38761D" />
            <Text style={styles.loadingText}>Carregando registros de saúde...</Text>
          </View>
        ) : (
          <FlatList
            data={healthRecords}
            renderItem={renderHealthRecordItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={EmptyListComponent}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )}
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('HealthRecordForm', { 
            petId: selectedPetId,
            onRecordSaved: loadData 
          })}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#F3F9F1',
  },
  petFilterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D9EAD3',
  },
  petFilterList: {
    paddingHorizontal: 16,
  },
  petFilterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#E8F5E9',
  },
  petFilterItemSelected: {
    backgroundColor: '#38761D',
  },
  petFilterText: {
    color: '#38761D',
    fontWeight: '500',
  },
  petFilterTextSelected: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80, // Extra padding for iOS
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  recordTypeContainer: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  recordType: {
    color: '#38761D',
    fontSize: 12,
    fontWeight: '500',
  },
  statusContainer: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  recordInfo: {
    flex: 1,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#38761D',
    marginBottom: 8,
  },
  petContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  petName: {
    fontSize: 14,
    color: '#38761D',
    marginLeft: 6,
  },
  recordDose: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  recordExpiry: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  recordNotes: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 40 : 20, // Higher position for iOS
    backgroundColor: '#38761D',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#38761D',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#38761D',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
});

export default HealthScreen;
