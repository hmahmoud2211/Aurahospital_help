import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertCircle,
  Clock,
  TrendingUp,
  BarChart3,
  X,
  Edit3,
  Trash2,
  ShoppingCart,
  DollarSign,
  Calendar,
  Heart,
  Users,
  FileText,
  MessageSquare,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';

interface Medicine {
  id: number;
  name: string;
  generic_name: string;
  brand_name?: string;
  manufacturer: string;
  dosage_form: string;
  strength: string;
  category: string;
  description?: string;
  unit_price: number;
  current_stock: number;
  minimum_stock: number;
  expiry_date: string;
  batch_number: string;
  barcode?: string;
  prescription_required: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Prescription {
  id: number;
  patient_name: string;
  patient_email: string;
  prescriber_name: string;
  medicine_name: string;
  medicine_strength: string;
  medicine_form: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity_prescribed: number;
  quantity_dispensed: number;
  instructions?: string;
  status: string;
  prescribed_date: string;
  dispensed_date?: string;
  pharmacist_name?: string;
}

interface InventoryReport {
  total_medicines: number;
  low_stock_count: number;
  expired_count: number;
  total_value: number;
  medicines: Array<{
    id: number;
    name: string;
    current_stock: number;
    minimum_stock: number;
    expiry_date: string;
    unit_price: number;
    total_value: number;
    status: 'normal' | 'low_stock' | 'expired';
  }>;
}

const API_BASE_URL = 'http://localhost:8000';

export default function PharmacyManagementScreen() {
  const { user, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'prescriptions' | 'reports'>('dashboard');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [isAddMedicineModalVisible, setIsAddMedicineModalVisible] = useState(false);
  const [isDispenseModalVisible, setIsDispenseModalVisible] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  
  // Form states
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    generic_name: '',
    brand_name: '',
    manufacturer: '',
    dosage_form: '',
    strength: '',
    category: '',
    description: '',
    unit_price: '',
    current_stock: '',
    minimum_stock: '',
    expiry_date: '',
    batch_number: '',
    barcode: '',
    prescription_required: true,
  });

  const [dispenseData, setDispenseData] = useState({
    quantity_dispensed: '',
  });

  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'pharmacist') {
      loadData();
    }
  }, [user, activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'inventory' || activeTab === 'dashboard') {
        await loadMedicines();
      }
      if (activeTab === 'prescriptions' || activeTab === 'dashboard') {
        await loadPrescriptions();
      }
      if (activeTab === 'reports' || activeTab === 'dashboard') {
        await loadInventoryReport();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadMedicines = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pharmacy/medicines/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMedicines(data);
      } else {
        throw new Error('Failed to load medicines');
      }
    } catch (error) {
      console.error('Error loading medicines:', error);
    }
  };

  const loadPrescriptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pharmacy/prescriptions/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data);
      } else {
        throw new Error('Failed to load prescriptions');
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    }
  };

  const loadInventoryReport = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pharmacy/reports/inventory/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setInventoryReport(data);
      } else {
        throw new Error('Failed to load inventory report');
      }
    } catch (error) {
      console.error('Error loading inventory report:', error);
    }
  };

  const handleAddMedicine = async () => {
    try {
      // Validate required fields
      if (!newMedicine.name || !newMedicine.generic_name || !newMedicine.manufacturer || 
          !newMedicine.dosage_form || !newMedicine.strength || !newMedicine.category ||
          !newMedicine.unit_price || !newMedicine.current_stock || !newMedicine.expiry_date ||
          !newMedicine.batch_number) {
        Alert.alert('Validation Error', 'Please fill in all required fields marked with *');
        return;
      }

      const medicineData = {
        ...newMedicine,
        unit_price: parseFloat(newMedicine.unit_price),
        current_stock: parseInt(newMedicine.current_stock),
        minimum_stock: newMedicine.minimum_stock ? parseInt(newMedicine.minimum_stock) : 10,
      };

      const response = await fetch(`${API_BASE_URL}/api/pharmacy/medicines/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(medicineData),
      });
      
      if (response.ok) {
        Alert.alert('Success', 'Medicine added successfully');
        setIsAddMedicineModalVisible(false);
        setNewMedicine({
          name: '',
          generic_name: '',
          brand_name: '',
          manufacturer: '',
          dosage_form: '',
          strength: '',
          category: '',
          description: '',
          unit_price: '',
          current_stock: '',
          minimum_stock: '',
          expiry_date: '',
          batch_number: '',
          barcode: '',
          prescription_required: true,
        });
        loadMedicines();
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.detail || 'Failed to add medicine');
      }
    } catch (error) {
      console.error('Error adding medicine:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add medicine';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleDispensePrescription = async () => {
    if (!selectedPrescription) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/pharmacy/prescriptions/${selectedPrescription.id}/dispense`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity_dispensed: parseInt(dispenseData.quantity_dispensed),
          pharmacist_id: user?.id,
        }),
      });
      
      if (response.ok) {
        Alert.alert('Success', 'Prescription dispensed successfully');
        setIsDispenseModalVisible(false);
        setSelectedPrescription(null);
        setDispenseData({ quantity_dispensed: '' });
        loadPrescriptions();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to dispense prescription');
      }
    } catch (error) {
      console.error('Error dispensing prescription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to dispense prescription';
      Alert.alert('Error', errorMessage);
    }
  };

  const openDispenseModal = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setDispenseData({ quantity_dispensed: prescription.quantity_prescribed.toString() });
    setIsDispenseModalVisible(true);
  };

  const getStockStatusColor = (medicine: Medicine) => {
    if (new Date(medicine.expiry_date) < new Date()) {
      return Colors.danger;
    } else if (medicine.current_stock <= medicine.minimum_stock) {
      return Colors.warning;
    }
    return Colors.success;
  };

  const getStockStatusText = (medicine: Medicine) => {
    if (new Date(medicine.expiry_date) < new Date()) {
      return 'Expired';
    } else if (medicine.current_stock <= medicine.minimum_stock) {
      return 'Low Stock';
    }
    return 'In Stock';
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         medicine.generic_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || medicine.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending');

  const renderWelcomeDashboard = () => {
    const userName = user?.name || 'Pharmacist';
    const currentTime = new Date().getHours();
    const greeting = currentTime < 12 ? 'Good Morning' : currentTime < 18 ? 'Good Afternoon' : 'Good Evening';
    
    return (
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeHeader}>
          <View>
            <Text style={styles.greetingText}>{greeting},</Text>
            <Text style={styles.nameText}>{userName}</Text>
            <Text style={styles.roleText}>Pharmacy Manager</Text>
          </View>
          <View style={styles.welcomeIcon}>
            <Heart size={32} color={Colors.primary} />
          </View>
        </View>
        
        <View style={styles.quickStats}>
          <View style={styles.statCard}>
            <Package size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{inventoryReport?.total_medicines || 0}</Text>
            <Text style={styles.statLabel}>Total Medicines</Text>
          </View>
          
          <View style={styles.statCard}>
            <Clock size={24} color={Colors.warning} />
            <Text style={styles.statNumber}>{prescriptions.filter(p => p.status === 'pending').length}</Text>
            <Text style={styles.statLabel}>Pending Rx</Text>
          </View>
          
          <View style={styles.statCard}>
            <AlertCircle size={24} color={Colors.danger} />
            <Text style={styles.statNumber}>{inventoryReport?.low_stock_count || 0}</Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionBtn}
            onPress={() => setActiveTab('inventory')}
          >
            <Package size={20} color={Colors.background} />
            <Text style={styles.quickActionText}>Manage Inventory</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionBtn}
            onPress={() => setActiveTab('prescriptions')}
          >
            <Clock size={20} color={Colors.background} />
            <Text style={styles.quickActionText}>View Prescriptions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionBtn}
            onPress={() => setActiveTab('reports')}
          >
            <BarChart3 size={20} color={Colors.background} />
            <Text style={styles.quickActionText}>View Reports</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.quickActionBtn, styles.secondaryActionBtn]}
            onPress={() => router.push('/(app)/(tabs)/records')}
          >
            <FileText size={20} color={Colors.primary} />
            <Text style={[styles.quickActionText, styles.secondaryActionText]}>Medical Records</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionBtn, styles.secondaryActionBtn]}
            onPress={() => router.push('/(app)/(tabs)/chat')}
          >
            <MessageSquare size={20} color={Colors.primary} />
            <Text style={[styles.quickActionText, styles.secondaryActionText]}>AI Chatbot</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionBtn, styles.secondaryActionBtn]}
            onPress={() => router.push('/(app)/(tabs)/appointments')}
          >
            <Calendar size={20} color={Colors.primary} />
            <Text style={[styles.quickActionText, styles.secondaryActionText]}>Appointments</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Users size={20} color={Colors.textSecondary} />
            <Text style={styles.activityText}>
              {prescriptions.filter(p => p.status === 'dispensed').length} prescriptions dispensed today
            </Text>
          </View>
          {inventoryReport && inventoryReport.low_stock_count > 0 && (
            <View style={styles.activityCard}>
              <AlertCircle size={20} color={Colors.warning} />
              <Text style={styles.activityText}>
                {inventoryReport.low_stock_count} medicines running low on stock
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
        onPress={() => setActiveTab('dashboard')}
      >
        <Heart size={20} color={activeTab === 'dashboard' ? Colors.primary : Colors.textSecondary} />
        <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
          Dashboard
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'inventory' && styles.activeTab]}
        onPress={() => setActiveTab('inventory')}
      >
        <Package size={20} color={activeTab === 'inventory' ? Colors.primary : Colors.textSecondary} />
        <Text style={[styles.tabText, activeTab === 'inventory' && styles.activeTabText]}>
          Inventory
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'prescriptions' && styles.activeTab]}
        onPress={() => setActiveTab('prescriptions')}
      >
        <Clock size={20} color={activeTab === 'prescriptions' ? Colors.primary : Colors.textSecondary} />
        <Text style={[styles.tabText, activeTab === 'prescriptions' && styles.activeTabText]}>
          Prescriptions
        </Text>
        {pendingPrescriptions.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingPrescriptions.length}</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
        onPress={() => setActiveTab('reports')}
      >
        <BarChart3 size={20} color={activeTab === 'reports' ? Colors.primary : Colors.textSecondary} />
        <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>
          Reports
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderInventoryTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search medicines..."
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddMedicineModalVisible(true)}
        >
          <Plus size={20} color={Colors.background} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredMedicines}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.medicineCard}>
            <View style={styles.medicineHeader}>
              <Text style={styles.medicineName}>{item.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStockStatusColor(item) + '20' }]}>
                <Text style={[styles.statusText, { color: getStockStatusColor(item) }]}>
                  {getStockStatusText(item)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.medicineGeneric}>{item.generic_name} • {item.strength}</Text>
            <Text style={styles.medicineManufacturer}>{item.manufacturer}</Text>
            
            <View style={styles.medicineDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Stock:</Text>
                <Text style={styles.detailValue}>{item.current_stock} / {item.minimum_stock}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Price:</Text>
                <Text style={styles.detailValue}>${item.unit_price.toFixed(2)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Expires:</Text>
                <Text style={styles.detailValue}>{new Date(item.expiry_date).toLocaleDateString()}</Text>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      />
    </View>
  );

  const renderPrescriptionsTab = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={prescriptions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.prescriptionCard}>
            <View style={styles.prescriptionHeader}>
              <Text style={styles.patientName}>{item.patient_name}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: item.status === 'pending' ? Colors.warning + '20' : Colors.success + '20' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: item.status === 'pending' ? Colors.warning : Colors.success }
                ]}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.medicineInfo}>
              {item.medicine_name} {item.medicine_strength} ({item.medicine_form})
            </Text>
            <Text style={styles.dosageInfo}>
              {item.dosage} • {item.frequency} • {item.duration}
            </Text>
            <Text style={styles.prescriberInfo}>Prescribed by: {item.prescriber_name}</Text>
            
            <View style={styles.quantityInfo}>
              <Text style={styles.quantityText}>
                Quantity: {item.quantity_prescribed}
                {item.quantity_dispensed > 0 && ` (Dispensed: ${item.quantity_dispensed})`}
              </Text>
            </View>
            
            {item.status === 'pending' && (
              <TouchableOpacity
                style={styles.dispenseButton}
                onPress={() => openDispenseModal(item)}
              >
                <ShoppingCart size={16} color={Colors.background} />
                <Text style={styles.dispenseButtonText}>Dispense</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      />
    </View>
  );

  const renderReportsTab = () => (
    <View style={styles.tabContent}>
      {inventoryReport && (
        <>
          <View style={styles.reportSummary}>
            <View style={styles.summaryCard}>
              <Package size={24} color={Colors.primary} />
              <Text style={styles.summaryNumber}>{inventoryReport.total_medicines}</Text>
              <Text style={styles.summaryLabel}>Total Medicines</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <AlertCircle size={24} color={Colors.warning} />
              <Text style={styles.summaryNumber}>{inventoryReport.low_stock_count}</Text>
              <Text style={styles.summaryLabel}>Low Stock</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Calendar size={24} color={Colors.danger} />
              <Text style={styles.summaryNumber}>{inventoryReport.expired_count}</Text>
              <Text style={styles.summaryLabel}>Expired</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <DollarSign size={24} color={Colors.success} />
              <Text style={styles.summaryNumber}>${inventoryReport.total_value.toFixed(0)}</Text>
              <Text style={styles.summaryLabel}>Total Value</Text>
            </View>
          </View>

          <FlatList
            data={inventoryReport.medicines}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.reportItemCard}>
                <View style={styles.reportItemHeader}>
                  <Text style={styles.reportItemName}>{item.name}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: 
                        item.status === 'expired' ? Colors.danger + '20' :
                        item.status === 'low_stock' ? Colors.warning + '20' :
                        Colors.success + '20'
                    }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: 
                          item.status === 'expired' ? Colors.danger :
                          item.status === 'low_stock' ? Colors.warning :
                          Colors.success
                      }
                    ]}>
                      {item.status === 'expired' ? 'Expired' :
                       item.status === 'low_stock' ? 'Low Stock' : 'Normal'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.reportItemDetails}>
                  <Text style={styles.reportItemDetail}>
                    Stock: {item.current_stock} / {item.minimum_stock}
                  </Text>
                  <Text style={styles.reportItemDetail}>
                    Value: ${item.total_value.toFixed(2)}
                  </Text>
                  <Text style={styles.reportItemDetail}>
                    Expires: {new Date(item.expiry_date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
            }
          />
        </>
      )}
    </View>
  );

  if (user?.role !== 'pharmacist') {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Pharmacy Dashboard" showBack={false} />
        <View style={styles.accessDenied}>
          <AlertCircle size={48} color={Colors.textSecondary} />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            This section is only available for pharmacists.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Pharmacy Dashboard" showBack={false} />
      
      {renderTabBar()}
      
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <>
          {activeTab === 'dashboard' && renderWelcomeDashboard()}
          {activeTab === 'inventory' && renderInventoryTab()}
          {activeTab === 'prescriptions' && renderPrescriptionsTab()}
          {activeTab === 'reports' && renderReportsTab()}
        </>
      )}

      {/* Add Medicine Modal */}
      <Modal
        visible={isAddMedicineModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddMedicineModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Medicine</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsAddMedicineModalVisible(false)}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <TextInput
                style={styles.input}
                value={newMedicine.name}
                onChangeText={(text) => setNewMedicine({ ...newMedicine, name: text })}
                placeholder="Medicine Name *"
                placeholderTextColor={Colors.textSecondary}
              />
              
              <TextInput
                style={styles.input}
                value={newMedicine.generic_name}
                onChangeText={(text) => setNewMedicine({ ...newMedicine, generic_name: text })}
                placeholder="Generic Name *"
                placeholderTextColor={Colors.textSecondary}
              />
              
              <TextInput
                style={styles.input}
                value={newMedicine.brand_name}
                onChangeText={(text) => setNewMedicine({ ...newMedicine, brand_name: text })}
                placeholder="Brand Name"
                placeholderTextColor={Colors.textSecondary}
              />
              
              <TextInput
                style={styles.input}
                value={newMedicine.manufacturer}
                onChangeText={(text) => setNewMedicine({ ...newMedicine, manufacturer: text })}
                placeholder="Manufacturer *"
                placeholderTextColor={Colors.textSecondary}
              />
              
              <TextInput
                style={styles.input}
                value={newMedicine.dosage_form}
                onChangeText={(text) => setNewMedicine({ ...newMedicine, dosage_form: text })}
                placeholder="Dosage Form (e.g., tablet, capsule, syrup) *"
                placeholderTextColor={Colors.textSecondary}
              />
              
              <TextInput
                style={styles.input}
                value={newMedicine.strength}
                onChangeText={(text) => setNewMedicine({ ...newMedicine, strength: text })}
                placeholder="Strength (e.g., 500mg) *"
                placeholderTextColor={Colors.textSecondary}
              />
              
              <TextInput
                style={styles.input}
                value={newMedicine.category}
                onChangeText={(text) => setNewMedicine({ ...newMedicine, category: text })}
                placeholder="Category (e.g., antibiotic, painkiller) *"
                placeholderTextColor={Colors.textSecondary}
              />
              
              <TextInput
                style={styles.input}
                value={newMedicine.description}
                onChangeText={(text) => setNewMedicine({ ...newMedicine, description: text })}
                placeholder="Description"
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={2}
              />
              
              <TextInput
                style={styles.input}
                value={newMedicine.unit_price}
                onChangeText={(text) => setNewMedicine({ ...newMedicine, unit_price: text })}
                placeholder="Unit Price *"
                keyboardType="numeric"
                placeholderTextColor={Colors.textSecondary}
              />
              
              <TextInput
                style={styles.input}
                value={newMedicine.current_stock}
                onChangeText={(text) => setNewMedicine({ ...newMedicine, current_stock: text })}
                placeholder="Current Stock *"
                keyboardType="numeric"
                placeholderTextColor={Colors.textSecondary}
              />
              
              <TextInput
                style={styles.input}
                value={newMedicine.minimum_stock}
                onChangeText={(text) => setNewMedicine({ ...newMedicine, minimum_stock: text })}
                placeholder="Minimum Stock Level (default: 10)"
                keyboardType="numeric"
                placeholderTextColor={Colors.textSecondary}
              />
              
              <TextInput
                style={styles.input}
                value={newMedicine.expiry_date}
                onChangeText={(text) => setNewMedicine({ ...newMedicine, expiry_date: text })}
                placeholder="Expiry Date (YYYY-MM-DD) *"
                placeholderTextColor={Colors.textSecondary}
              />
              
              <TextInput
                style={styles.input}
                value={newMedicine.batch_number}
                onChangeText={(text) => setNewMedicine({ ...newMedicine, batch_number: text })}
                placeholder="Batch Number *"
                placeholderTextColor={Colors.textSecondary}
              />
              
              <TextInput
                style={styles.input}
                value={newMedicine.barcode}
                onChangeText={(text) => setNewMedicine({ ...newMedicine, barcode: text })}
                placeholder="Barcode (optional)"
                placeholderTextColor={Colors.textSecondary}
              />
            </ScrollView>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddMedicine}>
              <Text style={styles.submitButtonText}>Add Medicine</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Dispense Prescription Modal */}
      <Modal
        visible={isDispenseModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDispenseModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dispense Prescription</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsDispenseModalVisible(false)}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {selectedPrescription && (
              <View style={styles.prescriptionDetails}>
                <Text style={styles.detailTitle}>Patient: {selectedPrescription.patient_name}</Text>
                <Text style={styles.detailSubtitle}>
                  {selectedPrescription.medicine_name} {selectedPrescription.medicine_strength}
                </Text>
                <Text style={styles.detailInfo}>
                  Prescribed Quantity: {selectedPrescription.quantity_prescribed}
                </Text>
                
                <TextInput
                  style={styles.input}
                  value={dispenseData.quantity_dispensed}
                  onChangeText={(text) => setDispenseData({ ...dispenseData, quantity_dispensed: text })}
                  placeholder="Quantity to Dispense"
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
            )}

            <TouchableOpacity style={styles.submitButton} onPress={handleDispensePrescription}>
              <Text style={styles.submitButtonText}>Dispense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    ...Typography.bodySmall,
    marginLeft: 8,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    paddingVertical: 12,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  medicineCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicineName: {
    ...Typography.h5,
    flex: 1,
    marginRight: 8,
  },
  medicineGeneric: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  medicineManufacturer: {
    ...Typography.caption,
    color: Colors.textLight,
    marginBottom: 12,
  },
  medicineDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  detailValue: {
    ...Typography.bodySmall,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '500',
  },
  prescriptionCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patientName: {
    ...Typography.h5,
    flex: 1,
    marginRight: 8,
  },
  medicineInfo: {
    ...Typography.body,
    marginBottom: 4,
  },
  dosageInfo: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  prescriberInfo: {
    ...Typography.caption,
    color: Colors.textLight,
    marginBottom: 8,
  },
  quantityInfo: {
    marginBottom: 12,
  },
  quantityText: {
    ...Typography.bodySmall,
    fontWeight: '500',
  },
  dispenseButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  dispenseButtonText: {
    color: Colors.background,
    fontWeight: '600',
  },
  reportSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryNumber: {
    ...Typography.h3,
    marginTop: 8,
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  reportItemCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reportItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportItemName: {
    ...Typography.body,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  reportItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reportItemDetail: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    marginTop: 16,
    color: Colors.textSecondary,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  accessDeniedTitle: {
    ...Typography.h3,
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.h4,
  },
  closeButton: {
    padding: 8,
  },
  formContainer: {
    maxHeight: 400,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    ...Typography.body,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    fontWeight: '600',
    ...Typography.body,
    color: Colors.background,
  },
  prescriptionDetails: {
    marginBottom: 16,
  },
  detailTitle: {
    ...Typography.h5,
    marginBottom: 4,
  },
  detailSubtitle: {
    ...Typography.body,
    marginBottom: 8,
  },
  detailInfo: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  welcomeContainer: {
    flex: 1,
    padding: 16,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  greetingText: {
    ...Typography.h4,
    color: Colors.textSecondary,
  },
  nameText: {
    ...Typography.h2,
    color: Colors.text,
    marginVertical: 4,
  },
  roleText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  welcomeIcon: {
    backgroundColor: Colors.primary + '20',
    borderRadius: 24,
    padding: 16,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    ...Typography.h3,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickActionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  quickActionText: {
    color: Colors.background,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 12,
  },
  secondaryActionBtn: {
    backgroundColor: Colors.primary + '20',
  },
  secondaryActionText: {
    color: Colors.primary,
  },
  recentActivity: {
    marginTop: 16,
  },
  sectionTitle: {
    ...Typography.h4,
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activityText: {
    ...Typography.body,
    marginLeft: 12,
    flex: 1,
  },
}); 