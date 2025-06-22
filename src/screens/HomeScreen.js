import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.title}>Billy Toffy Pet Shop</Text>
        </View>
        
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Bem-vindo ao aplicativo do Billy Toffy Pet Shop!
          </Text>
          <Text style={styles.subtitleText}>
            Cuide da saúde e bem-estar dos seus pets com nosso aplicativo.
          </Text>
        </View>
        
        <View style={styles.featuresContainer}>
          <TouchableOpacity style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="paw" size={32} color="#38761D" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Cadastre seus Pets</Text>
              <Text style={styles.featureDescription}>
                Mantenha todas as informações dos seus pets organizadas.
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="calendar" size={32} color="#38761D" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Agende Banhos</Text>
              <Text style={styles.featureDescription}>
                Nunca esqueça dos banhos e tosas dos seus pets.
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="medkit" size={32} color="#38761D" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Controle de Saúde</Text>
              <Text style={styles.featureDescription}>
                Acompanhe vacinas e medicamentos dos seus pets.
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="notifications" size={32} color="#38761D" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Lembretes</Text>
              <Text style={styles.featureDescription}>
                Receba alertas sobre medicamentos e vacinas.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contato</Text>
          <View style={styles.contactItem}>
            <Ionicons name="call" size={20} color="#38761D" />
            <Text style={styles.contactText}>(48) 3333-4444</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="location" size={20} color="#38761D" />
            <Text style={styles.contactText}>Av. Principal, 123 - Centro</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="time" size={20} color="#38761D" />
            <Text style={styles.contactText}>Seg-Sex: 8h às 18h | Sáb: 8h às 12h</Text>
          </View>
        </View>
        
        {/* Add extra padding at the bottom to ensure content is not hidden by tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#F3F9F1',
    borderBottomWidth: 1,
    borderBottomColor: '#D9EAD3',
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#38761D',
    marginTop: 10,
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginTop: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#38761D',
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  featuresContainer: {
    padding: 15,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#38761D',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#38761D',
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  bottomSpacer: {
    height: Platform.OS === 'ios' ? 80 : 60, // Extra padding at bottom for iOS
  },
});

export default HomeScreen;
