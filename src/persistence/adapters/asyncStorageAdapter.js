import AsyncStorage from '@react-native-async-storage/async-storage';

// --- PETS OPERATIONS ---

/**
 * Retrieves all pets from AsyncStorage.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of pet objects.
 */
const getPets = async () => {
  try {
    const petsJson = await AsyncStorage.getItem('pets');
    const pets = petsJson ? JSON.parse(petsJson) : [];
    console.log(`AsyncStorageAdapter: Retrieved ${pets.length} pets`);
    return pets;
  } catch (error) {
    console.error('AsyncStorageAdapter: Error retrieving pets', error);
    throw new Error('Failed to retrieve pets.');
  }
};

/**
 * Saves a single pet (adds or updates) in AsyncStorage.
 * @param {Object} petData - The pet object to save.
 * @returns {Promise<Object>} A promise that resolves to the saved pet object.
 */
const savePet = async (petData) => {
  if (!petData || !petData.id) {
    throw new Error('AsyncStorageAdapter: Invalid pet data provided for saving.');
  }

  try {
    // Get current pets
    const pets = await getPets();
    
    // Find if pet already exists
    const existingPetIndex = pets.findIndex(pet => pet.id === petData.id);
    
    if (existingPetIndex >= 0) {
      // Update existing pet
      pets[existingPetIndex] = petData;
    } else {
      // Add new pet
      pets.push(petData);
    }
    
    // Save updated pets list
    await AsyncStorage.setItem('pets', JSON.stringify(pets));
    console.log(`AsyncStorageAdapter: Pet ${existingPetIndex >= 0 ? 'updated' : 'added'} successfully:`, petData.id);
    
    return petData;
  } catch (error) {
    console.error('AsyncStorageAdapter: Error saving pet', error);
    throw new Error('Failed to save pet.');
  }
};

/**
 * Deletes a pet by ID from AsyncStorage.
 * @param {string} petId - The ID of the pet to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deletion was successful.
 */
const deletePet = async (petId) => {
  if (!petId) {
    throw new Error('AsyncStorageAdapter: Invalid pet ID provided for deletion.');
  }

  try {
    // Get current pets
    const pets = await getPets();
    
    // Filter out the pet to delete
    const updatedPets = pets.filter(pet => pet.id !== petId);
    
    // If no pet was removed, it didn't exist
    if (updatedPets.length === pets.length) {
      console.warn('AsyncStorageAdapter: Pet ID not found for deletion:', petId);
      return true; // Return true for idempotency
    }
    
    // Save updated pets list
    await AsyncStorage.setItem('pets', JSON.stringify(updatedPets));
    console.log('AsyncStorageAdapter: Pet deleted successfully:', petId);
    
    // Also delete any products associated with this pet
    try {
      const products = await getProducts();
      const updatedProducts = products.filter(product => product.pet_id !== petId);
      
      if (updatedProducts.length !== products.length) {
        await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
        console.log('AsyncStorageAdapter: Associated products deleted for pet:', petId);
      }
      
      // Also delete any health records associated with this pet
      const healthRecords = await getHealthRecords();
      const updatedHealthRecords = healthRecords.filter(record => record.pet_id !== petId);
      
      if (updatedHealthRecords.length !== healthRecords.length) {
        await AsyncStorage.setItem('healthRecords', JSON.stringify(updatedHealthRecords));
        console.log('AsyncStorageAdapter: Associated health records deleted for pet:', petId);
      }
      
      // Also delete any appointments associated with this pet
      const appointments = await getAppointments();
      const updatedAppointments = appointments.filter(appointment => appointment.pet_id !== petId);
      
      if (updatedAppointments.length !== appointments.length) {
        await AsyncStorage.setItem('appointments', JSON.stringify(updatedAppointments));
        console.log('AsyncStorageAdapter: Associated appointments deleted for pet:', petId);
      }
    } catch (error) {
      console.error('AsyncStorageAdapter: Error cleaning up associated data', error);
      // Continue with pet deletion even if cleanup fails
    }
    
    return true;
  } catch (error) {
    console.error('AsyncStorageAdapter: Error deleting pet', error);
    throw new Error('Failed to delete pet.');
  }
};

/**
 * Retrieves a single pet by ID from AsyncStorage.
 * @param {string} petId - The ID of the pet to retrieve.
 * @returns {Promise<Object|undefined>} A promise that resolves to the pet object or undefined if not found.
 */
const getPetById = async (petId) => {
  if (!petId) {
    throw new Error('AsyncStorageAdapter: Invalid pet ID provided for retrieval.');
  }

  try {
    const pets = await getPets();
    return pets.find(pet => pet.id === petId);
  } catch (error) {
    console.error('AsyncStorageAdapter: Error getting pet by ID', error);
    throw new Error('Failed to retrieve pet by ID.');
  }
};

// --- PRODUCTS OPERATIONS ---

/**
 * Retrieves all products from AsyncStorage.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of product objects.
 */
const getProducts = async () => {
  try {
    const productsJson = await AsyncStorage.getItem('products');
    const products = productsJson ? JSON.parse(productsJson) : [];
    
    // Enrich products with pet names
    const pets = await getPets();
    const enrichedProducts = products.map(product => {
      if (product.pet_id) {
        const pet = pets.find(p => p.id === product.pet_id);
        return {
          ...product,
          pet_name: pet ? pet.name : 'Unknown Pet'
        };
      }
      return product;
    });
    
    console.log(`AsyncStorageAdapter: Retrieved ${enrichedProducts.length} products`);
    return enrichedProducts;
  } catch (error) {
    console.error('AsyncStorageAdapter: Error retrieving products', error);
    throw new Error('Failed to retrieve products.');
  }
};

/**
 * Saves a single product (adds or updates) in AsyncStorage.
 * @param {Object} productData - The product object to save.
 * @returns {Promise<Object>} A promise that resolves to the saved product object.
 */
const saveProduct = async (productData) => {
  if (!productData || !productData.id) {
    throw new Error('AsyncStorageAdapter: Invalid product data provided for saving.');
  }

  try {
    // Get current products
    const productsJson = await AsyncStorage.getItem('products');
    const products = productsJson ? JSON.parse(productsJson) : [];
    
    // Find if product already exists
    const existingProductIndex = products.findIndex(product => product.id === productData.id);
    
    if (existingProductIndex >= 0) {
      // Update existing product
      products[existingProductIndex] = productData;
    } else {
      // Add new product
      products.push(productData);
    }
    
    // Save updated products list
    await AsyncStorage.setItem('products', JSON.stringify(products));
    console.log(`AsyncStorageAdapter: Product ${existingProductIndex >= 0 ? 'updated' : 'added'} successfully:`, productData.id);
    
    return productData;
  } catch (error) {
    console.error('AsyncStorageAdapter: Error saving product', error);
    throw new Error('Failed to save product.');
  }
};

/**
 * Deletes a product by ID from AsyncStorage.
 * @param {string} productId - The ID of the product to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deletion was successful.
 */
const deleteProduct = async (productId) => {
  if (!productId) {
    throw new Error('AsyncStorageAdapter: Invalid product ID provided for deletion.');
  }

  try {
    // Get current products
    const productsJson = await AsyncStorage.getItem('products');
    const products = productsJson ? JSON.parse(productsJson) : [];
    
    // Filter out the product to delete
    const updatedProducts = products.filter(product => product.id !== productId);
    
    // If no product was removed, it didn't exist
    if (updatedProducts.length === products.length) {
      console.warn('AsyncStorageAdapter: Product ID not found for deletion:', productId);
      return true; // Return true for idempotency
    }
    
    // Save updated products list
    await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
    console.log('AsyncStorageAdapter: Product deleted successfully:', productId);
    
    return true;
  } catch (error) {
    console.error('AsyncStorageAdapter: Error deleting product', error);
    throw new Error('Failed to delete product.');
  }
};

/**
 * Retrieves a single product by ID from AsyncStorage.
 * @param {string} productId - The ID of the product to retrieve.
 * @returns {Promise<Object|undefined>} A promise that resolves to the product object or undefined if not found.
 */
const getProductById = async (productId) => {
  if (!productId) {
    throw new Error('AsyncStorageAdapter: Invalid product ID provided for retrieval.');
  }

  try {
    const products = await getProducts();
    return products.find(product => product.id === productId);
  } catch (error) {
    console.error('AsyncStorageAdapter: Error getting product by ID', error);
    throw new Error('Failed to retrieve product by ID.');
  }
};

/**
 * Retrieves all products for a specific pet from AsyncStorage.
 * @param {string} petId - The ID of the pet to retrieve products for.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of product objects.
 */
const getProductsByPetId = async (petId) => {
  if (!petId) {
    throw new Error('AsyncStorageAdapter: Invalid pet ID provided for product retrieval.');
  }

  try {
    const products = await getProducts();
    const petProducts = products.filter(product => product.pet_id === petId);
    console.log(`AsyncStorageAdapter: Retrieved ${petProducts.length} products for pet ${petId}`);
    return petProducts;
  } catch (error) {
    console.error('AsyncStorageAdapter: Error retrieving products by pet ID', error);
    throw new Error('Failed to retrieve products for pet.');
  }
};

// --- HEALTH RECORDS OPERATIONS ---

/**
 * Retrieves all health records from AsyncStorage.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of health record objects.
 */
const getHealthRecords = async () => {
  try {
    const recordsJson = await AsyncStorage.getItem('healthRecords');
    const records = recordsJson ? JSON.parse(recordsJson) : [];
    
    // Enrich records with pet names
    const pets = await getPets();
    const enrichedRecords = records.map(record => {
      if (record.pet_id) {
        const pet = pets.find(p => p.id === record.pet_id);
        return {
          ...record,
          pet_name: pet ? pet.name : 'Unknown Pet'
        };
      }
      return record;
    });
    
    console.log(`AsyncStorageAdapter: Retrieved ${enrichedRecords.length} health records`);
    return enrichedRecords;
  } catch (error) {
    console.error('AsyncStorageAdapter: Error retrieving health records', error);
    throw new Error('Failed to retrieve health records.');
  }
};

/**
 * Saves a single health record (adds or updates) in AsyncStorage.
 * @param {Object} recordData - The health record object to save.
 * @returns {Promise<Object>} A promise that resolves to the saved health record object.
 */
const saveHealthRecord = async (recordData) => {
  if (!recordData || !recordData.id) {
    throw new Error('AsyncStorageAdapter: Invalid health record data provided for saving.');
  }

  try {
    // Get current health records
    const recordsJson = await AsyncStorage.getItem('healthRecords');
    const records = recordsJson ? JSON.parse(recordsJson) : [];
    
    // Find if record already exists
    const existingRecordIndex = records.findIndex(record => record.id === recordData.id);
    
    if (existingRecordIndex >= 0) {
      // Update existing record
      records[existingRecordIndex] = recordData;
    } else {
      // Add new record
      records.push(recordData);
    }
    
    // Save updated records list
    await AsyncStorage.setItem('healthRecords', JSON.stringify(records));
    console.log(`AsyncStorageAdapter: Health record ${existingRecordIndex >= 0 ? 'updated' : 'added'} successfully:`, recordData.id);
    
    return recordData;
  } catch (error) {
    console.error('AsyncStorageAdapter: Error saving health record', error);
    throw new Error('Failed to save health record.');
  }
};

/**
 * Deletes a health record by ID from AsyncStorage.
 * @param {string} recordId - The ID of the health record to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deletion was successful.
 */
const deleteHealthRecord = async (recordId) => {
  if (!recordId) {
    throw new Error('AsyncStorageAdapter: Invalid health record ID provided for deletion.');
  }

  try {
    // Get current health records
    const recordsJson = await AsyncStorage.getItem('healthRecords');
    const records = recordsJson ? JSON.parse(recordsJson) : [];
    
    // Filter out the record to delete
    const updatedRecords = records.filter(record => record.id !== recordId);
    
    // If no record was removed, it didn't exist
    if (updatedRecords.length === records.length) {
      console.warn('AsyncStorageAdapter: Health record ID not found for deletion:', recordId);
      return true; // Return true for idempotency
    }
    
    // Save updated records list
    await AsyncStorage.setItem('healthRecords', JSON.stringify(updatedRecords));
    console.log('AsyncStorageAdapter: Health record deleted successfully:', recordId);
    
    return true;
  } catch (error) {
    console.error('AsyncStorageAdapter: Error deleting health record', error);
    throw new Error('Failed to delete health record.');
  }
};

/**
 * Retrieves a single health record by ID from AsyncStorage.
 * @param {string} recordId - The ID of the health record to retrieve.
 * @returns {Promise<Object|undefined>} A promise that resolves to the health record object or undefined if not found.
 */
const getHealthRecordById = async (recordId) => {
  if (!recordId) {
    throw new Error('AsyncStorageAdapter: Invalid health record ID provided for retrieval.');
  }

  try {
    const records = await getHealthRecords();
    return records.find(record => record.id === recordId);
  } catch (error) {
    console.error('AsyncStorageAdapter: Error getting health record by ID', error);
    throw new Error('Failed to retrieve health record by ID.');
  }
};

/**
 * Retrieves all health records for a specific pet from AsyncStorage.
 * @param {string} petId - The ID of the pet to retrieve health records for.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of health record objects.
 */
const getHealthRecordsByPetId = async (petId) => {
  if (!petId) {
    throw new Error('AsyncStorageAdapter: Invalid pet ID provided for health record retrieval.');
  }

  try {
    const records = await getHealthRecords();
    const petRecords = records.filter(record => record.pet_id === petId);
    console.log(`AsyncStorageAdapter: Retrieved ${petRecords.length} health records for pet ${petId}`);
    return petRecords;
  } catch (error) {
    console.error('AsyncStorageAdapter: Error retrieving health records by pet ID', error);
    throw new Error('Failed to retrieve health records for pet.');
  }
};

// --- APPOINTMENTS OPERATIONS ---

/**
 * Retrieves all appointments from AsyncStorage.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of appointment objects.
 */
const getAppointments = async () => {
  try {
    const appointmentsJson = await AsyncStorage.getItem('appointments');
    const appointments = appointmentsJson ? JSON.parse(appointmentsJson) : [];
    
    // Enrich appointments with pet names
    const pets = await getPets();
    const enrichedAppointments = appointments.map(appointment => {
      if (appointment.pet_id) {
        const pet = pets.find(p => p.id === appointment.pet_id);
        return {
          ...appointment,
          pet_name: pet ? pet.name : 'Unknown Pet'
        };
      }
      return appointment;
    });
    
    console.log(`AsyncStorageAdapter: Retrieved ${enrichedAppointments.length} appointments`);
    return enrichedAppointments;
  } catch (error) {
    console.error('AsyncStorageAdapter: Error retrieving appointments', error);
    throw new Error('Failed to retrieve appointments.');
  }
};

/**
 * Saves a single appointment (adds or updates) in AsyncStorage.
 * @param {Object} appointmentData - The appointment object to save.
 * @returns {Promise<Object>} A promise that resolves to the saved appointment object.
 */
const saveAppointment = async (appointmentData) => {
  if (!appointmentData || !appointmentData.id) {
    throw new Error('AsyncStorageAdapter: Invalid appointment data provided for saving.');
  }

  try {
    // Get current appointments
    const appointmentsJson = await AsyncStorage.getItem('appointments');
    const appointments = appointmentsJson ? JSON.parse(appointmentsJson) : [];
    
    // Find if appointment already exists
    const existingAppointmentIndex = appointments.findIndex(appointment => appointment.id === appointmentData.id);
    
    if (existingAppointmentIndex >= 0) {
      // Update existing appointment
      appointments[existingAppointmentIndex] = appointmentData;
    } else {
      // Add new appointment
      appointments.push(appointmentData);
    }
    
    // Save updated appointments list
    await AsyncStorage.setItem('appointments', JSON.stringify(appointments));
    console.log(`AsyncStorageAdapter: Appointment ${existingAppointmentIndex >= 0 ? 'updated' : 'added'} successfully:`, appointmentData.id);
    
    return appointmentData;
  } catch (error) {
    console.error('AsyncStorageAdapter: Error saving appointment', error);
    throw new Error('Failed to save appointment.');
  }
};

/**
 * Deletes an appointment by ID from AsyncStorage.
 * @param {string} appointmentId - The ID of the appointment to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deletion was successful.
 */
const deleteAppointment = async (appointmentId) => {
  if (!appointmentId) {
    throw new Error('AsyncStorageAdapter: Invalid appointment ID provided for deletion.');
  }

  try {
    // Get current appointments
    const appointmentsJson = await AsyncStorage.getItem('appointments');
    const appointments = appointmentsJson ? JSON.parse(appointmentsJson) : [];
    
    // Filter out the appointment to delete
    const updatedAppointments = appointments.filter(appointment => appointment.id !== appointmentId);
    
    // If no appointment was removed, it didn't exist
    if (updatedAppointments.length === appointments.length) {
      console.warn('AsyncStorageAdapter: Appointment ID not found for deletion:', appointmentId);
      return true; // Return true for idempotency
    }
    
    // Save updated appointments list
    await AsyncStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    console.log('AsyncStorageAdapter: Appointment deleted successfully:', appointmentId);
    
    return true;
  } catch (error) {
    console.error('AsyncStorageAdapter: Error deleting appointment', error);
    throw new Error('Failed to delete appointment.');
  }
};

/**
 * Retrieves a single appointment by ID from AsyncStorage.
 * @param {string} appointmentId - The ID of the appointment to retrieve.
 * @returns {Promise<Object|undefined>} A promise that resolves to the appointment object or undefined if not found.
 */
const getAppointmentById = async (appointmentId) => {
  if (!appointmentId) {
    throw new Error('AsyncStorageAdapter: Invalid appointment ID provided for retrieval.');
  }

  try {
    const appointments = await getAppointments();
    return appointments.find(appointment => appointment.id === appointmentId);
  } catch (error) {
    console.error('AsyncStorageAdapter: Error getting appointment by ID', error);
    throw new Error('Failed to retrieve appointment by ID.');
  }
};

/**
 * Retrieves all appointments for a specific pet from AsyncStorage.
 * @param {string} petId - The ID of the pet to retrieve appointments for.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of appointment objects.
 */
const getAppointmentsByPetId = async (petId) => {
  if (!petId) {
    throw new Error('AsyncStorageAdapter: Invalid pet ID provided for appointment retrieval.');
  }

  try {
    const appointments = await getAppointments();
    const petAppointments = appointments.filter(appointment => appointment.pet_id === petId);
    console.log(`AsyncStorageAdapter: Retrieved ${petAppointments.length} appointments for pet ${petId}`);
    return petAppointments;
  } catch (error) {
    console.error('AsyncStorageAdapter: Error retrieving appointments by pet ID', error);
    throw new Error('Failed to retrieve appointments for pet.');
  }
};

/**
 * Retrieves all appointments for a specific date range from AsyncStorage.
 * @param {Date} startDate - The start date of the range.
 * @param {Date} endDate - The end date of the range.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of appointment objects.
 */
const getAppointmentsByDateRange = async (startDate, endDate) => {
  if (!startDate || !endDate) {
    throw new Error('AsyncStorageAdapter: Invalid date range provided for appointment retrieval.');
  }

  try {
    const appointments = await getAppointments();
    const filteredAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= startDate && appointmentDate <= endDate;
    });
    
    console.log(`AsyncStorageAdapter: Retrieved ${filteredAppointments.length} appointments in date range`);
    return filteredAppointments;
  } catch (error) {
    console.error('AsyncStorageAdapter: Error retrieving appointments by date range', error);
    throw new Error('Failed to retrieve appointments for date range.');
  }
};

// Export the functions adhering to the persistence interface
export const asyncStorageAdapter = {
  // Pet operations
  getPets,
  savePet,
  deletePet,
  getPetById,
  
  // Product operations
  getProducts,
  saveProduct,
  deleteProduct,
  getProductById,
  getProductsByPetId,
  
  // Health record operations
  getHealthRecords,
  saveHealthRecord,
  deleteHealthRecord,
  getHealthRecordById,
  getHealthRecordsByPetId,
  
  // Appointment operations
  getAppointments,
  saveAppointment,
  deleteAppointment,
  getAppointmentById,
  getAppointmentsByPetId,
  getAppointmentsByDateRange
};
