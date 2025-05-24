import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  TestTube,
  Scan,
  Upload,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Search,
  CalendarDays,
  FolderOpen,
  Bell,
  Plus,
  X,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import { useAuthStore } from '@/store/auth-store';

interface LabTest {
  id: number;
  patient_id: number;
  test_type: string;
  test_name: string;
  status: string;
  scheduled_date: string;
  urgent: boolean;
  patientDetails: {
    name: any[];
    email: string;
  };
  requestedByDetails: {
    name: any[];
  };
}

interface Scan {
  id: number;
  patient_id: number;
  scan_type: string;
  body_part: string;
  status: string;
  scheduled_date: string;
  urgent: boolean;
  patientDetails: {
    name: any[];
    email: string;
  };
  requestedByDetails: {
    name: any[];
  };
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  reason: string;
  status: string;
  patientDetails: {
    name: any[];
    email: string;
  };
}

export default function LaboristScreen() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isViewAllModalVisible, setIsViewAllModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'tests' | 'scans' | 'appointments'>('tests');

  useEffect(() => {
    if (user?.role !== 'laborist') {
      Alert.alert('Access Denied', 'This screen is only for laborist users.');
      router.back();
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadLabTests(),
        loadScans(),
        loadAppointments(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadLabTests = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/laborist/lab-tests/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setLabTests(data);
      }
    } catch (error) {
      console.error('Error loading lab tests:', error);
    }
  };

  const loadScans = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/laborist/scans/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setScans(data);
      }
    } catch (error) {
      console.error('Error loading scans:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/laborist/appointments/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return Colors.warning;
      case 'in_progress':
        return Colors.info;
      case 'completed':
        return Colors.success;
      case 'cancelled':
        return Colors.danger;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return Clock;
      case 'in_progress':
        return AlertCircle;
      case 'completed':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const updateTestStatus = async (testId: number, status: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/laborist/lab-tests/${testId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        loadLabTests();
        Alert.alert('Success', 'Test status updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update test status');
      }
    } catch (error) {
      console.error('Error updating test status:', error);
      Alert.alert('Error', 'Failed to update test status');
    }
  };

  const updateScanStatus = async (scanId: number, status: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/laborist/scans/${scanId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        loadScans();
        Alert.alert('Success', 'Scan status updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update scan status');
      }
    } catch (error) {
      console.error('Error updating scan status:', error);
      Alert.alert('Error', 'Failed to update scan status');
    }
  };

  const navigateToAppointmentDetails = (appointmentId: number) => {
    router.push(`/(app)/appointments/${appointmentId}`);
  };

  const navigateToBookAppointment = () => {
    router.push('/(app)/(tabs)/appointments');
  };

  const getNextAppointment = () => {
    const now = new Date();
    const upcomingAppointments = appointments
      .filter(apt => {
        const appointmentDate = new Date(`${apt.date}T${apt.time}`);
        return appointmentDate > now && apt.status !== 'cancelled';
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
    
    return upcomingAppointments[0] || null;
  };

  const getUrgentTests = () => {
    return labTests.filter(test => test.urgent && test.status !== 'completed').slice(0, 3);
  };

  const getUrgentScans = () => {
    return scans.filter(scan => scan.urgent && scan.status !== 'completed').slice(0, 3);
  };

  const openViewAllModal = (type: 'tests' | 'scans' | 'appointments') => {
    setModalType(type);
    setIsViewAllModalVisible(true);
  };

  const renderAddButton = (type: 'tests' | 'scans' | 'uploads') => {
    const getAction = () => {
      switch (type) {
        case 'uploads':
          return () => router.push('/(app)/laborist/upload');
        default:
          return () => Alert.alert('Coming Soon', 'This feature is coming soon!');
      }
    };

    return (
      <TouchableOpacity 
        style={styles.addButton}
        onPress={getAction()}
      >
        <Plus size={16} color={Colors.background} style={styles.addButtonIcon} />
        <Text style={styles.addButtonText}>
          {type === 'uploads' ? 'Upload' : 'Add'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderReminderCard = () => {
    const nextAppointment = getNextAppointment();
    const urgentCount = getUrgentTests().length + getUrgentScans().length;
    
    if (!nextAppointment && urgentCount === 0) return null;
    
    return (
      <View style={styles.reminderCard}>
        <View style={styles.reminderHeader}>
          <View style={styles.reminderIconContainer}>
            <Bell size={20} color={Colors.primary} />
          </View>
          <View style={styles.reminderContent}>
            <Text style={styles.reminderTitle}>
              {urgentCount > 0 ? 'Urgent Tasks' : 'Next Appointment'}
            </Text>
            <Text style={styles.reminderText}>
              {urgentCount > 0 
                ? `${urgentCount} urgent test${urgentCount > 1 ? 's' : ''} pending`
                : nextAppointment ? `${nextAppointment.reason}` : 'No upcoming tasks'
              }
            </Text>
          </View>
          {nextAppointment && (
            <Text style={styles.reminderTime}>{nextAppointment.time}</Text>
          )}
        </View>
        
        {nextAppointment && (
          <View style={styles.reminderActions}>
            <TouchableOpacity 
              style={styles.reminderActionButton}
              onPress={() => navigateToAppointmentDetails(nextAppointment.id)}
            >
              <Calendar size={16} color={Colors.primary} />
              <Text style={styles.reminderActionText}>View Details</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderTestCard = (test: LabTest) => {
    const StatusIcon = getStatusIcon(test.status);
    const patientName = test.patientDetails.name?.[0]?.text || 'Unknown Patient';
    
    return (
      <View key={test.id} style={styles.card}>
        {test.urgent && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>URGENT</Text>
          </View>
        )}
        
        <View style={styles.cardHeader}>
          <View style={styles.testInfo}>
            <Text style={styles.testName}>{test.test_name}</Text>
            <Text style={styles.testType}>{test.test_type}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(test.status) }]}>
            <StatusIcon size={12} color={Colors.background} />
            <Text style={styles.statusText}>{test.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <Text style={styles.patientName}>Patient: {patientName}</Text>
          <Text style={styles.scheduleDate}>Scheduled: {test.scheduled_date}</Text>
        </View>
        
        <View style={styles.cardActions}>
          {test.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.info }]}
              onPress={() => updateTestStatus(test.id, 'in_progress')}
            >
              <Text style={styles.actionButtonText}>Start</Text>
            </TouchableOpacity>
          )}
          {test.status === 'in_progress' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.success }]}
              onPress={() => updateTestStatus(test.id, 'completed')}
            >
              <Text style={styles.actionButtonText}>Complete</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderScanCard = (scan: Scan) => {
    const StatusIcon = getStatusIcon(scan.status);
    const patientName = scan.patientDetails.name?.[0]?.text || 'Unknown Patient';
    
    return (
      <View key={scan.id} style={styles.card}>
        {scan.urgent && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>URGENT</Text>
          </View>
        )}
        
        <View style={styles.cardHeader}>
          <View style={styles.testInfo}>
            <Text style={styles.testName}>{scan.scan_type}</Text>
            <Text style={styles.testType}>{scan.body_part}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(scan.status) }]}>
            <StatusIcon size={12} color={Colors.background} />
            <Text style={styles.statusText}>{scan.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <Text style={styles.patientName}>Patient: {patientName}</Text>
          <Text style={styles.scheduleDate}>Scheduled: {scan.scheduled_date}</Text>
        </View>
        
        <View style={styles.cardActions}>
          {scan.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.info }]}
              onPress={() => updateScanStatus(scan.id, 'in_progress')}
            >
              <Text style={styles.actionButtonText}>Start</Text>
            </TouchableOpacity>
          )}
          {scan.status === 'in_progress' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.success }]}
              onPress={() => updateScanStatus(scan.id, 'completed')}
            >
              <Text style={styles.actionButtonText}>Complete</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header 
        title="Laboratory Services" 
        showBack={false}
        rightComponent={
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push('/(app)/(tabs)/profile')}
            >
              <User size={24} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push('/(app)/laborist/chat')}
            >
              <MessageCircle size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        }
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderReminderCard()}
        
        {/* Lab Tests Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lab Tests</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => openViewAllModal('tests')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
            {renderAddButton('tests')}
          </View>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading lab tests...</Text>
          </View>
        ) : getUrgentTests().length > 0 ? (
          getUrgentTests().map(renderTestCard)
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <TestTube size={48} color={Colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>No urgent lab tests</Text>
            <Text style={styles.emptyText}>
              All lab tests are up to date.
            </Text>
          </View>
        )}
        
        {/* Scans Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Medical Scans</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => openViewAllModal('scans')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
            {renderAddButton('scans')}
          </View>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading scans...</Text>
          </View>
        ) : getUrgentScans().length > 0 ? (
          getUrgentScans().map(renderScanCard)
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Scan size={48} color={Colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>No urgent scans</Text>
            <Text style={styles.emptyText}>
              All scans are up to date.
            </Text>
          </View>
        )}
        
        {/* Quick Actions Section */}
        <View style={styles.pharmacyOptionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.pharmacyOption}
            onPress={() => router.push('/(app)/laborist/upload')}
          >
            <View style={styles.pharmacyOptionIcon}>
              <Upload size={20} color={Colors.primary} />
            </View>
            <View style={styles.pharmacyOptionContent}>
              <Text style={styles.pharmacyOptionTitle}>Upload Medical Files</Text>
              <Text style={styles.pharmacyOptionText}>
                Upload test results, scan images, and medical documents
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.pharmacyOption}
            onPress={() => openViewAllModal('appointments')}
          >
            <View style={styles.pharmacyOptionIcon}>
              <Calendar size={20} color={Colors.primary} />
            </View>
            <View style={styles.pharmacyOptionContent}>
              <Text style={styles.pharmacyOptionTitle}>View All Appointments</Text>
              <Text style={styles.pharmacyOptionText}>
                Manage your schedule and patient appointments
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.pharmacyOption}
            onPress={() => router.push('/(app)/(tabs)/records')}
          >
            <View style={styles.pharmacyOptionIcon}>
              <FolderOpen size={20} color={Colors.primary} />
            </View>
            <View style={styles.pharmacyOptionContent}>
              <Text style={styles.pharmacyOptionTitle}>Medical Records</Text>
              <Text style={styles.pharmacyOptionText}>
                Access patient medical history and records
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.pharmacyOption}
            onPress={() => navigateToBookAppointment()}
          >
            <View style={styles.pharmacyOptionIcon}>
              <CalendarDays size={20} color={Colors.primary} />
            </View>
            <View style={styles.pharmacyOptionContent}>
              <Text style={styles.pharmacyOptionTitle}>Book New Appointment</Text>
              <Text style={styles.pharmacyOptionText}>
                Schedule new appointments for patients
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* View All Modal */}
      <Modal
        visible={isViewAllModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsViewAllModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                All {modalType === 'tests' ? 'Lab Tests' : 
                    modalType === 'scans' ? 'Medical Scans' : 'Appointments'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsViewAllModalVisible(false)}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              {modalType === 'tests' && labTests.map(renderTestCard)}
              {modalType === 'scans' && scans.map(renderScanCard)}
              {modalType === 'appointments' && appointments.map((appointment) => {
                const getPatientName = () => {
                  try {
                    const patientDetails = appointment.patientDetails;
                    if (!patientDetails?.name) return 'Unknown Patient';
                    
                    if (Array.isArray(patientDetails.name) && patientDetails.name.length > 0) {
                      const nameItem = patientDetails.name[0] as any;
                      return nameItem?.text || 'Unknown Patient';
                    }
                    
                    if (typeof patientDetails.name === 'object' && patientDetails.name !== null) {
                      return (patientDetails.name as any)?.text || 'Unknown Patient';
                    }
                    
                    return String(patientDetails.name) || 'Unknown Patient';
                  } catch {
                    return 'Unknown Patient';
                  }
                };
                
                const patientName = getPatientName();
                
                return (
                  <TouchableOpacity 
                    key={appointment.id} 
                    style={styles.appointmentCard}
                    onPress={() => navigateToAppointmentDetails(appointment.id)}
                  >
                    <View style={styles.appointmentHeader}>
                      <Text style={styles.appointmentTime}>{appointment.time}</Text>
                      <Text style={styles.appointmentDate}>{appointment.date}</Text>
                    </View>
                    <Text style={styles.appointmentPatient}>{patientName}</Text>
                    <Text style={styles.appointmentReason}>{appointment.reason}</Text>
                    <View style={styles.appointmentActions}>
                      <View style={[styles.appointmentStatus, { backgroundColor: getStatusColor(appointment.status) }]}>
                        <Text style={styles.appointmentStatusText}>{appointment.status.toUpperCase()}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.viewDetailsButton}
                        onPress={() => navigateToAppointmentDetails(appointment.id)}
                      >
                        <Text style={styles.viewDetailsText}>View Details</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    elevation: 2,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    marginLeft: 8,
  },
  chatButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    marginLeft: 8,
  },
  quickAccessBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    elevation: 1,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  quickAccessBarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  quickAccessBarText: {
    ...Typography.bodySmall,
    color: Colors.text,
    marginLeft: 6,
    fontWeight: '500',
  },
  tabContainer: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.background,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
  contentContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButtonText: {
    ...Typography.body,
    color: Colors.background,
    marginLeft: 8,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  urgentBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.danger,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
  },
  urgentText: {
    ...Typography.caption,
    color: Colors.background,
    fontWeight: '700',
    fontSize: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: 6,
  },
  testType: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 1,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.background,
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 11,
  },
  cardBody: {
    marginBottom: 20,
  },
  patientName: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 6,
  },
  doctorName: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  scheduleDate: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionButtonText: {
    ...Typography.bodySmall,
    color: Colors.background,
    fontWeight: '600',
  },
  viewButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  viewButtonText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  appointmentCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentTime: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: '700',
  },
  appointmentDate: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  appointmentPatient: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 6,
  },
  appointmentReason: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  appointmentStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 1,
  },
  appointmentStatusText: {
    ...Typography.caption,
    color: Colors.background,
    fontWeight: '600',
    fontSize: 11,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  viewDetailsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    elevation: 1,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  viewDetailsText: {
    ...Typography.bodySmall,
    color: Colors.background,
    fontWeight: '600',
    fontSize: 12,
  },
  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 6,
  },
  profileRole: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  profileButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
    elevation: 1,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  profileButtonText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'transparent',
    elevation: 1,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  secondaryButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  quickAccessSection: {
    marginBottom: 24,
  },
  quickAccessTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: 16,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickAccessCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: `${Colors.primary}20`,
  },
  quickAccessText: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  quickAccessSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 11,
  },
  tapHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
    fontSize: 11,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.text,
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 16,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  pharmacyOptionsContainer: {
    padding: 16,
  },
  pharmacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginBottom: 12,
  },
  pharmacyOptionIcon: {
    marginRight: 12,
  },
  pharmacyOptionContent: {
    flex: 1,
  },
  pharmacyOptionTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  pharmacyOptionText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
  },
  scrollContent: {
    padding: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewAllText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
    marginRight: 12,
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonIcon: {
    marginRight: 8,
  },
  addButtonText: {
    ...Typography.bodySmall,
    color: Colors.background,
    fontWeight: '600',
  },
  reminderCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderIconContainer: {
    marginRight: 12,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: 8,
  },
  reminderText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  reminderTime: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  reminderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  reminderActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
    flex: 1,
    justifyContent: 'center',
    elevation: 1,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reminderActionText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
  },
  modalScrollView: {
    maxHeight: '80%',
  },
}); 