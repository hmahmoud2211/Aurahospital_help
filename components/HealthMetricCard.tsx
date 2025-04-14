import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';

interface HealthMetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status?: 'normal' | 'warning' | 'danger';
  subtitle?: string;
}

const HealthMetricCard: React.FC<HealthMetricCardProps> = ({
  title,
  value,
  unit,
  status = 'normal',
  subtitle,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'warning':
        return Colors.warning;
      case 'danger':
        return Colors.danger;
      default:
        return Colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: getStatusColor() }]}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    ...Typography.label,
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    ...Typography.h2,
    fontWeight: 'bold',
  },
  unit: {
    ...Typography.bodySmall,
    marginLeft: 4,
    color: Colors.textSecondary,
  },
  subtitle: {
    ...Typography.caption,
    marginTop: 4,
  },
});

export default HealthMetricCard;