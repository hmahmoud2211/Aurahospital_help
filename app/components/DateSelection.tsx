import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';

interface DateSelectionProps {
  doctorId: string;
  doctorName: string;
  availableDays: string[];
  onSelectDate: (date: Date) => void;
  onBack: () => void;
}

const DateSelection: React.FC<DateSelectionProps> = ({
  doctorId,
  doctorName,
  availableDays,
  onSelectDate,
  onBack,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Generate dates for the next 30 days
  const generateDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Only include days when the doctor is available
      if (availableDays.includes(date.toLocaleDateString('en-US', { weekday: 'long' }))) {
        dates.push(date);
      }
    }
    return dates;
  };

  const availableDates = generateDates();

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back to Doctors</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Date</Text>
        <Text style={styles.doctorName}>for {doctorName}</Text>
      </View>

      <ScrollView style={styles.datesContainer}>
        <Text style={styles.monthTitle}>
          {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        
        <View style={styles.daysHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={styles.dayHeader}>{day}</Text>
          ))}
        </View>

        <View style={styles.datesList}>
          {availableDates.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateCard,
                isToday(date) && styles.todayCard,
              ]}
              onPress={() => onSelectDate(date)}
            >
              <Text style={styles.dateNumber}>{date.getDate()}</Text>
              <Text style={styles.dayName}>
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </Text>
              <Text style={styles.availability}>Available</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  doctorName: {
    ...Typography.h2,
    color: Colors.textSecondary,
  },
  monthTitle: {
    ...Typography.h2,
    padding: 16,
    textAlign: 'center',
  },
  datesContainer: {
    flex: 1,
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayHeader: {
    ...Typography.caption,
    color: Colors.textSecondary,
    width: 40,
    textAlign: 'center',
  },
  datesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  dateCard: {
    width: '31%',
    aspectRatio: 1,
    margin: '1%',
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  todayCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  dateNumber: {
    ...Typography.h2,
    color: Colors.text,
  },
  dayName: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  availability: {
    ...Typography.caption,
    color: Colors.primary,
    marginTop: 4,
  },
});

export default DateSelection; 