import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';

interface TagProps {
  label: string;
  color?: string;
  onPress?: () => void;
  onRemove?: () => void;
  isAddButton?: boolean;
}

const Tag: React.FC<TagProps> = ({
  label,
  color = Colors.primary,
  onPress,
  onRemove,
  isAddButton = false,
}) => {
  const getBackgroundColor = () => {
    if (isAddButton) return Colors.secondary;
    
    // Create a lighter version of the color for the background
    return color + '20'; // Adding 20% opacity
  };

  const getTextColor = () => {
    if (isAddButton) return Colors.primary;
    return color;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        onPress && styles.pressable,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      {isAddButton && (
        <Plus size={14} color={getTextColor()} style={styles.icon} />
      )}
      
      <Text style={[styles.label, { color: getTextColor() }]}>
        {label}
      </Text>
      
      {onRemove && (
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <X size={12} color={getTextColor()} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  pressable: {
    opacity: 0.9,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    ...Typography.caption,
    fontWeight: '500',
  },
  removeButton: {
    marginLeft: 4,
  },
});

export default Tag;