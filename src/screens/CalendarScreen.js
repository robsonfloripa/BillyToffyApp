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

const CalendarScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Load appointments on component mount and when the screen is focused
  useEffect(() => {
    loadAppointments();
    
    // Add listener for when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadAppointments();
    });
    
    // Clean up the listener when component unmounts
    return unsubscribe;
  }, [navigation]);

  // Function to load appointments from storage
  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const storedAppointments = await persistence.getAppointments();
      
      // Sort appointments by date (newest first)
      const sortedAppointments = storedAppointments.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
      
      setAppointments(sortedAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
      Alert.alert('Erro', 'Não foi possível carregar os agendamentos.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh when pull-to-refresh is triggered
  const handleRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  // Navigate to appointment form screen for editing
  const handleEditAppointment = (appointment) => {
    navigation.navigate('AppointmentForm', { 
      appointment,
      onAppointmentSaved: loadAppointments
    });
  };

  // Delete appointment after confirmation
  const handleDeleteAppointment = (appointmentId, appointmentType) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir este agendamento de ${appointmentType}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await persistence.deleteAppointment(appointmentId);
              loadAppointments(); // Reload the list after deletion
              Alert.alert('Sucesso', 'Agendamento removido com sucesso.');
            } catch (error) {
              console.error('Error deleting appointment:', error);
              Alert.alert('Erro', 'Não foi possível excluir o agendamento.');
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

  // Get status based on date
  const getAppointmentStatus = (dateString) => {
    if (!dateString) return { color: '#999', text: 'Sem data' };
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const appointmentDate = new Date(dateString);
      appointmentDate.setHours(0, 0, 0, 0);
      
      // Calculate difference in days
      const diffTime = appointmentDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return { color: '#999999', text: 'Passado' };
      } else if (diffDays === 0) {
        return { color: '#E06666', text: 'Hoje' };
      } else if (diffDays <= 3) {
        return { color: '#F1C232', text: 'Próximo' };
      } else {
        return { color: '#6AA84F', text: 'Agendado' };
      }
    } catch (e) {
      return { color: '#999', text: 'Erro na data' };
    }
  };

  // Render each appointment item
  const renderAppointmentItem = ({ item }) => {
    const appointmentStatus = getAppointmentStatus(item.date);
    
    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <View style={styles.appointmentTypeContainer}>
            <Text style={styles.appointmentType}>{item.type}</Text>
          </View>
          <View style={[styles.statusContainer, { backgroundColor: appointmentStatus.color }]}>
            <Text style={styles.statusText}>{appointmentStatus.text}</Text>
          </View>
        </View>
        
        <View style={styles.appointmentInfo}>
          <Text style={styles.appointmentDate}>
            {formatDate(item.date)} {item.time ? `às ${item.time}` : ''}
          </Text>
          
          {item.pet_name && (
            <View style={styles.petContainer}>
              <Ionicons name="paw" size={16} color="#38761D" />
              <Text style={styles.petName}>{item.pet_name}</Text>
            </View>
          )}
          
          {item.dose && (
            <Text style={styles.appointmentDose}>Dose: {item.dose}</Text>
          )}
          
          {item.expiry_date && (
            <Text style={styles.appointmentExpiry}>
              Validade: {formatDate(item.expiry_date)}
            </Text>
          )}
          
          {item.notes && <Text style={styles.appointmentNotes}>{item.notes}</Text>}
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditAppointment(item)}
          >
            <Ionicons name="create-outline" size={22} color="#38761D" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteAppointment(item.id, item.type)}
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
      <Ionicons name="calendar-outline" size={60} color="#D9EAD3" />
      <Text style={styles.emptyText}>Nenhum agendamento cadastrado</Text>
      <Text style={styles.emptySubText}>
        Toque no botão "+" para adicionar seu primeiro agendamento
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38761D" />
            <Text style={styles.loadingText}>Carregando agendamentos...</Text>
          </View>
        ) : (
          <FlatList
            data={appointments}
            renderItem={renderAppointmentItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={EmptyListComponent}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )}
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AppointmentForm', { onAppointmentSaved: loadAppointments })}
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
  appointmentCard: {
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
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  appointmentTypeContainer: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  appointmentType: {
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
  appointmentInfo: {
    flex: 1,
  },
  appointmentDate: {
    fontSize: 18,
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
  appointmentDose: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  appointmentExpiry: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  appointmentNotes: {
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

export default CalendarScreen;
