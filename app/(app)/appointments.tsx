import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Filter, Search } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import AppointmentCard from '@/components/AppointmentCard';
import { useAuthStore } from '@/store/auth-store';
import { useAppointmentStore } from '@/store/appointment-store';
import { TextInput } from 'react-native-gesture-handler';

export default function AllAppointmentsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { appointments, fetchAppointments, isLoading } = useAppointmentStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterVisible, setFilterVisible] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchAppointments(String(user.id), 'nurse');
    }
  }, [user]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await fetchAppointments(String(user.id), 'nurse');
    }
    setRefreshing(false);
  };
  
  const filteredAppointments = () => {
    return appointments
      .filter(appointment => {
        // Filter by status
        if (statusFilter !== 'all' && appointment.status !== statusFilter) return false;
        
        // Filter by search query
        if (searchQuery) {
          const patientName = appointment.patientDetails?.name?.[0]?.text?.toLowerCase() || '';
          const doctorName = appointment.doctorDetails?.name?.[0]?.text?.toLowerCase() || '';
          const reason = appointment.reason?.toLowerCase() || '';
          
          return (
            patientName.includes(searchQuery.toLowerCase()) ||
            doctorName.includes(searchQuery.toLowerCase()) ||
            reason.includes(searchQuery.toLowerCase())
          );
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort by date (newest first)
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  };
  
  const renderFilterOptions = () => (
    <View style={styles.filterOptions}>
      <TouchableOpacity
        style={[styles.filterOption, statusFilter === 'all' && styles.activeFilterOption]}
        onPress={() => setStatusFilter('all')}
      >
        <Text style={[styles.filterOptionText, statusFilter === 'all' && styles.activeFilterOptionText]}>All</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterOption, statusFilter === 'scheduled' && styles.activeFilterOption]}
        onPress={() => setStatusFilter('scheduled')}
      >
        <Text style={[styles.filterOptionText, statusFilter === 'scheduled' && styles.activeFilterOptionText]}>Scheduled</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterOption, statusFilter === 'confirmed' && styles.activeFilterOption]}
        onPress={() => setStatusFilter('confirmed')}
      >
        <Text style={[styles.filterOptionText, statusFilter === 'confirmed' && styles.activeFilterOptionText]}>Confirmed</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterOption, statusFilter === 'completed' && styles.activeFilterOption]}
        onPress={() => setStatusFilter('completed')}
      >
        <Text style={[styles.filterOptionText, statusFilter === 'completed' && styles.activeFilterOptionText]}>Completed</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterOption, statusFilter === 'cancelled' && styles.activeFilterOption]}
        onPress={() => setStatusFilter('cancelled')}
      >
        <Text style={[styles.filterOptionText, statusFilter === 'cancelled' && styles.activeFilterOptionText]}>Cancelled</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Appointments</Text>
        <TouchableOpacity onPress={() => setFilterVisible(!filterVisible)}>
          <Filter size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by patient or doctor"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      {filterVisible && renderFilterOptions()}
      
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAppointments()}
          renderItem={({ item }) => (
            <AppointmentCard 
              appointment={item} 
              showPatient={true}
              onPress={() => item.id ? router.push({
                pathname: "/(app)/appointment/[id]",
                params: { id: item.id }
              }) : null}
            />
          )}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.appointmentsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No appointments found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            </View>
          }
        />
      )}
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/appointment/new')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterOption: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  filterOptionText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  activeFilterOptionText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  appointmentsList: {
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
}); 