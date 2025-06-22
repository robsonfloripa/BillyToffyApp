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

const ProductListScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load products on component mount and when the screen is focused
  useEffect(() => {
    loadProducts();
    
    // Add listener for when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadProducts();
    });
    
    // Clean up the listener when component unmounts
    return unsubscribe;
  }, [navigation]);

  // Function to load products from storage
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const storedProducts = await persistence.getProducts();
      setProducts(storedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de produtos.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh when pull-to-refresh is triggered
  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  // Navigate to product form screen for editing
  const handleEditProduct = (product) => {
    navigation.navigate('ProductForm', { 
      product,
      onProductSaved: loadProducts
    });
  };

  // Delete product after confirmation
  const handleDeleteProduct = (productId, productName) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir ${productName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await persistence.deleteProduct(productId);
              loadProducts(); // Reload the list after deletion
              Alert.alert('Sucesso', `${productName} foi removido com sucesso.`);
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Erro', `Não foi possível excluir ${productName}.`);
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

  // Render each product item
  const renderProductItem = ({ item }) => {
    const expiryStatus = getExpiryStatus(item.expiry_date);
    
    return (
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
          <View style={styles.productTypeContainer}>
            <Text style={styles.productType}>{item.type}</Text>
          </View>
          <View style={[styles.statusContainer, { backgroundColor: expiryStatus.color }]}>
            <Text style={styles.statusText}>{expiryStatus.text}</Text>
          </View>
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          
          <View style={styles.dateContainer}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Aplicação:</Text>
              <Text style={styles.dateValue}>
                {item.application_date ? formatDate(item.application_date) : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Validade:</Text>
              <Text style={[styles.dateValue, { color: expiryStatus.color }]}>
                {item.expiry_date ? formatDate(item.expiry_date) : 'N/A'}
              </Text>
            </View>
          </View>
          
          {item.pet_name && (
            <View style={styles.petContainer}>
              <Ionicons name="paw" size={16} color="#38761D" />
              <Text style={styles.petName}>{item.pet_name}</Text>
            </View>
          )}
          
          {item.notes && <Text style={styles.productNotes}>{item.notes}</Text>}
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditProduct(item)}
          >
            <Ionicons name="create-outline" size={22} color="#38761D" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteProduct(item.id, item.name)}
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
      <Ionicons name="medical-outline" size={60} color="#D9EAD3" />
      <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
      <Text style={styles.emptySubText}>
        Toque no botão "+" para adicionar seu primeiro produto
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38761D" />
            <Text style={styles.loadingText}>Carregando produtos...</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={EmptyListComponent}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )}
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('ProductForm', { onProductSaved: loadProducts })}
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
  productCard: {
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
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  productTypeContainer: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  productType: {
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
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#38761D',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dateItem: {
    marginRight: 20,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666666',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
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
  productNotes: {
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

export default ProductListScreen;
