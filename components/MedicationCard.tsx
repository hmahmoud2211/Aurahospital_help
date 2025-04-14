import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Pill } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import { Medication } from '@/types/medical';

interface MedicationCardProps {
  medication: Medication;
  onRefill?: (medicationId: string) => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ medication, onRefill }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Pill size={20} color={Colors.primary} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{medication.name} {medication.dosage}</Text>
          <Text style={styles.subtitle}>{medication.frequency} • Refills: {medication.refills}</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: medication.isActive ? Colors.success : Colors.textLight }]} />
          <Text style={styles.statusText}>{medication.isActive ? 'Active' : 'Inactive'}</Text>
        </View>
        
        {medication.isActive && onRefill && (
          <TouchableOpacity 
            style={styles.refillButton}
            onPress={() => onRefill(medication.id)}
          >
            <Text style={styles.refillText}>Refill</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...Typography.h5,
    marginBottom: 2,
  },
  subtitle: {
    ...Typography.caption,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
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
  statusText: {
    ...Typography.caption,
    fontWeight: '500',
  },
  refillButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  refillText: {
    ...Typography.caption,
    color: Colors.background,
    fontWeight: '500',
  },
});

export default MedicationCard;