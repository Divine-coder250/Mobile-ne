import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, RefreshControl, Alert } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { getParkings, createCarEntry, recordCarExit, getCarEntries, Parking, CarEntry, createParking } from '@/services/parkingService';
import ParkingCard from '@/components/ParkingCard';
import CarEntryCard from '@/components/CarEntryCard';
import Button from '@/components/Button';
import InputField from '@/components/InputField';
import { Plus, X, ArrowLeft } from 'lucide-react-native';

export default function ParkingScreen() {
  const { user } = useAuth();
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [carEntries, setCarEntries] = useState<CarEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Options Modal State
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  
  // Entry Form State
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [plateNumber, setPlateNumber] = useState('');
  const [selectedParkingCode, setSelectedParkingCode] = useState('');
  
  // Parking Form State
  const [showParkingForm, setShowParkingForm] = useState(false);
  const [parkingCode, setParkingCode] = useState('');
  const [parkingName, setParkingName] = useState('');
  const [totalSpaces, setTotalSpaces] = useState('');
  const [location, setLocation] = useState('');
  const [feePerHour, setFeePerHour] = useState('');
  const [parkingErrors, setParkingErrors] = useState({
    code: '',
    name: '',
    totalSpaces: '',
    location: '',
    feePerHour: '',
  });
  
  // Exit Form State
  const [showExitForm, setShowExitForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<CarEntry | null>(null);
  
  // Details Modal State
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsEntry, setDetailsEntry] = useState<CarEntry | null>(null);

  const fetchData = async () => {
    try {
      const parkingsData = await getParkings();
      const entriesData = await getCarEntries();
      
      const sortedEntries = [...entriesData].sort((a, b) => {
        if (a.exitDateTime === null && b.exitDateTime !== null) return -1;
        if (a.exitDateTime !== null && b.exitDateTime === null) return 1;
        return new Date(b.entryDateTime).getTime() - new Date(a.entryDateTime).getTime();
      });
      
      setParkings(parkingsData);
      setCarEntries(sortedEntries);
    } catch (error) {
      console.error('Error fetching parking data:', error);
      Alert.alert('Error', 'Failed to load parking data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const handleEntrySubmit = async () => {
    if (!plateNumber.trim()) {
      Alert.alert('Error', 'Please enter a plate number');
      return;
    }
    
    if (!selectedParkingCode) {
      Alert.alert('Error', 'Please select a parking location');
      return;
    }
    
    try {
      await createCarEntry(plateNumber, selectedParkingCode);
      setShowEntryForm(false);
      setPlateNumber('');
      setSelectedParkingCode('');
      await fetchData();
      Alert.alert('Success', 'Car entry recorded successfully');
    } catch (error) {
      console.error('Error recording car entry:', error);
      Alert.alert('Error', 'Failed to record car entry');
    }
  };

  const validateParkingForm = () => {
    let valid = true;
    const newErrors = {
      code: '',
      name: '',
      totalSpaces: '',
      location: '',
      feePerHour: '',
    };

    if (!parkingCode.trim()) {
      newErrors.code = 'Parking code is required';
      valid = false;
    }

    if (!parkingName.trim()) {
      newErrors.name = 'Parking name is required';
      valid = false;
    }

    if (!totalSpaces.trim()) {
      newErrors.totalSpaces = 'Total spaces are required';
      valid = false;
    } else if (isNaN(Number(totalSpaces)) || Number(totalSpaces) <= 0) {
      newErrors.totalSpaces = 'Total spaces must be a positive number';
      valid = false;
    }

    if (!location.trim()) {
      newErrors.location = 'Location is required';
      valid = false;
    }

    if (!feePerHour.trim()) {
      newErrors.feePerHour = 'Fee per hour is required';
      valid = false;
    } else if (isNaN(Number(feePerHour)) || Number(feePerHour) <= 0) {
      newErrors.feePerHour = 'Fee per hour must be a positive number';
      valid = false;
    }

    setParkingErrors(newErrors);
    return valid;
  };

  const handleParkingSubmit = async () => {
    if (validateParkingForm()) {
      try {
        const newParking = {
          code: parkingCode,
          name: parkingName,
          totalSpaces: Number(totalSpaces),
          availableSpaces: Number(totalSpaces),
          location,
          feePerHour: Number(feePerHour),
        };
        await createParking(newParking);
        setShowParkingForm(false);
        setParkingCode('');
        setParkingName('');
        setTotalSpaces('');
        setLocation('');
        setFeePerHour('');
        setParkingErrors({ code: '', name: '', totalSpaces: '', location: '', feePerHour: '' });
        await fetchData();
        Alert.alert('Success', 'Parking location created successfully');
      } catch (error) {
        console.error('Error creating parking:', error);
        Alert.alert('Error', 'Failed to create parking location');
      }
    } else {
      Alert.alert('Validation Error', 'Please correct the errors in the form.');
    }
  };

  const handleExitSubmit = async () => {
    if (!selectedEntry) return;
    
    try {
      await recordCarExit(selectedEntry.id);
      setShowExitForm(false);
      setSelectedEntry(null);
      await fetchData();
      Alert.alert('Success', 'Car exit recorded successfully');
    } catch (error) {
      console.error('Error recording car exit:', error);
      Alert.alert('Error', 'Failed to record car exit');
    }
  };

  const handleEntryPress = (entry: CarEntry) => {
    if (entry.exitDateTime === null) {
      setSelectedEntry(entry);
      setShowExitForm(true);
    } else {
      setDetailsEntry(entry);
      setShowDetailsModal(true);
    }
  };

  const renderOptionsModal = () => (
    <Modal
      visible={showOptionsModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowOptionsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.optionsModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select an Action</Text>
            <TouchableOpacity onPress={() => setShowOptionsModal(false)}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              setShowOptionsModal(false);
              setShowEntryForm(true);
            }}
          >
            <Text style={styles.optionText}>Create Car Entry</Text>
          </TouchableOpacity>
          {user?.role === 'admin' && (
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                setShowOptionsModal(false);
                setShowParkingForm(true);
              }}
            >
              <Text style={styles.optionText}>Create Parking</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderEntryForm = () => (
    <Modal
      visible={showEntryForm}
      transparent
      animationType="slide"
      onRequestClose={() => setShowEntryForm(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Record Car Entry</Text>
            <TouchableOpacity onPress={() => setShowEntryForm(false)}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <InputField
            label="Plate Number"
            value={plateNumber}
            onChangeText={setPlateNumber}
            placeholder="e.g., RAA123B"
            autoCapitalize="characters"
          />
          
          <Text style={styles.label}>Select Parking Location</Text>
          <ScrollView style={styles.parkingListContainer}>
            {parkings.map(parking => (
              <TouchableOpacity
                key={parking.id}
                style={[
                  styles.parkingSelectItem,
                  selectedParkingCode === parking.code && styles.parkingSelectItemActive,
                  parking.availableSpaces === 0 && styles.parkingSelectItemDisabled,
                ]}
                onPress={() => setSelectedParkingCode(parking.code)}
                disabled={parking.availableSpaces === 0}
              >
                <View>
                  <Text style={styles.parkingSelectName}>{parking.name}</Text>
                  <Text style={styles.parkingSelectInfo}>
                    {parking.availableSpaces} spaces available • {parking.feePerHour} RWF/hour
                  </Text>
                </View>
                {selectedParkingCode === parking.code && (
                  <View style={styles.parkingSelectCheck} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              onPress={() => setShowEntryForm(false)}
              type="secondary"
              style={styles.actionButton}
            />
            <Button
              title="Record Entry"
              onPress={handleEntrySubmit}
              style={styles.actionButton}
              disabled={!plateNumber.trim() || !selectedParkingCode}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderParkingForm = () => (
    <Modal
      visible={showParkingForm}
      transparent
      animationType="slide"
      onRequestClose={() => setShowParkingForm(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Parking Location</Text>
            <TouchableOpacity onPress={() => setShowParkingForm(false)}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formScroll}>
            <View style={styles.formContent}>
              <InputField
                label="Parking Code"
                value={parkingCode}
                onChangeText={setParkingCode}
                placeholder="e.g., PKG004"
                error={parkingErrors.code}
                autoCapitalize="characters"
              />
              
              <InputField
                label="Parking Name"
                value={parkingName}
                onChangeText={setParkingName}
                placeholder="e.g., City Mall Parking"
                error={parkingErrors.name}
                autoCapitalize="words"
              />
              
              <InputField
                label="Total Spaces"
                value={totalSpaces}
                onChangeText={setTotalSpaces}
                placeholder="e.g., 50"
                keyboardType="numeric"
                error={parkingErrors.totalSpaces}
              />
              
              <InputField
                label="Location"
                value={location}
                onChangeText={setLocation}
                placeholder="e.g., Downtown Kigali"
                error={parkingErrors.location}
                autoCapitalize="words"
              />
              
              <InputField
                label="Fee Per Hour (RWF)"
                value={feePerHour}
                onChangeText={setFeePerHour}
                placeholder="e.g., 700"
                keyboardType="numeric"
                error={parkingErrors.feePerHour}
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              onPress={() => setShowParkingForm(false)}
              type="secondary"
              style={styles.actionButton}
            />
            <Button
              title="Create Parking"
              onPress={handleParkingSubmit}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderExitForm = () => (
    <Modal
      visible={showExitForm}
      transparent
      animationType="slide"
      onRequestClose={() => setShowExitForm(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Record Car Exit</Text>
            <TouchableOpacity onPress={() => setShowExitForm(false)}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {selectedEntry && (
            <ScrollView style={styles.formScroll}>
              <View style={styles.exitFormContent}>
                <View style={styles.plateContainer}>
                  <Text style={styles.plateLabel}>Plate Number</Text>
                  <Text style={styles.plateNumber}>{selectedEntry.plateNumber}</Text>
                </View>
                
                <View style={styles.entryInfoContainer}>
                  <Text style={styles.entryInfoLabel}>Entry Time</Text>
                  <Text style={styles.entryInfoValue}>
                    {new Date(selectedEntry.entryDateTime).toLocaleString()}
                  </Text>
                </View>
                
                <View style={styles.entryInfoContainer}>
                  <Text style={styles.entryInfoLabel}>Parking Location</Text>
                  <Text style={styles.entryInfoValue}>
                    {parkings.find(p => p.code === selectedEntry.parkingCode)?.name || selectedEntry.parkingCode}
                  </Text>
                </View>
                
                <View style={styles.estimateContainer}>
                  <Text style={styles.estimateLabel}>Estimated Fee</Text>
                  <Text style={styles.estimateValue}>
                    {(() => {
                      const parking = parkings.find(p => p.code === selectedEntry.parkingCode);
                      if (!parking) return 'N/A';
                      
                      const entryTime = new Date(selectedEntry.entryDateTime);
                      const currentTime = new Date();
                      const hoursSpent = (currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60);
                      
                      return `${Math.ceil(hoursSpent) * parking.feePerHour} RWF`;
                    })()}
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}
          
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              onPress={() => setShowExitForm(false)}
              type="secondary"
              style={styles.actionButton}
            />
            <Button
              title="Record Exit"
              onPress={handleExitSubmit}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
  
  const renderDetailsModal = () => (
    <Modal
      visible={showDetailsModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowDetailsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Parking Details</Text>
            <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {detailsEntry && (
            <ScrollView style={styles.formScroll}>
              <View style={styles.detailsContent}>
                <View style={styles.plateContainer}>
                  <Text style={styles.plateLabel}>Plate Number</Text>
                  <Text style={styles.plateNumber}>{detailsEntry.plateNumber}</Text>
                </View>
                
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Parking Information</Text>
                  
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Parking Location</Text>
                    <Text style={styles.detailsValue}>
                      {parkings.find(p => p.code === detailsEntry.parkingCode)?.name || detailsEntry.parkingCode}
                    </Text>
                  </View>
                  
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Entry Time</Text>
                    <Text style={styles.detailsValue}>
                      {new Date(detailsEntry.entryDateTime).toLocaleString()}
                    </Text>
                  </View>
                  
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Exit Time</Text>
                    <Text style={styles.detailsValue}>
                      {detailsEntry.exitDateTime 
                        ? new Date(detailsEntry.exitDateTime).toLocaleString() 
                        : 'N/A'}
                    </Text>
                  </View>
                  
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Duration</Text>
                    <Text style={styles.detailsValue}>
                      {(() => {
                        if (!detailsEntry.exitDateTime) return 'N/A';
                        
                        const entryTime = new Date(detailsEntry.entryDateTime);
                        const exitTime = new Date(detailsEntry.exitDateTime);
                        const durationMs = exitTime.getTime() - entryTime.getTime();
                        
                        const hours = Math.floor(durationMs / (1000 * 60 * 60));
                        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                        
                        return `${hours}h ${minutes}m`;
                      })()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Payment Details</Text>
                  
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Amount Charged</Text>
                    <Text style={[styles.detailsValue, styles.amountValue]}>
                      {detailsEntry.chargedAmount} RWF
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
          
          <View style={styles.modalActions}>
            <Button
              title="Close"
              onPress={() => setShowDetailsModal(false)}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3071E8']} />
        }
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Parking</Text>
          </View>
          
          {parkings.map(parking => (
            <ParkingCard key={parking.id} parking={parking} />
          ))}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Entries</Text>
          </View>
          
          {carEntries.slice(0, 5).map(entry => (
            <CarEntryCard
              key={entry.id}
              carEntry={entry}
              onPress={() => handleEntryPress(entry)}
            />
          ))}
        </View>
      </ScrollView>
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowOptionsModal(true)}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      {renderOptionsModal()}
      {renderEntryForm()}
      {renderParkingForm()}
      {renderExitForm()}
      {renderDetailsModal()}
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#333',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#3071E8',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
    justifyContent: 'space-between',
  },
  optionsModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  optionButton: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 16,
    color: '#3071E8',
    fontWeight: '500',
  },
  formScroll: {
    maxHeight: '60%',
  },
  formContent: {
    marginBottom: 16,
  },
  exitFormContent: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  parkingListContainer: {
    maxHeight: 200,
    marginBottom: 16,
  },
  parkingSelectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 8,
  },
  parkingSelectItemActive: {
    borderColor: '#3071E8',
    backgroundColor: 'rgba(48, 113, 232, 0.05)',
  },
  parkingSelectItemDisabled: {
    opacity: 0.5,
  },
  parkingSelectName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  parkingSelectInfo: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
  },
  parkingSelectCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3071E8',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  detailsContent: {
    marginBottom: 16,
  },
  plateContainer: {
    backgroundColor: '#F5F7FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  plateLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  plateNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#333',
  },
  entryInfoContainer: {
    marginBottom: 16,
  },
  entryInfoLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  entryInfoValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#333',
  },
  estimateContainer: {
    backgroundColor: '#EFF8FF',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  estimateLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#3071E8',
    marginBottom: 4,
  },
  estimateValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#3071E8',
  },
  detailsSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  detailsSectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailsLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailsValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  amountValue: {
    fontFamily: 'Inter-Bold',
    color: '#2CC069',
  },
});