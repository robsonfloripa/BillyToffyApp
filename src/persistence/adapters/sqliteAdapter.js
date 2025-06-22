import { openDatabase } from 'expo-sqlite';

// Open or create the database
const db = openDatabase('billytoffyapp.db');

// Initialize database tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Create pets table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS pets (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          species TEXT NOT NULL,
          breed TEXT,
          dob TEXT,
          notes TEXT
        )`,
        [],
        () => {
          console.log('SQLiteAdapter: Pets table initialized successfully');
          
          // Create products table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS products (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              type TEXT NOT NULL,
              application_date TEXT,
              expiry_date TEXT,
              notes TEXT,
              pet_id TEXT,
              FOREIGN KEY (pet_id) REFERENCES pets (id) ON DELETE CASCADE
            )`,
            [],
            () => {
              console.log('SQLiteAdapter: Products table initialized successfully');
              resolve();
            },
            (_, error) => {
              console.error('SQLiteAdapter: Error creating products table', error);
              reject(error);
            }
          );
        },
        (_, error) => {
          console.error('SQLiteAdapter: Error creating pets table', error);
          reject(error);
        }
      );
    });
  });
};

// Initialize database on import
initDatabase().catch(error => {
  console.error('SQLiteAdapter: Failed to initialize database', error);
});

// --- PETS OPERATIONS ---

/**
 * Retrieves all pets from SQLite database.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of pet objects.
 */
const getPets = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM pets',
        [],
        (_, { rows }) => {
          const pets = [];
          for (let i = 0; i < rows.length; i++) {
            pets.push(rows.item(i));
          }
          console.log(`SQLiteAdapter: Retrieved ${pets.length} pets`);
          resolve(pets);
        },
        (_, error) => {
          console.error('SQLiteAdapter: Error retrieving pets', error);
          reject(new Error('Failed to retrieve pets.'));
        }
      );
    });
  });
};

/**
 * Saves a single pet (adds or updates) in SQLite database.
 * @param {Object} petData - The pet object to save.
 * @returns {Promise<Object>} A promise that resolves to the saved pet object.
 */
const savePet = (petData) => {
  if (!petData || !petData.id) {
    return Promise.reject(new Error('SQLiteAdapter: Invalid pet data provided for saving.'));
  }

  return new Promise((resolve, reject) => {
    // First check if the pet already exists
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM pets WHERE id = ?',
        [petData.id],
        (_, { rows }) => {
          const exists = rows.length > 0;
          
          // Prepare the transaction to insert or update
          db.transaction(tx => {
            if (exists) {
              // Update existing pet
              tx.executeSql(
                `UPDATE pets SET 
                  name = ?, 
                  species = ?, 
                  breed = ?, 
                  dob = ?, 
                  notes = ? 
                WHERE id = ?`,
                [
                  petData.name,
                  petData.species,
                  petData.breed || null,
                  petData.dob || null,
                  petData.notes || null,
                  petData.id
                ],
                (_, result) => {
                  if (result.rowsAffected > 0) {
                    console.log('SQLiteAdapter: Pet updated successfully:', petData.id);
                    resolve(petData);
                  } else {
                    reject(new Error('Failed to update pet.'));
                  }
                },
                (_, error) => {
                  console.error('SQLiteAdapter: Error updating pet', error);
                  reject(new Error('Failed to update pet.'));
                }
              );
            } else {
              // Insert new pet
              tx.executeSql(
                `INSERT INTO pets (id, name, species, breed, dob, notes) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                  petData.id,
                  petData.name,
                  petData.species,
                  petData.breed || null,
                  petData.dob || null,
                  petData.notes || null
                ],
                (_, result) => {
                  if (result.insertId) {
                    console.log('SQLiteAdapter: Pet inserted successfully:', petData.id);
                    resolve(petData);
                  } else {
                    reject(new Error('Failed to insert pet.'));
                  }
                },
                (_, error) => {
                  console.error('SQLiteAdapter: Error inserting pet', error);
                  reject(new Error('Failed to insert pet.'));
                }
              );
            }
          });
        },
        (_, error) => {
          console.error('SQLiteAdapter: Error checking pet existence', error);
          reject(new Error('Failed to check if pet exists.'));
        }
      );
    });
  });
};

/**
 * Deletes a pet by ID from SQLite database.
 * @param {string} petId - The ID of the pet to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deletion was successful.
 */
const deletePet = (petId) => {
  if (!petId) {
    return Promise.reject(new Error('SQLiteAdapter: Invalid pet ID provided for deletion.'));
  }

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM pets WHERE id = ?',
        [petId],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            console.log('SQLiteAdapter: Pet deleted successfully:', petId);
            resolve(true);
          } else {
            console.warn('SQLiteAdapter: Pet ID not found for deletion:', petId);
            // Still resolve with true for idempotency
            resolve(true);
          }
        },
        (_, error) => {
          console.error('SQLiteAdapter: Error deleting pet', error);
          reject(new Error('Failed to delete pet.'));
        }
      );
    });
  });
};

/**
 * Retrieves a single pet by ID from SQLite database.
 * @param {string} petId - The ID of the pet to retrieve.
 * @returns {Promise<Object|undefined>} A promise that resolves to the pet object or undefined if not found.
 */
const getPetById = (petId) => {
  if (!petId) {
    return Promise.reject(new Error('SQLiteAdapter: Invalid pet ID provided for retrieval.'));
  }

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM pets WHERE id = ?',
        [petId],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0));
          } else {
            resolve(undefined); // Return undefined if not found
          }
        },
        (_, error) => {
          console.error('SQLiteAdapter: Error getting pet by ID', error);
          reject(new Error('Failed to retrieve pet by ID.'));
        }
      );
    });
  });
};

// --- PRODUCTS OPERATIONS ---

/**
 * Retrieves all products from SQLite database.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of product objects.
 */
const getProducts = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT products.*, pets.name as pet_name FROM products LEFT JOIN pets ON products.pet_id = pets.id',
        [],
        (_, { rows }) => {
          const products = [];
          for (let i = 0; i < rows.length; i++) {
            products.push(rows.item(i));
          }
          console.log(`SQLiteAdapter: Retrieved ${products.length} products`);
          resolve(products);
        },
        (_, error) => {
          console.error('SQLiteAdapter: Error retrieving products', error);
          reject(new Error('Failed to retrieve products.'));
        }
      );
    });
  });
};

/**
 * Saves a single product (adds or updates) in SQLite database.
 * @param {Object} productData - The product object to save.
 * @returns {Promise<Object>} A promise that resolves to the saved product object.
 */
const saveProduct = (productData) => {
  if (!productData || !productData.id) {
    return Promise.reject(new Error('SQLiteAdapter: Invalid product data provided for saving.'));
  }

  return new Promise((resolve, reject) => {
    // First check if the product already exists
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM products WHERE id = ?',
        [productData.id],
        (_, { rows }) => {
          const exists = rows.length > 0;
          
          // Prepare the transaction to insert or update
          db.transaction(tx => {
            if (exists) {
              // Update existing product
              tx.executeSql(
                `UPDATE products SET 
                  name = ?, 
                  type = ?, 
                  application_date = ?, 
                  expiry_date = ?, 
                  notes = ?,
                  pet_id = ?
                WHERE id = ?`,
                [
                  productData.name,
                  productData.type,
                  productData.application_date || null,
                  productData.expiry_date || null,
                  productData.notes || null,
                  productData.pet_id || null,
                  productData.id
                ],
                (_, result) => {
                  if (result.rowsAffected > 0) {
                    console.log('SQLiteAdapter: Product updated successfully:', productData.id);
                    resolve(productData);
                  } else {
                    reject(new Error('Failed to update product.'));
                  }
                },
                (_, error) => {
                  console.error('SQLiteAdapter: Error updating product', error);
                  reject(new Error('Failed to update product.'));
                }
              );
            } else {
              // Insert new product
              tx.executeSql(
                `INSERT INTO products (id, name, type, application_date, expiry_date, notes, pet_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                  productData.id,
                  productData.name,
                  productData.type,
                  productData.application_date || null,
                  productData.expiry_date || null,
                  productData.notes || null,
                  productData.pet_id || null
                ],
                (_, result) => {
                  if (result.insertId) {
                    console.log('SQLiteAdapter: Product inserted successfully:', productData.id);
                    resolve(productData);
                  } else {
                    reject(new Error('Failed to insert product.'));
                  }
                },
                (_, error) => {
                  console.error('SQLiteAdapter: Error inserting product', error);
                  reject(new Error('Failed to insert product.'));
                }
              );
            }
          });
        },
        (_, error) => {
          console.error('SQLiteAdapter: Error checking product existence', error);
          reject(new Error('Failed to check if product exists.'));
        }
      );
    });
  });
};

/**
 * Deletes a product by ID from SQLite database.
 * @param {string} productId - The ID of the product to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deletion was successful.
 */
const deleteProduct = (productId) => {
  if (!productId) {
    return Promise.reject(new Error('SQLiteAdapter: Invalid product ID provided for deletion.'));
  }

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM products WHERE id = ?',
        [productId],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            console.log('SQLiteAdapter: Product deleted successfully:', productId);
            resolve(true);
          } else {
            console.warn('SQLiteAdapter: Product ID not found for deletion:', productId);
            // Still resolve with true for idempotency
            resolve(true);
          }
        },
        (_, error) => {
          console.error('SQLiteAdapter: Error deleting product', error);
          reject(new Error('Failed to delete product.'));
        }
      );
    });
  });
};

/**
 * Retrieves a single product by ID from SQLite database.
 * @param {string} productId - The ID of the product to retrieve.
 * @returns {Promise<Object|undefined>} A promise that resolves to the product object or undefined if not found.
 */
const getProductById = (productId) => {
  if (!productId) {
    return Promise.reject(new Error('SQLiteAdapter: Invalid product ID provided for retrieval.'));
  }

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT products.*, pets.name as pet_name FROM products LEFT JOIN pets ON products.pet_id = pets.id WHERE products.id = ?',
        [productId],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0));
          } else {
            resolve(undefined); // Return undefined if not found
          }
        },
        (_, error) => {
          console.error('SQLiteAdapter: Error getting product by ID', error);
          reject(new Error('Failed to retrieve product by ID.'));
        }
      );
    });
  });
};

/**
 * Retrieves all products for a specific pet from SQLite database.
 * @param {string} petId - The ID of the pet to retrieve products for.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of product objects.
 */
const getProductsByPetId = (petId) => {
  if (!petId) {
    return Promise.reject(new Error('SQLiteAdapter: Invalid pet ID provided for product retrieval.'));
  }

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM products WHERE pet_id = ?',
        [petId],
        (_, { rows }) => {
          const products = [];
          for (let i = 0; i < rows.length; i++) {
            products.push(rows.item(i));
          }
          console.log(`SQLiteAdapter: Retrieved ${products.length} products for pet ${petId}`);
          resolve(products);
        },
        (_, error) => {
          console.error('SQLiteAdapter: Error retrieving products by pet ID', error);
          reject(new Error('Failed to retrieve products for pet.'));
        }
      );
    });
  });
};

// Export the functions adhering to the persistence interface
export const sqliteAdapter = {
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
  getProductsByPetId
};
