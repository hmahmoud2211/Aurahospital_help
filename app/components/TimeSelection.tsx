import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';

interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
}

interface TimeSelectionProps {
  doctorName: string;
  selectedDate: Date;
  timeSlots: TimeSlot[];
  onSelectTime: (slot: TimeSlot) => void;
  onBack: () => void;
}

const TimeSelection: React.FC<TimeSelectionProps> = ({
  doctorName,
  selectedDate,
  timeSlots,
  onSelectTime,
  onBack,
}) => {
  // Group time slots by period (Morning, Afternoon, Evening)
  const groupedSlots = {
    Morning: timeSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 8 && hour < 12;
    }),
    Afternoon: timeSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 12 && hour < 17;
    }),
    Evening: timeSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 17 && hour < 20;
    }),
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back to Date Selection</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Time</Text>
        <Text style={styles.subtitle}>
          {doctorName} - {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <ScrollView style={styles.timeSlotsContainer}>
        {Object.entries(groupedSlots).map(([period, slots]) => (
          slots.length > 0 && (
            <View key={period} style={styles.periodContainer}>
              <Text style={styles.periodTitle}>{period}</Text>
              <View style={styles.slotsGrid}>
                {slots.map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.timeSlot,
                      !slot.isAvailable && styles.unavailableSlot,
                    ]}
                    onPress={() => slot.isAvailable && onSelectTime(slot)}
                    disabled={!slot.isAvailable}
                  >
                    <Text style={[
                      styles.timeText,
                      !slot.isAvailable && styles.unavailableText,
                    ]}>
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    ...Typography.body,
    color: Colors.primary,
  },
  title: {
    ...Typography.h1,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.h2,
    color: Colors.textSecondary,
  },
  timeSlotsContainer: {
    flex: 1,
    padding: 16,
  },
  periodContainer: {
    marginBottom: 24,
  },
  periodTitle: {
    ...Typography.h2,
    marginBottom: 12,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  timeSlot: {
    width: '30%',
    margin: '1.5%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  unavailableSlot: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
  },
  timeText: {
    ...Typography.body,
    color: Colors.primary,
  },
  unavailableText: {
    color: Colors.textSecondary,
  },
});

export default TimeSelection; 