import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View, StyleSheet, Image, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import Screens
import HomeScreen from './src/screens/HomeScreen';
import PetListScreen from './src/screens/PetListScreen';
import PetFormScreen from './src/screens/PetFormScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import AppointmentFormScreen from './src/screens/AppointmentFormScreen';
import HealthScreen from './src/screens/HealthScreen';
import HealthRecordFormScreen from './src/screens/HealthRecordFormScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import ProductFormScreen from './src/screens/ProductFormScreen';

// Import logo for header
const logo = require('./assets/logo.png');

const Tab = createBottomTabNavigator();
const PetStack = createStackNavigator();
const ProductStack = createStackNavigator();
const CalendarStack = createStackNavigator();
const HealthStack = createStackNavigator();

// Custom header component with logo
const LogoHeader = () => {
  return (
    <View style={styles.headerContainer}>
      <Image source={logo} style={styles.headerLogo} resizeMode="contain" />
      <Text style={styles.headerTitle}>Billy Toffy</Text>
    </View>
  );
};

// Stack Navigator for the 'Meus Pets' Tab
function PetsStackScreen() {
  return (
    <PetStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#38761D' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        // Add safe area padding for iOS devices with notches
        headerStatusBarHeight: Platform.OS === 'ios' ? StatusBar.currentHeight : 0,
        // Ensure content is within safe area
        safeAreaInsets: { top: Platform.OS === 'ios' ? 44 : 0 }
      }}
    >
      <PetStack.Screen 
        name="PetList" 
        component={PetListScreen} 
        options={{ title: 'Meus Pets' }} 
      />
      <PetStack.Screen 
        name="PetForm" 
        component={PetFormScreen} 
        options={({ route }) => ({ 
          title: route.params?.pet ? 'Editar Pet' : 'Adicionar Pet' 
        })} 
      />
    </PetStack.Navigator>
  );
}

// Stack Navigator for the 'Produtos' Tab
function ProductsStackScreen() {
  return (
    <ProductStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#38761D' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        // Add safe area padding for iOS devices with notches
        headerStatusBarHeight: Platform.OS === 'ios' ? StatusBar.currentHeight : 0,
        // Ensure content is within safe area
        safeAreaInsets: { top: Platform.OS === 'ios' ? 44 : 0 }
      }}
    >
      <ProductStack.Screen 
        name="ProductList" 
        component={ProductListScreen} 
        options={{ title: 'Produtos e Medicamentos' }} 
      />
      <ProductStack.Screen 
        name="ProductForm" 
        component={ProductFormScreen} 
        options={({ route }) => ({ 
          title: route.params?.product ? 'Editar Produto' : 'Adicionar Produto' 
        })} 
      />
    </ProductStack.Navigator>
  );
}

// Stack Navigator for the 'Agenda' Tab
function CalendarStackScreen() {
  return (
    <CalendarStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#38761D' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        // Add safe area padding for iOS devices with notches
        headerStatusBarHeight: Platform.OS === 'ios' ? StatusBar.currentHeight : 0,
        // Ensure content is within safe area
        safeAreaInsets: { top: Platform.OS === 'ios' ? 44 : 0 }
      }}
    >
      <CalendarStack.Screen 
        name="Calendar" 
        component={CalendarScreen} 
        options={{ title: 'Agenda' }} 
      />
      <CalendarStack.Screen 
        name="AppointmentForm" 
        component={AppointmentFormScreen} 
        options={({ route }) => ({ 
          title: route.params?.appointment ? 'Editar Agendamento' : 'Novo Agendamento' 
        })} 
      />
    </CalendarStack.Navigator>
  );
}

// Stack Navigator for the 'Saúde' Tab
function HealthStackScreen() {
  return (
    <HealthStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#38761D' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        // Add safe area padding for iOS devices with notches
        headerStatusBarHeight: Platform.OS === 'ios' ? StatusBar.currentHeight : 0,
        // Ensure content is within safe area
        safeAreaInsets: { top: Platform.OS === 'ios' ? 44 : 0 }
      }}
    >
      <HealthStack.Screen 
        name="Health" 
        component={HealthScreen} 
        options={{ title: 'Saúde' }} 
      />
      <HealthStack.Screen 
        name="HealthRecordForm" 
        component={HealthRecordFormScreen} 
        options={({ route }) => ({ 
          title: route.params?.record ? 'Editar Registro' : 'Novo Registro' 
        })} 
      />
    </HealthStack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: route.name === 'Início', // Only show header on Home screen
            header: () => <LogoHeader />, // Custom header with logo
            tabBarStyle: { 
              backgroundColor: '#38761D',
              height: 60,
              paddingBottom: 10,
              paddingTop: 5,
              borderTopWidth: 1,
              borderTopColor: '#2D5E17',
              // Add safe area padding for iOS devices with home indicator
              paddingBottom: Platform.OS === 'ios' ? 25 : 10,
            },
            tabBarActiveTintColor: '#FFFFFF',
            tabBarInactiveTintColor: '#B7D7A8',
            tabBarLabelStyle: { 
              fontSize: 12,
              fontWeight: '500',
              // Adjust position to account for larger bottom padding
              paddingBottom: Platform.OS === 'ios' ? 5 : 0,
            },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Início') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Meus Pets') {
                iconName = focused ? 'paw' : 'paw-outline';
              } else if (route.name === 'Agenda') {
                iconName = focused ? 'calendar' : 'calendar-outline';
              } else if (route.name === 'Saúde') {
                iconName = focused ? 'medkit' : 'medkit-outline';
              } else if (route.name === 'Produtos') {
                iconName = focused ? 'medical' : 'medical-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Início" component={HomeScreen} />
          <Tab.Screen name="Meus Pets" component={PetsStackScreen} options={{ headerShown: false }} />
          <Tab.Screen name="Agenda" component={CalendarStackScreen} options={{ headerShown: false }} />
          <Tab.Screen name="Saúde" component={HealthStackScreen} options={{ headerShown: false }} />
          <Tab.Screen name="Produtos" component={ProductsStackScreen} options={{ headerShown: false }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // Add padding for status bar on iOS
    paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight : 0,
    backgroundColor: '#F3F9F1',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38761D',
    height: 60,
    paddingHorizontal: 15,
    // Add extra padding for iOS devices with notches
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
