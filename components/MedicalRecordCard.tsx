import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { 
  FileText, Share2, Download, Tag, MessageCircle, Brain, 
  ChevronDown, ChevronUp, Activity, Syringe, Image as ImageIcon,
  FileCheck, AlertTriangle, AlertCircle, CheckCircle2, HelpCircle,
  Calendar, User, Clock
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import { MedicalRecord } from '@/types/medical';

interface MedicalRecordCardProps {
  record: MedicalRecord;
  onView: (record: MedicalRecord) => void;
  onShare?: (record: MedicalRecord) => void;
  onDownload?: (record: MedicalRecord) => void;
}

const getRecordIcon = (type: MedicalRecord['type']) => {
  switch (type) {
    case 'lab':
      return Activity;
    case 'imaging':
      return ImageIcon;
    case 'prescription':
      return FileText;
    case 'vaccination':
      return Syringe;
    case 'document':
      return FileCheck;
    default:
      return FileText;
  }
};

const getStatusIcon = (status: 'normal' | 'abnormal' | 'critical' | 'inconclusive') => {
  switch (status) {
    case 'normal':
      return CheckCircle2;
    case 'abnormal':
      return AlertTriangle;
    case 'critical':
      return AlertCircle;
    case 'inconclusive':
      return HelpCircle;
    default:
      return HelpCircle;
  }
};

const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({
  record,
  onView,
  onShare,
  onDownload,
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const RecordIcon = getRecordIcon(record.type);
  const StatusIcon = record.aiInsights ? getStatusIcon(record.aiInsights.status) : undefined;

  const getIconColor = () => {
    switch (record.type) {
      case 'lab':
        return Colors.danger;
      case 'imaging':
        return Colors.info;
      case 'prescription':
        return Colors.primary;
      case 'vaccination':
        return Colors.success;
      case 'document':
        return Colors.warning;
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
      case 'vaccination':
        return '#E8F5E9';
      case 'document':
        return '#FFF3E0';
      default:
        return Colors.secondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status: 'normal' | 'abnormal' | 'critical' | 'inconclusive') => {
    switch (status) {
      case 'normal':
        return Colors.success;
      case 'abnormal':
        return Colors.warning;
      case 'critical':
        return Colors.danger;
      case 'inconclusive':
        return Colors.textSecondary;
      default:
        return Colors.textSecondary;
    }
  };

  const getSectionHeaderStyle = (isExpanded: boolean) => ({
    ...styles.sectionHeaderBase,
    borderBottomWidth: isExpanded ? 1 : 0,
    borderBottomColor: Colors.border,
  });

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        record.aiInsights?.status === 'critical' && styles.criticalContainer
      ]} 
      onPress={() => onView(record)}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor() }]}>
          <RecordIcon size={24} color={getIconColor()} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{record.title}</Text>
          <View style={styles.subtitleContainer}>
            <Calendar size={14} color={Colors.textSecondary} />
            <Text style={[styles.subtitle, styles.subtitleSpacing]}>
              {formatDate(record.date)}
            </Text>
            <User size={14} color={Colors.textSecondary} />
            <Text style={[styles.subtitle, styles.subtitleSpacing]}>
              {record.provider}
            </Text>
          </View>
        </View>
        {StatusIcon && (
          <View style={[
            styles.statusIconContainer,
            { backgroundColor: `${getStatusColor(record.aiInsights!.status)}15` }
          ]}>
            <StatusIcon size={20} color={getStatusColor(record.aiInsights!.status)} />
          </View>
        )}
      </View>

      {record.tags && record.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {record.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Tag size={12} color={Colors.primary} />
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {record.doctorNotes && record.doctorNotes.length > 0 && (
        <View style={styles.notesSection}>
          <TouchableOpacity
            style={getSectionHeaderStyle(showNotes)}
            onPress={() => setShowNotes(!showNotes)}
          >
            <View style={styles.sectionTitleContainer}>
              <MessageCircle size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Doctor's Notes</Text>
              <View style={styles.notesCount}>
                <Text style={styles.notesCountText}>{record.doctorNotes.length}</Text>
              </View>
            </View>
            {showNotes ? (
              <ChevronUp size={20} color={Colors.textSecondary} />
            ) : (
              <ChevronDown size={20} color={Colors.textSecondary} />
            )}
          </TouchableOpacity>
          
          {showNotes && (
            <View style={styles.notesContainer}>
              {record.doctorNotes.map((note) => (
                <View key={note.id} style={styles.noteItem}>
                  <View style={styles.noteHeader}>
                    <User size={16} color={Colors.primary} />
                    <Text style={styles.noteDoctor}>{note.doctorName}</Text>
                  </View>
                  <View style={styles.noteDateContainer}>
                    <Clock size={14} color={Colors.textSecondary} />
                    <Text style={styles.noteDate}>
                      {formatDate(note.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.noteText}>{note.note}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {record.aiInsights && (
        <View style={styles.insightsSection}>
          <TouchableOpacity
            style={getSectionHeaderStyle(showInsights)}
            onPress={() => setShowInsights(!showInsights)}
          >
            <View style={styles.sectionTitleContainer}>
              <Brain size={16} color={Colors.primary} />
              <Text style={styles.sectionTitle}>AI Insights</Text>
            </View>
            {showInsights ? (
              <ChevronUp size={20} color={Colors.textSecondary} />
            ) : (
              <ChevronDown size={20} color={Colors.textSecondary} />
            )}
          </TouchableOpacity>
          
          {showInsights && (
            <View style={styles.insightsContainer}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(record.aiInsights.status)}20` }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(record.aiInsights.status) }
                ]}>
                  {record.aiInsights.status.toUpperCase()}
                </Text>
              </View>
              
              <Text style={styles.insightsSummary}>
                {record.aiInsights.summary}
              </Text>
              
              {record.aiInsights.highlights.length > 0 && (
                <View style={styles.highlightsContainer}>
                  {record.aiInsights.highlights.map((highlight, index) => (
                    <View key={index} style={styles.highlightItem}>
                      <Text style={styles.highlightParameter}>
                        {highlight.parameter}:
                      </Text>
                      <Text style={[
                        styles.highlightValue,
                        { color: getStatusColor(highlight.status) }
                      ]}>
                        {highlight.value}
                      </Text>
                      {highlight.explanation && (
                        <Text style={styles.highlightExplanation}>
                          {highlight.explanation}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}
      
      <View style={styles.footer}>
        {record.annotations && record.annotations.length > 0 && (
          <View style={styles.annotationIndicator}>
            <MessageCircle size={16} color={Colors.primary} />
            <Text style={styles.annotationCount}>
              {record.annotations.length} {record.annotations.length === 1 ? 'annotation' : 'annotations'}
            </Text>
          </View>
        )}
        
        <View style={styles.actions}>
          {record.fileUrl && (
            <View style={styles.previewContainer}>
              <Image 
                source={{ uri: record.fileUrl }} 
                style={styles.previewImage}
                resizeMode="cover"
              />
            </View>
          )}
          {onShare && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onShare(record)}
            >
              <Share2 size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
          {onDownload && record.fileUrl && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onDownload(record)}
            >
              <Download size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...Typography.h5,
    marginBottom: 4,
    fontWeight: '600',
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  subtitleSpacing: {
    marginLeft: 4,
    marginRight: 12,
  },
  statusIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}10`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  tagText: {
    ...Typography.caption,
    color: Colors.primary,
    marginLeft: 6,
    fontWeight: '500',
  },
  notesSection: {
    marginBottom: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  insightsSection: {
    marginBottom: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeaderBase: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    ...Typography.body,
    fontWeight: '600',
    marginLeft: 8,
  },
  notesContainer: {
    padding: 16,
  },
  noteItem: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  noteDoctor: {
    ...Typography.body,
    fontWeight: '600',
    marginLeft: 8,
  },
  noteDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  noteText: {
    ...Typography.body,
    lineHeight: 20,
  },
  insightsContainer: {
    padding: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  insightsSummary: {
    ...Typography.body,
    marginBottom: 16,
    lineHeight: 20,
  },
  highlightsContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  highlightItem: {
    marginBottom: 12,
  },
  highlightParameter: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  highlightValue: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  highlightExplanation: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  annotationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}10`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  annotationCount: {
    ...Typography.caption,
    color: Colors.primary,
    marginLeft: 6,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  criticalContainer: {
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  previewContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 8,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  notesCount: {
    backgroundColor: `${Colors.primary}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  notesCountText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default MedicalRecordCard;