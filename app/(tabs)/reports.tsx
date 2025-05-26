import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { generateReport, CarEntry } from '@/services/parkingService';
import CarEntryCard from '@/components/CarEntryCard';
import { Calendar, Download, ArrowRightLeft } from 'lucide-react-native';
import Button from '@/components/Button';

export default function ReportsScreen() {
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState(new Date());
  const [reportType, setReportType] = useState<'entry' | 'exit'>('exit');
  const [reportData, setReportData] = useState<CarEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState<'start' | 'end'>('start');

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const data = await generateReport(
        startDate.toISOString(),
        endDate.toISOString(),
        reportType
      );
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateTotalRevenue = () => {
    return reportData.reduce((sum, entry) => sum + (entry.chargedAmount || 0), 0);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.filterSection}>
          <View style={styles.dateFilterContainer}>
            <Text style={styles.filterLabel}>Date Range</Text>
            <View style={styles.dateRangeContainer}>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => {
                  setSelectedDateType('start');
                  setShowDatePicker(true);
                }}
              >
                <Calendar size={16} color="#666" />
                <Text style={styles.dateText}>{formatDate(startDate)}</Text>
              </TouchableOpacity>
              
              <Text style={styles.dateRangeSeparator}>to</Text>
              
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => {
                  setSelectedDateType('end');
                  setShowDatePicker(true);
                }}
              >
                <Calendar size={16} color="#666" />
                <Text style={styles.dateText}>{formatDate(endDate)}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.typeFilterContainer}>
            <Text style={styles.filterLabel}>Report Type</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentedControlOption,
                  reportType === 'entry' && styles.segmentedControlOptionActive,
                ]}
                onPress={() => setReportType('entry')}
              >
                <Text
                  style={[
                    styles.segmentedControlOptionText,
                    reportType === 'entry' && styles.segmentedControlOptionTextActive,
                  ]}
                >
                  Car Entries
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.segmentedControlOption,
                  reportType === 'exit' && styles.segmentedControlOptionActive,
                ]}
                onPress={() => setReportType('exit')}
              >
                <Text
                  style={[
                    styles.segmentedControlOptionText,
                    reportType === 'exit' && styles.segmentedControlOptionTextActive,
                  ]}
                >
                  Car Exits
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <Button
            title="Generate Report"
            onPress={fetchReport}
            loading={isLoading}
          />
        </View>
        
        {reportType === 'exit' && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <Text style={styles.summaryCardTitle}>Revenue Summary</Text>
            </View>
            
            <View style={styles.summaryCardContent}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemLabel}>Total Transactions</Text>
                <Text style={styles.summaryItemValue}>{reportData.length}</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemLabel}>Total Revenue</Text>
                <Text style={[styles.summaryItemValue, styles.revenueValue]}>
                  {calculateTotalRevenue()} RWF
                </Text>
              </View>
            </View>
          </View>
        )}
        
        <View style={styles.reportListSection}>
          <Text style={styles.reportListTitle}>
            {reportType === 'entry' ? 'Car Entries' : 'Car Exits'} ({reportData.length})
          </Text>
          
          {reportData.length > 0 ? (
            reportData.map(entry => (
              <CarEntryCard key={entry.id} carEntry={entry} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No data found for the selected period</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {showDatePicker && (
        <View style={styles.datePickerContainer}>
          <View style={styles.datePickerHeader}>
            <Text style={styles.datePickerTitle}>
              Select {selectedDateType === 'start' ? 'Start' : 'End'} Date
            </Text>
            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
              <Text style={styles.datePickerCloseButton}>Close</Text>
            </TouchableOpacity>
          </View>
          
          {/* This would be a full date picker component in a real app */}
          <View style={styles.datePickerPlaceholder}>
            <Text style={styles.datePickerPlaceholderText}>
              Date picker would be implemented here with a real component.
            </Text>
            <View style={styles.datePickerPlaceholderButtons}>
              <Button
                title="Previous Day"
                onPress={() => {
                  const newDate = new Date(selectedDateType === 'start' ? startDate : endDate);
                  newDate.setDate(newDate.getDate() - 1);
                  if (selectedDateType === 'start') {
                    setStartDate(newDate);
                  } else {
                    setEndDate(newDate);
                  }
                }}
                type="secondary"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Next Day"
                onPress={() => {
                  const newDate = new Date(selectedDateType === 'start' ? startDate : endDate);
                  newDate.setDate(newDate.getDate() + 1);
                  if (selectedDateType === 'start') {
                    setStartDate(newDate);
                  } else {
                    setEndDate(newDate);
                  }
                }}
                type="secondary"
                style={{ flex: 1 }}
              />
            </View>
            <Button
              title="Confirm Selection"
              onPress={() => setShowDatePicker(false)}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  contentContainer: {
    padding: 16,
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  dateFilterContainer: {
    marginBottom: 16,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9F9F9',
    flex: 1,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  dateRangeSeparator: {
    marginHorizontal: 8,
    color: '#666',
  },
  typeFilterContainer: {
    marginBottom: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentedControlOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  segmentedControlOptionActive: {
    backgroundColor: '#3071E8',
  },
  segmentedControlOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666',
  },
  segmentedControlOptionTextActive: {
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  summaryCardHeader: {
    backgroundColor: '#3071E8',
    padding: 16,
  },
  summaryCardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  summaryCardContent: {
    padding: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryItemLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
  },
  summaryItemValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#333',
  },
  revenueValue: {
    color: '#2CC069',
  },
  reportListSection: {
    marginBottom: 24,
  },
  reportListTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#333',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
  },
  datePickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  datePickerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#333',
  },
  datePickerCloseButton: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#3071E8',
  },
  datePickerPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
  },
  datePickerPlaceholderText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  datePickerPlaceholderButtons: {
    flexDirection: 'row',
    width: '100%',
  },
});