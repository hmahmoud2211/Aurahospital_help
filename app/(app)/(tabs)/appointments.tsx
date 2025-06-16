import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Plus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import AppointmentCard from '@/components/AppointmentCard';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';
import { useAppointmentStore } from '@/store/appointment-store';

export default function AppointmentsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { appointments, fetchAppointments, isLoading, error } = useAppointmentStore();
  
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    console.log('🏥 Appointments screen - Current user:', user);
    if (user) {
      console.log(`📅 Fetching appointments for ${user.role} with ID: ${user.id}`);
      fetchAppointments(String(user.id), user.role);
    }
  }, [user]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await fetchAppointments(String(user.id), user.role);
    }
    setRefreshing(false);
  };
  
  const filteredAppointments = () => {
    const now = new Date();
    console.log(`🔍 Filtering ${appointments.length} appointments with filter: ${filter}`);
    console.log('📋 All appointments:', appointments);
    
    switch (filter) {
      case 'upcoming':
        const upcoming = appointments.filter(appointment => {
          const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
          const isUpcoming = appointmentDate > now && appointment.status !== 'cancelled';
          console.log(`📅 Appointment ${appointment.id}: ${appointment.date} ${appointment.time} - isUpcoming: ${isUpcoming}`);
          return isUpcoming;
        }).sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });
        console.log(`✅ Filtered ${upcoming.length} upcoming appointments:`, upcoming);
        return upcoming;
      
      case 'past':
        const past = appointments.filter(appointment => {
          const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
          const isPast = appointmentDate <= now || appointment.status === 'cancelled';
          console.log(`📅 Appointment ${appointment.id}: ${appointment.date} ${appointment.time} - isPast: ${isPast}`);
          return isPast;
        }).sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateB.getTime() - dateA.getTime(); // Reverse sort for past appointments
        });
        console.log(`✅ Filtered ${past.length} past appointments:`, past);
        return past;
      
      default:
        console.log(`✅ Showing all ${appointments.length} appointments:`, appointments);
        return appointments.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header 
        title="Appointments" 
        showBack={true}
        rightComponent={
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/appointments/book')}
          >
            <Plus size={24} color={Colors.background} />
          </TouchableOpacity>
        }
      />
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'upcoming' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('upcoming')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'upcoming' && styles.filterTextActive,
            ]}
          >
            Upcoming ({appointments.filter(apt => {
              const appointmentDate = new Date(`${apt.date}T${apt.time}`);
              return appointmentDate > new Date() && apt.status !== 'cancelled';
            }).length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'past' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('past')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'past' && styles.filterTextActive,
            ]}
          >
            Past ({appointments.filter(apt => {
              const appointmentDate = new Date(`${apt.date}T${apt.time}`);
              return appointmentDate <= new Date() || apt.status === 'cancelled';
            }).length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            All ({appointments.length})
          </Text>
        </TouchableOpacity>
      </View>
      
      {user?.role === 'practitioner' && appointments.length > 0 && (
        <View style={styles.doctorStatsContainer}>
          <Text style={styles.doctorStatsTitle}>
            📊 Your appointments (Doctor ID: {user.id})
          </Text>
          <Text style={styles.doctorStatsText}>
            Total appointments: {appointments.length} | 
            Upcoming: {appointments.filter(apt => {
              const appointmentDate = new Date(`${apt.date}T${apt.time}`);
              return appointmentDate > new Date() && apt.status !== 'cancelled';
            }).length}
          </Text>
        </View>
      )}
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading appointments...</Text>
          </View>
        ) : filteredAppointments().length > 0 ? (
          filteredAppointments().map((appointment) => (
            <AppointmentCard 
              key={appointment.id} 
              appointment={appointment}
              showPatient={user?.role === 'practitioner'}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Calendar size={48} color={Colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>No appointments found</Text>
            <Text style={styles.emptyText}>
              {filter === 'upcoming'
                ? "You don't have any upcoming appointments."
                : filter === 'past'
                ? "You don't have any past appointments."
                : "You don't have any appointments."}
            </Text>
            <Button
              title="Book Appointment"
              onPress={() => router.push('/appointments/book')}
              style={styles.bookButton}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.primaryLight,
  },
  filterText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    ...Typography.h4,
    marginBottom: 8,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  bookButton: {
    width: 200,
  },
  doctorStatsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  doctorStatsTitle: {
    ...Typography.h5,
    marginBottom: 8,
  },
  doctorStatsText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});