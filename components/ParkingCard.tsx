import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Clock, Car } from 'lucide-react-native';
import { Parking } from '@/services/parkingService';

type ParkingCardProps = {
  parking: Parking;
  onPress?: () => void;
};

const ParkingCard = ({ parking, onPress }: ParkingCardProps) => {
  const availabilityPercentage = (parking.availableSpaces / parking.totalSpaces) * 100;
  
  let availabilityColor = '#2CC069'; // Green for good availability
  if (availabilityPercentage < 20) {
    availabilityColor = '#E84C3D'; // Red for low availability
  } else if (availabilityPercentage < 50) {
    availabilityColor = '#F39C12'; // Orange for medium availability
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.name}>{parking.name}</Text>
        <View style={[styles.badge, { backgroundColor: availabilityColor }]}>
          <Text style={styles.badgeText}>
            {availabilityPercentage < 10 ? 'Almost Full' : `${parking.availableSpaces} Available`}
          </Text>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <MapPin size={16} color="#666" />
        <Text style={styles.infoText}>{parking.location}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Clock size={16} color="#666" />
        <Text style={styles.infoText}>{parking.feePerHour} RWF/hour</Text>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.capacityContainer}>
          <Car size={16} color="#666" />
          <Text style={styles.capacityText}>
            {parking.availableSpaces} / {parking.totalSpaces} spaces
          </Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${(parking.availableSpaces / parking.totalSpaces) * 100}%`,
                backgroundColor: availabilityColor
              }
            ]} 
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  footer: {
    marginTop: 8,
  },
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  capacityText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});

export default ParkingCard;