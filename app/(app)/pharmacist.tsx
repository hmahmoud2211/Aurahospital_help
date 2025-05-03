import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, Calendar, Clock, CheckCircle2, Award, BookOpen, 
  GraduationCap, Stethoscope, Users2, FileCheck, AlertTriangle,
  BarChart3, Settings
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';

interface PharmacistStats {
  prescriptionsProcessed: number;
  patientsServed: number;
  accuracyRate: number;
  avgResponseTime: string;
}

interface Certification {
  id: string;
  title: string;
  issuedBy: string;
  date: string;
  expiryDate: string;
  status: 'active' | 'expiring' | 'expired';
}

interface ShiftInfo {
  date: string;
  startTime: string;
  endTime: string;
  type: 'morning' | 'afternoon' | 'night';
}

const DUMMY_STATS: PharmacistStats = {
  prescriptionsProcessed: 1247,
  patientsServed: 892,
  accuracyRate: 99.8,
  avgResponseTime: '15 mins'
};

const DUMMY_CERTIFICATIONS: Certification[] = [
  {
    id: 'cert1',
    title: 'Licensed Pharmacist',
    issuedBy: 'State Board of Pharmacy',
    date: '2020-01-15',
    expiryDate: '2025-01-15',
    status: 'active'
  },
  {
    id: 'cert2',
    title: 'Immunization Certification',
    issuedBy: 'American Pharmacists Association',
    date: '2021-03-20',
    expiryDate: '2024-03-20',
    status: 'expiring'
  }
];

const UPCOMING_SHIFTS: ShiftInfo[] = [
  {
    date: '2024-03-21',
    startTime: '09:00',
    endTime: '17:00',
    type: 'morning'
  },
  {
    date: '2024-03-22',
    startTime: '13:00',
    endTime: '21:00',
    type: 'afternoon'
  }
];

export default function PharmacistScreen() {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'certifications'>('overview');

  const getShiftColor = (type: ShiftInfo['type']) => {
    switch (type) {
      case 'morning':
        return Colors.success;
      case 'afternoon':
        return Colors.warning;
      case 'night':
        return Colors.info;
      default:
        return Colors.primary;
    }
  };

  const getCertificationStatusColor = (status: Certification['status']) => {
    switch (status) {
      case 'active':
        return Colors.success;
      case 'expiring':
        return Colors.warning;
      case 'expired':
        return Colors.danger;
      default:
        return Colors.textSecondary;
    }
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <FileCheck size={24} color={Colors.primary} />
          <Text style={styles.statValue}>{DUMMY_STATS.prescriptionsProcessed}</Text>
          <Text style={styles.statLabel}>Prescriptions Processed</Text>
        </View>
        <View style={styles.statCard}>
          <Users2 size={24} color={Colors.success} />
          <Text style={styles.statValue}>{DUMMY_STATS.patientsServed}</Text>
          <Text style={styles.statLabel}>Patients Served</Text>
        </View>
        <View style={styles.statCard}>
          <CheckCircle2 size={24} color={Colors.info} />
          <Text style={styles.statValue}>{DUMMY_STATS.accuracyRate}%</Text>
          <Text style={styles.statLabel}>Accuracy Rate</Text>
        </View>
        <View style={styles.statCard}>
          <Clock size={24} color={Colors.warning} />
          <Text style={styles.statValue}>{DUMMY_STATS.avgResponseTime}</Text>
          <Text style={styles.statLabel}>Avg. Response Time</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        <View style={styles.achievementCard}>
          <Award size={20} color={Colors.primary} />
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>Excellence in Patient Care</Text>
            <Text style={styles.achievementDate}>March 2024</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Development</Text>
        <View style={styles.developmentCard}>
          <BookOpen size={20} color={Colors.info} />
          <View style={styles.developmentInfo}>
            <Text style={styles.developmentTitle}>Advanced Medication Therapy Management</Text>
            <Text style={styles.developmentProgress}>12/15 modules completed</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderScheduleTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Shifts</Text>
        {UPCOMING_SHIFTS.map((shift, index) => (
          <View key={index} style={styles.shiftCard}>
            <View style={[
              styles.shiftIndicator,
              { backgroundColor: getShiftColor(shift.type) }
            ]} />
            <View style={styles.shiftInfo}>
              <Text style={styles.shiftDate}>{shift.date}</Text>
              <Text style={styles.shiftTime}>
                {shift.startTime} - {shift.endTime}
              </Text>
              <Text style={[
                styles.shiftType,
                { color: getShiftColor(shift.type) }
              ]}>
                {shift.type.charAt(0).toUpperCase() + shift.type.slice(1)} Shift
              </Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.requestButton}>
        <Calendar size={20} color={Colors.background} />
        <Text style={styles.requestButtonText}>Request Schedule Change</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCertificationsTab = () => (
    <View style={styles.tabContent}>
      {DUMMY_CERTIFICATIONS.map(cert => (
        <View key={cert.id} style={styles.certificationCard}>
          <View style={styles.certificationHeader}>
            <GraduationCap size={24} color={Colors.primary} />
            <View style={[
              styles.statusBadge,
              { backgroundColor: `${getCertificationStatusColor(cert.status)}20` }
            ]}>
              <Text style={[
                styles.statusText,
                { color: getCertificationStatusColor(cert.status) }
              ]}>
                {cert.status.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <Text style={styles.certificationTitle}>{cert.title}</Text>
          <Text style={styles.certificationIssuer}>{cert.issuedBy}</Text>
          
          <View style={styles.certificationDates}>
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>Issued</Text>
              <Text style={styles.dateValue}>{cert.date}</Text>
            </View>
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>Expires</Text>
              <Text style={[
                styles.dateValue,
                cert.status === 'expiring' && styles.expiringDate
              ]}>
                {cert.expiryDate}
              </Text>
            </View>
          </View>

          {cert.status === 'expiring' && (
            <View style={styles.warningContainer}>
              <AlertTriangle size={16} color={Colors.warning} />
              <Text style={styles.warningText}>Renewal required soon</Text>
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.uploadButton}>
        <FileCheck size={20} color={Colors.background} />
        <Text style={styles.uploadButtonText}>Upload New Certification</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header 
        title="Pharmacist Profile" 
        rightComponent={
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      <View style={styles.profile}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://example.com/placeholder-avatar.jpg' }}
            style={styles.avatar}
          />
          <View style={styles.statusIndicator} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>Dr. Sarah Chen</Text>
          <Text style={styles.role}>Senior Pharmacist</Text>
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Stethoscope size={12} color={Colors.primary} />
              <Text style={styles.badgeText}>10+ Years Experience</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'overview' && styles.activeTabText
          ]}>Overview</Text>
        </TouchableOpacity>
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
          style={[styles.tab, activeTab === 'certifications' && styles.activeTab]}
          onPress={() => setActiveTab('certifications')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'certifications' && styles.activeTabText
          ]}>Certifications</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'schedule' && renderScheduleTab()}
        {activeTab === 'certifications' && renderCertificationsTab()}
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  statCard: {
    width: '50%',
    padding: 8,
  },
  statValue: {
    ...Typography.h3,
    marginVertical: 8,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.h5,
    marginBottom: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  achievementInfo: {
    marginLeft: 12,
    flex: 1,
  },
  achievementTitle: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: 4,
  },
  achievementDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  developmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  developmentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  developmentTitle: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: 4,
  },
  developmentProgress: {
    ...Typography.caption,
    color: Colors.info,
  },
  shiftCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  shiftIndicator: {
    width: 4,
  },
  shiftInfo: {
    flex: 1,
    padding: 16,
  },
  shiftDate: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: 4,
  },
  shiftTime: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  shiftType: {
    ...Typography.caption,
    fontWeight: '500',
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  requestButtonText: {
    ...Typography.body,
    color: Colors.background,
    marginLeft: 8,
    fontWeight: '600',
  },
  certificationCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  certificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  certificationTitle: {
    ...Typography.h5,
    marginBottom: 4,
  },
  certificationIssuer: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  certificationDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dateValue: {
    ...Typography.body,
  },
  expiringDate: {
    color: Colors.warning,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.warning}15`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    ...Typography.caption,
    color: Colors.warning,
    marginLeft: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  uploadButtonText: {
    ...Typography.body,
    color: Colors.background,
    marginLeft: 8,
    fontWeight: '600',
  },
}); 