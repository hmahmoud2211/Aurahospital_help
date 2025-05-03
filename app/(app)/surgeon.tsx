import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Calendar as CalendarIcon, Clock, Users, FileText, CheckSquare, 
  ClipboardCheck, MessageCircle, AlertTriangle, CheckCircle2,
  Image as ImageIcon, FileCheck, ChevronRight, ChevronDown,
  ChevronUp, Settings, User, Stethoscope
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';

interface Surgery {
  id: string;
  patientName: string;
  patientId: string;
  procedure: string;
  date: string;
  startTime: string;
  duration: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  room: string;
  team: {
    surgeon: string;
    assistants: string[];
    anesthesiologist: string;
    nurses: string[];
  };
  priority: 'normal' | 'urgent' | 'emergency';
  preOpChecklist: {
    consentSigned: boolean;
    labResultsReviewed: boolean;
    imagingReviewed: boolean;
    anesthesiaCleared: boolean;
  };
}

interface CaseFile {
  id: string;
  patientId: string;
  patientName: string;
  type: 'imaging' | 'lab' | 'note' | 'consent';
  title: string;
  date: string;
  status: 'reviewed' | 'pending' | 'flagged';
  content?: string;
  fileUrl?: string;
  notes?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'available' | 'in-surgery' | 'unavailable';
  avatar?: string;
}

const DUMMY_SURGERIES: Surgery[] = [
  {
    id: 's1',
    patientName: 'John Smith',
    patientId: 'P12345',
    procedure: 'Total Knee Replacement',
    date: '2024-03-25',
    startTime: '09:00',
    duration: '2.5 hours',
    status: 'scheduled',
    room: 'OR-1',
    team: {
      surgeon: 'Dr. Michael Chen',
      assistants: ['Dr. Sarah Johnson', 'Dr. Robert Lee'],
      anesthesiologist: 'Dr. Emily Wong',
      nurses: ['Jane Wilson', 'Mark Davis']
    },
    priority: 'normal',
    preOpChecklist: {
      consentSigned: true,
      labResultsReviewed: true,
      imagingReviewed: true,
      anesthesiaCleared: true
    }
  },
  {
    id: 's2',
    patientName: 'Emma Wilson',
    patientId: 'P12346',
    procedure: 'Laparoscopic Cholecystectomy',
    date: '2024-03-25',
    startTime: '13:00',
    duration: '1.5 hours',
    status: 'scheduled',
    room: 'OR-2',
    team: {
      surgeon: 'Dr. Michael Chen',
      assistants: ['Dr. Robert Lee'],
      anesthesiologist: 'Dr. David Kim',
      nurses: ['Lisa Anderson', 'Tom Brown']
    },
    priority: 'urgent',
    preOpChecklist: {
      consentSigned: true,
      labResultsReviewed: true,
      imagingReviewed: false,
      anesthesiaCleared: false
    }
  }
];

const DUMMY_CASE_FILES: CaseFile[] = [
  {
    id: 'cf1',
    patientId: 'P12345',
    patientName: 'John Smith',
    type: 'imaging',
    title: 'Knee MRI',
    date: '2024-03-20',
    status: 'reviewed',
    fileUrl: 'https://example.com/mri.jpg',
    notes: 'Severe osteoarthritis noted in right knee'
  },
  {
    id: 'cf2',
    patientId: 'P12345',
    patientName: 'John Smith',
    type: 'lab',
    title: 'Pre-op Blood Work',
    date: '2024-03-21',
    status: 'reviewed',
    notes: 'All values within normal range'
  },
  {
    id: 'cf3',
    patientId: 'P12346',
    patientName: 'Emma Wilson',
    type: 'imaging',
    title: 'Abdominal Ultrasound',
    date: '2024-03-22',
    status: 'flagged',
    fileUrl: 'https://example.com/ultrasound.jpg',
    notes: 'Multiple gallstones identified'
  }
];

const DUMMY_TEAM: TeamMember[] = [
  {
    id: 't1',
    name: 'Dr. Sarah Johnson',
    role: 'Assistant Surgeon',
    status: 'available',
    avatar: 'https://example.com/avatar1.jpg'
  },
  {
    id: 't2',
    name: 'Dr. Emily Wong',
    role: 'Anesthesiologist',
    status: 'in-surgery',
    avatar: 'https://example.com/avatar2.jpg'
  },
  {
    id: 't3',
    name: 'Jane Wilson',
    role: 'OR Nurse',
    status: 'available',
    avatar: 'https://example.com/avatar3.jpg'
  }
];

export default function SurgeonScreen() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'cases' | 'team'>('schedule');
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null);
  const [expandedChecklist, setExpandedChecklist] = useState(false);

  const getStatusColor = (status: Surgery['status'] | CaseFile['status']) => {
    switch (status) {
      case 'scheduled':
      case 'pending':
        return Colors.warning;
      case 'in-progress':
        return Colors.info;
      case 'completed':
      case 'reviewed':
        return Colors.success;
      case 'cancelled':
      case 'flagged':
        return Colors.danger;
      default:
        return Colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: Surgery['priority']) => {
    switch (priority) {
      case 'emergency':
        return Colors.danger;
      case 'urgent':
        return Colors.warning;
      case 'normal':
        return Colors.success;
      default:
        return Colors.textSecondary;
    }
  };

  const renderSurgeryCard = (surgery: Surgery) => (
    <TouchableOpacity 
      key={surgery.id}
      style={styles.surgeryCard}
      onPress={() => setSelectedSurgery(surgery)}
    >
      <View style={styles.surgeryHeader}>
        <View style={styles.surgeryInfo}>
          <Text style={styles.patientName}>{surgery.patientName}</Text>
          <Text style={styles.patientId}>ID: {surgery.patientId}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: `${getStatusColor(surgery.status)}20` }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(surgery.status) }
          ]}>
            {surgery.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.surgeryDetails}>
        <View style={styles.detailRow}>
          <FileText size={16} color={Colors.primary} />
          <Text style={styles.procedureText}>{surgery.procedure}</Text>
        </View>
        <View style={styles.detailRow}>
          <CalendarIcon size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{surgery.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            {surgery.startTime} ({surgery.duration})
          </Text>
        </View>
      </View>

      <View style={styles.teamPreview}>
        <Users size={16} color={Colors.textSecondary} />
        <Text style={styles.teamText}>
          {surgery.team.surgeon}, +{surgery.team.assistants.length + surgery.team.nurses.length} others
        </Text>
      </View>

      <View style={styles.checklistPreview}>
        <CheckSquare size={16} color={Colors.primary} />
        <View style={styles.checklistProgress}>
          <Text style={styles.checklistText}>Pre-op Checklist</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${Object.values(surgery.preOpChecklist).filter(Boolean).length / 4 * 100}%`,
                  backgroundColor: getStatusColor('completed')
                }
              ]} 
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCaseFileCard = (file: CaseFile) => (
    <TouchableOpacity key={file.id} style={styles.caseFileCard}>
      <View style={styles.fileHeader}>
        <View style={styles.fileTypeIcon}>
          {file.type === 'imaging' ? (
            <ImageIcon size={20} color={Colors.primary} />
          ) : file.type === 'lab' ? (
            <ClipboardCheck size={20} color={Colors.info} />
          ) : file.type === 'note' ? (
            <FileText size={20} color={Colors.warning} />
          ) : (
            <FileCheck size={20} color={Colors.success} />
          )}
        </View>
        <View style={styles.fileInfo}>
          <Text style={styles.fileTitle}>{file.title}</Text>
          <Text style={styles.fileDate}>{file.date}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: `${getStatusColor(file.status)}20` }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(file.status) }
          ]}>
            {file.status.toUpperCase()}
          </Text>
        </View>
      </View>
      {file.notes && (
        <Text style={styles.fileNotes}>{file.notes}</Text>
      )}
    </TouchableOpacity>
  );

  const renderTeamMember = (member: TeamMember) => (
    <View key={member.id} style={styles.teamMemberCard}>
      <View style={styles.memberAvatar}>
        <Image
          source={{ uri: member.avatar }}
          style={styles.avatarImage}
          defaultSource={{ uri: 'https://via.placeholder.com/40' }}
        />
        <View style={[
          styles.statusDot,
          { backgroundColor: member.status === 'available' ? Colors.success : 
                           member.status === 'in-surgery' ? Colors.warning :
                           Colors.danger }
        ]} />
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberRole}>{member.role}</Text>
      </View>
      <TouchableOpacity style={styles.messageButton}>
        <MessageCircle size={20} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderScheduleTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.dateHeader}>
        <CalendarIcon size={24} color={Colors.primary} />
        <Text style={styles.dateText}>Today, March 25, 2024</Text>
      </View>
      {DUMMY_SURGERIES.map(renderSurgeryCard)}
    </View>
  );

  const renderCasesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.filterTabs}>
        <TouchableOpacity style={[styles.filterTab, styles.activeFilterTab]}>
          <Text style={[styles.filterTabText, styles.activeFilterTabText]}>All Files</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterTab}>
          <Text style={styles.filterTabText}>Imaging</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterTab}>
          <Text style={styles.filterTabText}>Labs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterTab}>
          <Text style={styles.filterTabText}>Notes</Text>
        </TouchableOpacity>
      </View>
      {DUMMY_CASE_FILES.map(renderCaseFileCard)}
    </View>
  );

  const renderTeamTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.teamHeader}>
        <Text style={styles.teamTitle}>Operating Room Team</Text>
        <TouchableOpacity style={styles.addMemberButton}>
          <Text style={styles.addMemberText}>Add Member</Text>
          <ChevronRight size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      {DUMMY_TEAM.map(renderTeamMember)}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header 
        title="Surgeon Dashboard" 
        rightComponent={
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      <View style={styles.profile}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://example.com/surgeon-avatar.jpg' }}
            style={styles.avatar}
          />
          <View style={styles.statusIndicator} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>Dr. Michael Chen</Text>
          <Text style={styles.role}>Chief Surgeon</Text>
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Stethoscope size={12} color={Colors.primary} />
              <Text style={styles.badgeText}>15+ Years Experience</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
          onPress={() => setActiveTab('schedule')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'schedule' && styles.activeTabText
          ]}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'cases' && styles.activeTab]}
          onPress={() => setActiveTab('cases')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'cases' && styles.activeTabText
          ]}>Case Files</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'team' && styles.activeTab]}
          onPress={() => setActiveTab('team')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'team' && styles.activeTabText
          ]}>Team</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'schedule' && renderScheduleTab()}
        {activeTab === 'cases' && renderCasesTab()}
        {activeTab === 'team' && renderTeamTab()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profile: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.border,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.card,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    ...Typography.h4,
    marginBottom: 4,
  },
  role: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.primary,
    marginLeft: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  tabContent: {
    flex: 1,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    ...Typography.h5,
    marginLeft: 8,
  },
  surgeryCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  surgeryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  surgeryInfo: {
    flex: 1,
  },
  patientName: {
    ...Typography.h5,
    marginBottom: 4,
  },
  patientId: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  surgeryDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  procedureText: {
    ...Typography.body,
    fontWeight: '500',
    marginLeft: 8,
  },
  detailText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  teamPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  checklistPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checklistProgress: {
    flex: 1,
    marginLeft: 8,
  },
  checklistText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: `${Colors.primary}20`,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  filterTabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterTab: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  activeFilterTabText: {
    color: Colors.background,
  },
  caseFileCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fileTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileTitle: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: 4,
  },
  fileDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  fileNotes: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamTitle: {
    ...Typography.h5,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMemberText: {
    ...Typography.body,
    color: Colors.primary,
    marginRight: 4,
  },
  teamMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  memberAvatar: {
    position: 'relative',
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.card,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: 2,
  },
  memberRole: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 