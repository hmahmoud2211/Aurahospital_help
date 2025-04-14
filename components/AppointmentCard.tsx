import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Calendar, Clock, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import { Appointment } from '@/types/appointment';

interface AppointmentCardProps {
  appointment: Appointment;
  showPatient?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  showPatient = false,
}) => {
  const router = useRouter();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getStatusColor = () => {
    switch (appointment.status) {
      case 'confirmed':
        return Colors.primary;
      case 'completed':
        return Colors.success;
      case 'cancelled':
        return Colors.danger;
      case 'no-show':
        return Colors.warning;
      default:
        return Colors.info;
    }
  };

  const handlePress = () => {
    router.push(`/appointments/${appointment.id}`);
  };

  const isUpcoming = () => {
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
    return appointmentDate > new Date();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.status}>{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</Text>
        </View>
        {isUpcoming() && appointment.status !== 'cancelled' && (
          <View style={styles.upcomingBadge}>
            <Text style={styles.upcomingText}>Upcoming</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        {showPatient && appointment.patient && (
          <View style={styles.infoRow}>
            <User size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{appointment.patient.name}</Text>
          </View>
        )}
        
        {!showPatient && appointment.doctor && (
          <View style={styles.infoRow}>
            <User size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>Dr. {appointment.doctor.name}</Text>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <Calendar size={16} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{formatDate(appointment.date)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Clock size={16} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{formatTime(appointment.time)} ({appointment.duration} min)</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.reason}>{appointment.reason}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  status: {
    ...Typography.caption,
    fontWeight: '500',
  },
  upcomingBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upcomingText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '500',
  },
  content: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    ...Typography.body,
    marginLeft: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  reason: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});

export default AppointmentCard;