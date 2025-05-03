import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  BarChart3, TrendingUp, Users, Package, AlertTriangle, 
  DollarSign, Calendar, Download, Filter, Mail, FileText,
  Table, Share2, Clock, X, ChevronDown, Search
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';

interface ReportMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
}

const METRICS: ReportMetric[] = [
  {
    id: 'm1',
    title: 'Total Prescriptions',
    value: '1,247',
    change: '+12.5%',
    trend: 'up',
    icon: Package,
    color: Colors.primary
  },
  {
    id: 'm2',
    title: 'Revenue',
    value: '$45,892',
    change: '+8.2%',
    trend: 'up',
    icon: DollarSign,
    color: Colors.success
  },
  {
    id: 'm3',
    title: 'Active Patients',
    value: '892',
    change: '+5.3%',
    trend: 'up',
    icon: Users,
    color: Colors.info
  },
  {
    id: 'm4',
    title: 'Low Stock Items',
    value: '8',
    change: '-2',
    trend: 'down',
    icon: AlertTriangle,
    color: Colors.warning
  }
];

interface Report {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
}

const AVAILABLE_REPORTS: Report[] = [
  {
    id: 'r1',
    title: 'Daily Sales Report',
    description: 'Summary of all transactions, prescriptions filled, and revenue',
    lastUpdated: '2024-03-21 09:00 AM',
    type: 'daily'
  },
  {
    id: 'r2',
    title: 'Inventory Status',
    description: 'Current stock levels, low stock alerts, and reorder recommendations',
    lastUpdated: '2024-03-21 09:00 AM',
    type: 'daily'
  },
  {
    id: 'r3',
    title: 'Weekly Performance',
    description: 'Prescription trends, patient visits, and revenue analysis',
    lastUpdated: '2024-03-18 11:30 PM',
    type: 'weekly'
  },
  {
    id: 'r4',
    title: 'Monthly Analytics',
    description: 'Comprehensive analysis of pharmacy operations and financials',
    lastUpdated: '2024-02-29 11:59 PM',
    type: 'monthly'
  }
];

interface FilterOptions {
  dateRange: 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  categories: string[];
  department?: string;
}

const DEPARTMENTS = ['Pharmacy', 'Inventory', 'Finance', 'Operations'];
const CATEGORIES = ['Sales', 'Inventory', 'Prescriptions', 'Staff', 'Financial'];

export default function ReportsScreen() {
  const [selectedReportType, setSelectedReportType] = useState<Report['type']>('daily');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    dateRange: 'today',
    categories: [],
    department: undefined
  });
  const [selectedExportFormat, setSelectedExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [emailSchedule, setEmailSchedule] = useState({
    enabled: false,
    frequency: 'daily',
    email: ''
  });

  const handleDownloadReport = (report: Report) => {
    // In a real app, this would trigger the report download
    console.log('Downloading report:', report.title);
  };

  const handleExport = () => {
    console.log('Exporting report:', {
      format: selectedExportFormat,
      filters: filterOptions,
      schedule: emailSchedule
    });
    setShowExportModal(false);
  };

  const renderMetricCard = (metric: ReportMetric) => {
    const Icon = metric.icon;
    return (
      <View key={metric.id} style={styles.metricCard}>
        <View style={[styles.metricIcon, { backgroundColor: `${metric.color}15` }]}>
          <Icon size={24} color={metric.color} />
        </View>
        <Text style={styles.metricTitle}>{metric.title}</Text>
        <Text style={styles.metricValue}>{metric.value}</Text>
        <View style={styles.metricTrend}>
          <TrendingUp 
            size={16} 
            color={metric.trend === 'up' ? Colors.success : Colors.danger}
            style={metric.trend === 'down' && styles.trendDown}
          />
          <Text style={[
            styles.metricChange,
            { color: metric.trend === 'up' ? Colors.success : Colors.danger }
          ]}>
            {metric.change}
          </Text>
        </View>
      </View>
    );
  };

  const renderReportCard = (report: Report) => (
    <View key={report.id} style={styles.reportCard}>
      <View style={styles.reportInfo}>
        <Text style={styles.reportTitle}>{report.title}</Text>
        <Text style={styles.reportDescription}>{report.description}</Text>
        <View style={styles.reportMeta}>
          <Calendar size={14} color={Colors.textSecondary} />
          <Text style={styles.lastUpdated}>Last updated: {report.lastUpdated}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.downloadButton}
        onPress={() => handleDownloadReport(report)}
      >
        <Download size={20} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderCharts = () => (
    <View style={styles.chartsContainer}>
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Sales Trend</Text>
        <View style={styles.chartPlaceholder}>
          <BarChart3 size={32} color={Colors.primary} />
          <Text style={styles.chartPlaceholderText}>Interactive Chart</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Inventory Levels</Text>
        <View style={styles.chartPlaceholder}>
          <Package size={32} color={Colors.warning} />
          <Text style={styles.chartPlaceholderText}>Stock Analysis</Text>
        </View>
      </View>
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Advanced Filters</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowFilterModal(false)}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Date Range</Text>
              {['today', 'week', 'month', 'custom'].map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.filterOption,
                    filterOptions.dateRange === range && styles.filterOptionActive
                  ]}
                  onPress={() => setFilterOptions({
                    ...filterOptions,
                    dateRange: range as FilterOptions['dateRange']
                  })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filterOptions.dateRange === range && styles.filterOptionTextActive
                  ]}>
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Categories</Text>
              <View style={styles.categoriesGrid}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      filterOptions.categories.includes(category) && styles.categoryChipActive
                    ]}
                    onPress={() => {
                      const newCategories = filterOptions.categories.includes(category)
                        ? filterOptions.categories.filter(c => c !== category)
                        : [...filterOptions.categories, category];
                      setFilterOptions({
                        ...filterOptions,
                        categories: newCategories
                      });
                    }}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      filterOptions.categories.includes(category) && styles.categoryChipTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Department</Text>
              <View style={styles.departmentSelector}>
                {DEPARTMENTS.map((dept) => (
                  <TouchableOpacity
                    key={dept}
                    style={[
                      styles.departmentOption,
                      filterOptions.department === dept && styles.departmentOptionActive
                    ]}
                    onPress={() => setFilterOptions({
                      ...filterOptions,
                      department: dept
                    })}
                  >
                    <Text style={[
                      styles.departmentOptionText,
                      filterOptions.department === dept && styles.departmentOptionTextActive
                    ]}>
                      {dept}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.secondaryButton]}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.primaryButton]}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.primaryButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderExportModal = () => (
    <Modal
      visible={showExportModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowExportModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Export Options</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowExportModal(false)}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.exportSection}>
              <Text style={styles.exportSectionTitle}>Format</Text>
              <View style={styles.exportFormats}>
                {[
                  { id: 'pdf', icon: FileText, label: 'PDF' },
                  { id: 'excel', icon: Table, label: 'Excel' },
                  { id: 'csv', icon: FileText, label: 'CSV' }
                ].map((format) => (
                  <TouchableOpacity
                    key={format.id}
                    style={[
                      styles.formatOption,
                      selectedExportFormat === format.id && styles.formatOptionActive
                    ]}
                    onPress={() => setSelectedExportFormat(format.id as typeof selectedExportFormat)}
                  >
                    <format.icon 
                      size={24} 
                      color={selectedExportFormat === format.id ? Colors.primary : Colors.textSecondary} 
                    />
                    <Text style={[
                      styles.formatOptionText,
                      selectedExportFormat === format.id && styles.formatOptionTextActive
                    ]}>
                      {format.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.exportSection}>
              <Text style={styles.exportSectionTitle}>Email Schedule</Text>
              <TouchableOpacity
                style={styles.scheduleOption}
                onPress={() => setEmailSchedule({
                  ...emailSchedule,
                  enabled: !emailSchedule.enabled
                })}
              >
                <View style={styles.scheduleHeader}>
                  <Mail size={20} color={Colors.primary} />
                  <Text style={styles.scheduleTitle}>Automated Email Reports</Text>
                  <View style={[
                    styles.scheduleStatus,
                    emailSchedule.enabled && styles.scheduleStatusActive
                  ]}>
                    <Text style={[
                      styles.scheduleStatusText,
                      emailSchedule.enabled && styles.scheduleStatusTextActive
                    ]}>
                      {emailSchedule.enabled ? 'Enabled' : 'Disabled'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {emailSchedule.enabled && (
                <View style={styles.scheduleDetails}>
                  <TextInput
                    style={styles.emailInput}
                    placeholder="Enter email address"
                    value={emailSchedule.email}
                    onChangeText={(text) => setEmailSchedule({
                      ...emailSchedule,
                      email: text
                    })}
                  />
                  <View style={styles.frequencySelector}>
                    {['daily', 'weekly', 'monthly'].map((freq) => (
                      <TouchableOpacity
                        key={freq}
                        style={[
                          styles.frequencyOption,
                          emailSchedule.frequency === freq && styles.frequencyOptionActive
                        ]}
                        onPress={() => setEmailSchedule({
                          ...emailSchedule,
                          frequency: freq
                        })}
                      >
                        <Text style={[
                          styles.frequencyOptionText,
                          emailSchedule.frequency === freq && styles.frequencyOptionTextActive
                        ]}>
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.secondaryButton]}
              onPress={() => setShowExportModal(false)}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.primaryButton]}
              onPress={handleExport}
            >
              <Text style={styles.primaryButtonText}>Export</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header 
        title="Reports & Analytics"
        rightComponent={
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Filter size={24} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowExportModal(true)}
            >
              <Share2 size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
        }
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.metricsGrid}>
          {METRICS.map(renderMetricCard)}
        </View>

        {renderCharts()}

        <View style={styles.reportsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Reports</Text>
          </View>

          <View style={styles.reportTypes}>
            {(['daily', 'weekly', 'monthly', 'custom'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  selectedReportType === type && styles.typeButtonActive
                ]}
                onPress={() => setSelectedReportType(type)}
              >
                <Text style={[
                  styles.typeButtonText,
                  selectedReportType === type && styles.typeButtonTextActive
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.reportsList}>
            {AVAILABLE_REPORTS
              .filter(report => report.type === selectedReportType)
              .map(renderReportCard)}
          </View>
        </View>
      </ScrollView>

      {renderFilterModal()}
      {renderExportModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  metricCard: {
    width: '50%',
    padding: 8,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    ...Typography.h3,
    marginBottom: 8,
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricChange: {
    ...Typography.caption,
    marginLeft: 4,
    fontWeight: '600',
  },
  trendDown: {
    transform: [{ rotate: '180deg' }],
  },
  reportsSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.h4,
  },
  reportTypes: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: Colors.card,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
  },
  typeButtonText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: Colors.background,
  },
  reportsList: {
    flex: 1,
  },
  reportCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  reportInfo: {
    flex: 1,
    marginRight: 16,
  },
  reportTitle: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  reportDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastUpdated: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  downloadButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartsContainer: {
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  chartTitle: {
    ...Typography.h5,
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: `${Colors.primary}05`,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    ...Typography.h4,
  },
  closeButton: {
    padding: 4,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    ...Typography.h5,
    marginBottom: 16,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: Colors.card,
  },
  filterOptionActive: {
    backgroundColor: Colors.primary,
  },
  filterOptionText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  filterOptionTextActive: {
    color: Colors.background,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -4,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
    backgroundColor: Colors.card,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryChipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.background,
  },
  departmentSelector: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  departmentOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  departmentOptionActive: {
    backgroundColor: `${Colors.primary}15`,
  },
  departmentOptionText: {
    ...Typography.body,
    color: Colors.text,
  },
  departmentOptionTextActive: {
    color: Colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.card,
  },
  primaryButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  secondaryButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  exportSection: {
    marginBottom: 24,
  },
  exportSectionTitle: {
    ...Typography.h5,
    marginBottom: 16,
  },
  exportFormats: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  formatOption: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
  },
  formatOptionActive: {
    backgroundColor: `${Colors.primary}15`,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  formatOptionText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  formatOptionTextActive: {
    color: Colors.primary,
  },
  scheduleOption: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleTitle: {
    ...Typography.body,
    flex: 1,
    marginLeft: 12,
  },
  scheduleStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.border,
  },
  scheduleStatusActive: {
    backgroundColor: `${Colors.success}20`,
  },
  scheduleStatusText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  scheduleStatusTextActive: {
    color: Colors.success,
  },
  scheduleDetails: {
    marginTop: 16,
  },
  emailInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    ...Typography.body,
  },
  frequencySelector: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 4,
  },
  frequencyOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4,
  },
  frequencyOptionActive: {
    backgroundColor: Colors.primary,
  },
  frequencyOptionText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  frequencyOptionTextActive: {
    color: Colors.background,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
}); 