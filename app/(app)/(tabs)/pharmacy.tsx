import React, { useEffect, useState } from 'react';

import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Bell, Clock, Pill, Search, CheckCircle2, XCircle, AlertTriangle, 
  MessageCircle, Package, Repeat, ChevronRight, ShoppingBag, Users,
  AlertCircle, BarChart3, Calendar, User, Stethoscope
} from 'lucide-react-native';

import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import MedicationCard from '@/components/MedicationCard';
import { useAuthStore } from '@/store/auth-store';
import { useMedicalRecordsStore } from '@/store/medical-records-store';

const TABS = ['Pending', 'Processing', 'Completed'] as const;

type PrescriptionStatus = 'pending' | 'confirmed' | 'rejected' | 'processing' | 'completed';

interface Prescription {
  id: string;
  patientName: string;
  medication: string;
  dosage: string;
  frequency: string;
  status: PrescriptionStatus;
  requestDate: string;
  doctorName: string;
}

interface Order {
  id: string;
  patientName: string;
  patientId: string;
  items: Array<{
    medicationName: string;
    quantity: number;
    price: number;
  }>;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  orderDate: string;
  totalAmount: number;
  deliveryAddress?: string;
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
  };
}

interface PatientHistory {
  patientId: string;
  patientName: string;
  dateOfBirth: string;
  prescriptions: Array<{
    id: string;
    medication: string;
    dosage: string;
    frequency: string;
    prescribedDate: string;
    endDate?: string;
    status: 'active' | 'completed' | 'discontinued';
    prescribedBy: string;
  }>;
  allergies: string[];
  chronicConditions: string[];
}

const DUMMY_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'p1',
    patientName: 'John Smith',
    medication: 'Amoxicillin 500mg',
    dosage: '1 capsule',
    frequency: '3 times daily',
    status: 'pending',
    requestDate: '2024-03-20',
    doctorName: 'Dr. Sarah Chen'
  },
  {
    id: 'p2',
    patientName: 'Emma Wilson',
    medication: 'Lisinopril 10mg',
    dosage: '1 tablet',
    frequency: 'once daily',
    status: 'processing',
    requestDate: '2024-03-19',
    doctorName: 'Dr. Michael Rodriguez'
  }
];

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  threshold: number;
  unit: string;
  price: number;
}

const DUMMY_INVENTORY: InventoryItem[] = [
  {
    id: 'i1',
    name: 'Amoxicillin 500mg',
    stock: 150,
    threshold: 50,
    unit: 'capsules',
    price: 0.75
  },
  {
    id: 'i2',
    name: 'Lisinopril 10mg',
    stock: 30,
    threshold: 100,
    unit: 'tablets',
    price: 0.50
  }
];

const DUMMY_ORDERS: Order[] = [
  {
    id: 'o1',
    patientName: 'John Smith',
    patientId: 'p123',
    items: [
      {
        medicationName: 'Amoxicillin 500mg',
        quantity: 30,
        price: 0.75
      },
      {
        medicationName: 'Ibuprofen 400mg',
        quantity: 20,
        price: 0.50
      }
    ],
    status: 'pending',
    orderDate: '2024-03-20',
    totalAmount: 32.50,
    deliveryAddress: '123 Main St, Anytown, ST 12345',
    insuranceInfo: {
      provider: 'HealthFirst',
      policyNumber: 'HF123456789'
    }
  },
  {
    id: 'o2',
    patientName: 'Emma Wilson',
    patientId: 'p124',
    items: [
      {
        medicationName: 'Lisinopril 10mg',
        quantity: 90,
        price: 0.50
      }
    ],
    status: 'processing',
    orderDate: '2024-03-19',
    totalAmount: 45.00,
    insuranceInfo: {
      provider: 'MediCare',
      policyNumber: 'MC987654321'
    }
  }
];

const DUMMY_PATIENT_HISTORIES: PatientHistory[] = [
  {
    patientId: 'p123',
    patientName: 'John Smith',
    dateOfBirth: '1985-06-15',
    prescriptions: [
      {
        id: 'rx1',
        medication: 'Amoxicillin 500mg',
        dosage: '1 capsule',
        frequency: '3 times daily',
        prescribedDate: '2024-03-20',
        endDate: '2024-03-27',
        status: 'active',
        prescribedBy: 'Dr. Sarah Chen'
      },
      {
        id: 'rx2',
        medication: 'Lisinopril 10mg',
        dosage: '1 tablet',
        frequency: 'once daily',
        prescribedDate: '2024-01-15',
        status: 'active',
        prescribedBy: 'Dr. Michael Rodriguez'
      }
    ],
    allergies: ['Penicillin', 'Sulfa drugs'],
    chronicConditions: ['Hypertension']
  },
  {
    patientId: 'p124',
    patientName: 'Emma Wilson',
    dateOfBirth: '1992-09-23',
    prescriptions: [
      {
        id: 'rx3',
        medication: 'Metformin 500mg',
        dosage: '1 tablet',
        frequency: 'twice daily',
        prescribedDate: '2024-02-01',
        status: 'active',
        prescribedBy: 'Dr. Emily Wong'
      }
    ],
    allergies: ['None reported'],
    chronicConditions: ['Type 2 Diabetes']
  }
];

export default function PharmacyScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { medications, fetchMedications, requestMedicationRefill, isLoading } = useMedicalRecordsStore();
  

  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [inventory, setInventory] = useState(DUMMY_INVENTORY);
  const [reorderAmount, setReorderAmount] = useState<{ [key: string]: number }>({});
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  

  useEffect(() => {
    if (user && user.role === 'pharmacist') {
      fetchMedications(user.id);
    }
  }, [user]);


  const handleConfirmPrescription = (prescriptionId: string) => {
    // In a real app, this would call an API to confirm the prescription
    console.log('Confirming prescription:', prescriptionId);
  };

  const handleRejectPrescription = (prescriptionId: string) => {
    // In a real app, this would call an API to reject the prescription
    console.log('Rejecting prescription:', prescriptionId);
  };

  const handleReorder = (item: InventoryItem) => {
    const defaultReorderAmount = item.threshold - item.stock > 0 ? 
      item.threshold - item.stock : item.threshold;

    setSelectedItem(item);
    setReorderAmount({ ...reorderAmount, [item.id]: defaultReorderAmount });
    setShowReorderModal(true);
  };

  const confirmReorder = () => {
    if (!selectedItem) return;

    // Update the inventory with the new stock
    setInventory(prevInventory =>
      prevInventory.map(item =>
        item.id === selectedItem.id
          ? { ...item, stock: item.stock + (reorderAmount[item.id] || 0) }
          : item
      )
    );

    // In a real app, you would make an API call here
    console.log(`Reordering ${reorderAmount[selectedItem.id]} units of ${selectedItem.name}`);

    // Reset the modal state
    setShowReorderModal(false);
    setSelectedItem(null);
  };

  const renderPrescriptionCard = (prescription: Prescription) => (
    <TouchableOpacity 
      key={prescription.id}
      style={styles.prescriptionCard}
      onPress={() => router.push({
        pathname: '/medical-records/[id]',
        params: { id: prescription.id }
      })}
    >
      <View style={styles.prescriptionHeader}>
        <View style={styles.prescriptionInfo}>
          <Text style={styles.patientName}>{prescription.patientName}</Text>
          <Text style={styles.prescriptionDate}>{prescription.requestDate}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(prescription.status) }
        ]}>
          <Text style={styles.statusText}>
            {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
          </Text>

        </View>
      </View>
      
      <View style={styles.medicationDetails}>
        <Pill size={16} color={Colors.primary} style={styles.icon} />
        <Text style={styles.medicationName}>{prescription.medication}</Text>
      </View>
      
      <View style={styles.prescriptionDetails}>
        <Text style={styles.dosageText}>
          {prescription.dosage} {prescription.frequency}
        </Text>
        <Text style={styles.doctorName}>Prescribed by: {prescription.doctorName}</Text>
      </View>
      
      {prescription.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleConfirmPrescription(prescription.id)}
          >
            <CheckCircle2 size={16} color={Colors.background} />
            <Text style={styles.actionButtonText}>Confirm</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRejectPrescription(prescription.id)}
          >
            <XCircle size={16} color={Colors.background} />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderInventorySection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Inventory Management</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push('/inventory')}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      {inventory.map(item => (
        <View key={item.id} style={styles.inventoryItem}>
          <View style={styles.inventoryInfo}>
            <Text style={styles.inventoryName}>{item.name}</Text>
            <View style={styles.stockInfo}>
              <Text style={[
                styles.stockText,
                { color: item.stock < item.threshold ? Colors.danger : Colors.success }
              ]}>
                {item.stock} {item.unit} in stock
              </Text>
              {item.stock < item.threshold && (
                <View style={styles.lowStockBadge}>
                  <AlertTriangle size={12} color={Colors.danger} />
                  <Text style={styles.lowStockText}>Low Stock</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity 
            style={[
              styles.reorderButton,
              item.stock < item.threshold && styles.reorderButtonUrgent
            ]}
            onPress={() => handleReorder(item)}
          >
            <Repeat size={16} color={item.stock < item.threshold ? Colors.danger : Colors.primary} />
            <Text style={[
              styles.reorderText,
              item.stock < item.threshold && styles.reorderTextUrgent
            ]}>
              Reorder
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      {showReorderModal && selectedItem && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reorder {selectedItem.name}</Text>
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Current Stock: {selectedItem.stock} {selectedItem.unit}</Text>
              <Text style={styles.modalLabel}>Threshold: {selectedItem.threshold} {selectedItem.unit}</Text>
              <View style={styles.quantityInput}>
                <Text style={styles.modalLabel}>Reorder Amount:</Text>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="numeric"
                  value={String(reorderAmount[selectedItem.id] || '')}
                  onChangeText={(text) => {
                    const amount = parseInt(text) || 0;
                    setReorderAmount({ ...reorderAmount, [selectedItem.id]: amount });
                  }}
                />
                <Text style={styles.modalLabel}>{selectedItem.unit}</Text>
              </View>
              <Text style={styles.estimatedCost}>
                Estimated Cost: ${((reorderAmount[selectedItem.id] || 0) * selectedItem.price).toFixed(2)}
              </Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowReorderModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmReorder}
              >
                <Text style={styles.modalButtonText}>Confirm Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity 
        style={styles.quickActionButton}
        onPress={() => router.push('/chat')}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.primary}15` }]}>
          <MessageCircle size={24} color={Colors.primary} />
        </View>
        <Text style={styles.quickActionText}>Chat with Doctor</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.quickActionButton}
        onPress={() => router.push('/orders')}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.success}15` }]}>
          <Package size={24} color={Colors.success} />
        </View>
        <Text style={styles.quickActionText}>Process Orders</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.quickActionButton}
        onPress={() => router.push('/patients')}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.info}15` }]}>
          <Users size={24} color={Colors.info} />
        </View>
        <Text style={styles.quickActionText}>Patient History</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.quickActionButton}
        onPress={() => router.push('/reports')}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.warning}15` }]}>
          <BarChart3 size={24} color={Colors.warning} />
        </View>
        <Text style={styles.quickActionText}>Reports</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.quickActionButton}
        onPress={() => router.push('/surgeon')}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.info}15` }]}>
          <Stethoscope size={24} color={Colors.info} />
        </View>
        <Text style={styles.quickActionText}>Surgeon Portal</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header 
        title="Pharmacy Dashboard" 
        showBack={false}
        rightComponent={
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.push('/pharmacist')}
            >
              <User size={24} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => router.push('/notifications')}
            >
              <Bell size={24} color={Colors.text} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        }
      />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search prescriptions, medications..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText,
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderQuickActions()}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Prescriptions</Text>
          {DUMMY_PRESCRIPTIONS
            .filter(p => p.status.toLowerCase() === activeTab.toLowerCase())
            .map(renderPrescriptionCard)}
        </View>
        
        {renderInventorySection()}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (status: PrescriptionStatus) => {
  switch (status) {
    case 'pending':
      return `${Colors.warning}30`;
    case 'confirmed':
      return `${Colors.success}30`;
    case 'rejected':
      return `${Colors.danger}30`;
    case 'processing':
      return `${Colors.info}30`;
    case 'completed':
      return `${Colors.success}30`;
    default:
      return Colors.border;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.h4,
    marginBottom: 16,
  },

  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    justifyContent: 'space-between',

  },
  quickActionButton: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    ...Typography.body,
    color: Colors.text,
    textAlign: 'center',
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
    marginBottom: 12,
  },
  prescriptionInfo: {
    flex: 1,
  },
  patientName: {
    ...Typography.h5,
    marginBottom: 4,
  },
  prescriptionDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  medicationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  medicationName: {
    ...Typography.body,
    fontWeight: '500',
  },
  prescriptionDetails: {
    marginBottom: 12,
  },
  dosageText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  doctorName: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: Colors.success,
  },
  rejectButton: {
    backgroundColor: Colors.danger,
  },
  actionButtonText: {
    ...Typography.body,
    color: Colors.background,
    marginLeft: 4,
    fontWeight: '600',
  },
  inventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  inventoryInfo: {
    flex: 1,
  },
  inventoryName: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: 4,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    ...Typography.caption,
    marginRight: 8,
  },
  lowStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.danger}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lowStockText: {
    ...Typography.caption,
    color: Colors.danger,
    marginLeft: 4,
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  reorderText: {
    ...Typography.caption,
    color: Colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    ...Typography.body,
    color: Colors.primary,
    marginRight: 4,
  },
  notificationButton: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.danger,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    ...Typography.caption,
    color: Colors.background,
    fontSize: 10,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  reorderButtonUrgent: {
    backgroundColor: `${Colors.danger}15`,
  },
  reorderTextUrgent: {
    color: Colors.danger,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    ...Typography.h4,
    marginBottom: 16,
  },
  modalBody: {
    marginBottom: 24,
  },
  modalLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  quantityInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  amountInput: {
    ...Typography.body,
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 12,
    minWidth: 80,
    textAlign: 'center',
  },
  estimatedCost: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  modalButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: Colors.textSecondary,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    ...Typography.h4,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.textSecondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    ...Typography.body,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
});