import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Plus, Search, Calendar, Tag, AlertCircle, ChevronDown, ChevronUp, Brain } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import MedicalRecordCard from '@/components/MedicalRecordCard';
import { useAuthStore } from '@/store/auth-store';
import { useMedicalRecordsStore } from '@/store/medical-records-store';
import { MedicalRecord } from '@/types/medical';
import { dummyMedicalRecords } from '@/data/dummyMedicalRecords';

const AVAILABLE_TAGS = [
  'Urgent',
  'Follow-up',
  'Review',
  'Important',
  'Chronic',
  'Acute',
];

const VIEW_MODES = ['list', 'timeline'] as const;

const RECENTLY_SHARED_WITH = [
  { id: '1', name: 'Dr. Sarah Chen', initials: 'SC', color: '#4CAF50' },
  { id: '2', name: 'Dr. Michael Rodriguez', initials: 'MR', color: '#2196F3' },
  { id: '3', name: 'Dr. Emily Wong', initials: 'EW', color: '#9C27B0' },
  { id: '4', name: 'Dr. James Wilson', initials: 'JW', color: '#FF9800' },
];

export default function RecordsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { records: serverRecords, fetchMedicalRecords, isLoading } = useMedicalRecordsStore();
  
  // For demo purposes, we'll combine server records with dummy records
  const records = [...(serverRecords || []), ...dummyMedicalRecords];
  
  const [filter, setFilter] = useState<'all' | 'lab' | 'imaging' | 'document' | 'vaccination'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<typeof VIEW_MODES[number]>('list');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  
  useEffect(() => {
    if (user && user.role === 'patient') {
      fetchMedicalRecords(user.id);
    }
  }, [user]);
  
  const filteredRecords = () => {
    let filtered = records;
    
    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(record => record.type === filter);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record => 
        record.title.toLowerCase().includes(query) ||
        record.type.toLowerCase().includes(query) ||
        record.provider.toLowerCase().includes(query) ||
        record.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(record =>
        record.tags?.some(tag => selectedTags.includes(tag))
      );
    }
    
    // Filter by date range
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= dateRange.start! && recordDate <= dateRange.end!;
      });
    }
    
    return filtered;
  };

  const handleViewRecord = (record: MedicalRecord) => {
    router.push(`/medical-records/${record.id}`);
  };
  
  const handleShareRecord = (record: MedicalRecord) => {
    // In a real app, this would open a share dialog
    console.log('Share record:', record);
  };
  
  const handleDownloadRecord = (record: MedicalRecord) => {
    // In a real app, this would download the file
    console.log('Download record:', record);
  };

  const renderTimelineView = () => {
    const sortedRecords = filteredRecords().sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let currentMonth: string | null = null;

    return (
      <View style={styles.timelineContainer}>
        {sortedRecords.map((record) => {
          const date = new Date(record.date);
          const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
          const showMonthHeader = month !== currentMonth;
          currentMonth = month;

          return (
            <React.Fragment key={record.id}>
              {showMonthHeader && (
                <View style={styles.timelineMonthHeader}>
                  <Text style={styles.timelineMonthText}>{month}</Text>
                </View>
              )}
              <View style={styles.timelineItem}>
                <View style={styles.timelineLine} />
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <MedicalRecordCard
                    record={record}
                    onView={handleViewRecord}
                    onShare={handleShareRecord}
                    onDownload={handleDownloadRecord}
                  />
                </View>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header 
        title="Medical Records" 
        showBack={false}
        rightComponent={
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/medical-records/upload')}
          >
            <Plus size={24} color={Colors.background} />
          </TouchableOpacity>
        }
      />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, type, or provider..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
      </View>
      
      <View style={styles.recentlySharedContainer}>
        <Text style={styles.sectionTitle}>Recently Shared With</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {RECENTLY_SHARED_WITH.map((person) => (
            <View key={person.id} style={styles.personContainer}>
              <View style={[styles.initialsCircle, { backgroundColor: person.color }]}>
                <Text style={styles.initials}>{person.initials}</Text>
              </View>
              <Text style={styles.personName} numberOfLines={1}>{person.name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'all' && styles.filterTextActive,
              ]}
            >
              All Records
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'lab' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('lab')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'lab' && styles.filterTextActive,
              ]}
            >
              Lab Results
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'imaging' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('imaging')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'imaging' && styles.filterTextActive,
              ]}
            >
              Imaging
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'vaccination' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('vaccination')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'vaccination' && styles.filterTextActive,
              ]}
            >
              Vaccinations
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'document' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('document')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'document' && styles.filterTextActive,
              ]}
            >
              Documents
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <FileText size={20} color={viewMode === 'list' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.viewModeText, viewMode === 'list' && styles.viewModeTextActive]}>
            List View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'timeline' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('timeline')}
        >
          <Calendar size={20} color={viewMode === 'timeline' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.viewModeText, viewMode === 'timeline' && styles.viewModeTextActive]}>
            Timeline View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addDocumentButton}
          onPress={() => router.push('/medical-records/upload')}
        >
          <Plus size={16} color={Colors.background} />
          <Text style={styles.addDocumentText}>Add Document</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tagsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {AVAILABLE_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagButton,
                selectedTags.includes(tag) && styles.tagButtonActive,
              ]}
              onPress={() => {
                setSelectedTags(prev =>
                  prev.includes(tag)
                    ? prev.filter(t => t !== tag)
                    : [...prev, tag]
                );
              }}
            >
              <Tag size={16} color={selectedTags.includes(tag) ? Colors.primary : Colors.textSecondary} />
              <Text
                style={[
                  styles.tagText,
                  selectedTags.includes(tag) && styles.tagTextActive,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading your medical records...</Text>
          </View>
        ) : filteredRecords().length > 0 ? (
          viewMode === 'list' ? (
            filteredRecords()
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((record) => (
                <MedicalRecordCard 
                  key={record.id} 
                  record={record}
                  onView={handleViewRecord}
                  onShare={handleShareRecord}
                  onDownload={handleDownloadRecord}
                />
              ))
          ) : (
            renderTimelineView()
          )
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <FileText size={48} color={Colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>No records found</Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedTags.length > 0 || filter !== 'all'
                ? "No records match your search criteria. Try adjusting your filters."
                : "You don't have any medical records yet. Add your first record by clicking the + button."}
            </Text>
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={() => router.push('/medical-records/upload')}
            >
              <Plus size={20} color={Colors.background} style={styles.uploadButtonIcon} />
              <Text style={styles.uploadButtonText}>Upload New Record</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  filterContainer: {
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.background,
    marginHorizontal: 6,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  filterText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: Colors.background,
  },
  viewModeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.background,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  viewModeButtonActive: {
    backgroundColor: `${Colors.primary}15`,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  viewModeText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: 8,
    fontWeight: '600',
  },
  viewModeTextActive: {
    color: Colors.primary,
  },
  tagsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tagButtonActive: {
    backgroundColor: `${Colors.primary}15`,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  tagText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: '600',
  },
  tagTextActive: {
    color: Colors.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  timelineContainer: {
    paddingLeft: 32,
    paddingRight: 16,
  },
  timelineMonthHeader: {
    marginVertical: 20,
    marginLeft: -32,
    paddingLeft: 32,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  timelineMonthText: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: '600',
  },
  timelineItem: {
    position: 'relative',
    marginBottom: 20,
  },
  timelineLine: {
    position: 'absolute',
    left: -16,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: `${Colors.primary}30`,
  },
  timelineDot: {
    position: 'absolute',
    left: -20,
    top: 24,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.background,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineContent: {
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${Colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    ...Typography.h3,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  uploadButtonIcon: {
    marginRight: 8,
  },
  recentlySharedContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    ...Typography.h5,
    marginBottom: 12,
    color: Colors.text,
  },
  personContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 72,
  },
  initialsCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  initials: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  personName: {
    ...Typography.caption,
    textAlign: 'center',
    color: Colors.textSecondary,
  },
  addDocumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginLeft: 'auto',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addDocumentText: {
    ...Typography.body,
    color: Colors.background,
    marginLeft: 8,
    fontWeight: '600',
  },
});