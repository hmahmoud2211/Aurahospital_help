import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { FileText, Share2, Download } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import { MedicalRecord } from '@/types/medical';

interface MedicalRecordCardProps {
  record: MedicalRecord;
  onView: (record: MedicalRecord) => void;
  onShare?: (record: MedicalRecord) => void;
  onDownload?: (record: MedicalRecord) => void;
}

const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({
  record,
  onView,
  onShare,
  onDownload,
}) => {
  const getIconColor = () => {
    switch (record.type) {
      case 'lab':
        return Colors.danger;
      case 'imaging':
        return Colors.info;
      case 'prescription':
        return Colors.primary;
      case 'document':
        return Colors.success;
      default:
        return Colors.textSecondary;
    }
  };

  const getIconBackgroundColor = () => {
    switch (record.type) {
      case 'lab':
        return '#FFEBEE';
      case 'imaging':
        return '#E3F2FD';
      case 'prescription':
        return '#EEF0FF';
      case 'document':
        return '#E8F5E9';
      default:
        return Colors.secondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onView(record)}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor() }]}>
          <FileText size={20} color={getIconColor()} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{record.title}</Text>
          <Text style={styles.subtitle}>Uploaded: {formatDate(record.date)}</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        {onShare && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onShare(record)}
          >
            <Share2 size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
        
        {onDownload && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onDownload(record)}
          >
            <Download size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
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
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
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
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default MedicalRecordCard;