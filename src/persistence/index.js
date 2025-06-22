// src/persistence/index.js

// Import available adapters
import { asyncStorageAdapter } from "./adapters/asyncStorageAdapter";

// --- Configuration ---
// Choose the active adapter here
const activeAdapter = asyncStorageAdapter;

// --- Export the active persistence interface ---
// The rest of the application will import methods from here,
// ensuring they always use the currently configured adapter.
export const persistence = {
  // Pet operations
  getPets: activeAdapter.getPets,
  savePet: activeAdapter.savePet,
  deletePet: activeAdapter.deletePet,
  getPetById: activeAdapter.getPetById,
  
  // Product operations
  getProducts: activeAdapter.getProducts,
  saveProduct: activeAdapter.saveProduct,
  deleteProduct: activeAdapter.deleteProduct,
  getProductById: activeAdapter.getProductById,
  getProductsByPetId: activeAdapter.getProductsByPetId,
  
  // Health record operations
  getHealthRecords: activeAdapter.getHealthRecords,
  saveHealthRecord: activeAdapter.saveHealthRecord,
  deleteHealthRecord: activeAdapter.deleteHealthRecord,
  getHealthRecordById: activeAdapter.getHealthRecordById,
  getHealthRecordsByPetId: activeAdapter.getHealthRecordsByPetId,
  
  // Appointment operations
  getAppointments: activeAdapter.getAppointments,
  saveAppointment: activeAdapter.saveAppointment,
  deleteAppointment: activeAdapter.deleteAppointment,
  getAppointmentById: activeAdapter.getAppointmentById,
  getAppointmentsByPetId: activeAdapter.getAppointmentsByPetId,
  getAppointmentsByDateRange: activeAdapter.getAppointmentsByDateRange
};
