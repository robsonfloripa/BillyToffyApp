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

const PetListScreen = ({ navigation }) => {
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load pets on component mount and when the screen is focused
  useEffect(() => {
    loadPets();
    
    // Add listener for when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadPets();
    });
    
    // Clean up the listener when component unmounts
    return unsubscribe;
  }, [navigation]);

  // Function to load pets from storage
  const loadPets = async () => {
    try {
      setIsLoading(true);
      const storedPets = await persistence.getPets();
      setPets(storedPets);
    } catch (error) {
      console.error('Error loading pets:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de pets.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh when pull-to-refresh is triggered
  const handleRefresh = () => {
    setRefreshing(true);
    loadPets();
  };

  // Navigate to pet form screen for editing
  const handleEditPet = (pet) => {
    navigation.navigate('PetForm', { 
      pet,
      onPetSaved: loadPets
    });
  };

  // Delete pet after confirmation
  const handleDeletePet = (petId, petName) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir ${petName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await persistence.deletePet(petId);
              loadPets(); // Reload the list after deletion
              Alert.alert('Sucesso', `${petName} foi removido com sucesso.`);
            } catch (error) {
              console.error('Error deleting pet:', error);
              Alert.alert('Erro', `Não foi possível excluir ${petName}.`);
            }
          }
        }
      ]
    );
  };

  // Render each pet item
  const renderPetItem = ({ item }) => (
    <View style={styles.petCard}>
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{item.name}</Text>
        <Text style={styles.petDetails}>
          {item.species}{item.breed ? ` - ${item.breed}` : ''}
        </Text>
        {item.dob && (
          <Text style={styles.petDetails}>
            Nascimento: {new Date(item.dob).toLocaleDateString('pt-BR')}
          </Text>
        )}
        {item.notes && <Text style={styles.petNotes}>{item.notes}</Text>}
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditPet(item)}
        >
          <Ionicons name="create-outline" size={22} color="#38761D" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeletePet(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={22} color="#E06666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Empty list component
  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="paw-outline" size={60} color="#D9EAD3" />
      <Text style={styles.emptyText}>Nenhum pet cadastrado</Text>
      <Text style={styles.emptySubText}>
        Toque no botão "+" para adicionar seu primeiro pet
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38761D" />
            <Text style={styles.loadingText}>Carregando pets...</Text>
          </View>
        ) : (
          <FlatList
            data={pets}
            renderItem={renderPetItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={EmptyListComponent}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )}
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('PetForm', { onPetSaved: loadPets })}
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
  listContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80, // Extra padding for iOS
  },
  petCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#38761D',
    marginBottom: 4,
  },
  petDetails: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  petNotes: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  actionsContainer: {
    justifyContent: 'center',
  },
  actionButton: {
    padding: 8,
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

export default PetListScreen;
