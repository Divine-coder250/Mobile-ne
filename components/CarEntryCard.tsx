import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Car, Calendar, CreditCard } from 'lucide-react-native';
import { CarEntry } from '@/services/parkingService';

type CarEntryCardProps = {
  carEntry: CarEntry;
  onPress?: () => void;
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const CarEntryCard = ({ carEntry, onPress }: CarEntryCardProps) => {
  const isActive = !carEntry.exitDateTime;

  return (
    <TouchableOpacity 
      style={[styles.card, isActive ? styles.activeCard : {}]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.plateContainer}>
          <Text style={styles.plateNumber}>{carEntry.plateNumber}</Text>
        </View>
        {isActive ? (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Active</Text>
          </View>
        ) : (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>Completed</Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoRow}>
        <Car size={16} color="#666" />
        <Text style={styles.infoText}>Parking: {carEntry.parkingCode}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Calendar size={16} color="#666" />
        <Text style={styles.infoText}>Entry: {formatDate(carEntry.entryDateTime)}</Text>
      </View>
      
      {carEntry.exitDateTime && (
        <View style={styles.infoRow}>
          <Calendar size={16} color="#666" />
          <Text style={styles.infoText}>Exit: {formatDate(carEntry.exitDateTime)}</Text>
        </View>
      )}
      
      {carEntry.exitDateTime && (
        <View style={styles.footer}>
          <View style={styles.amountContainer}>
            <CreditCard size={16} color="#666" />
            <Text style={styles.amountText}>
              Total charged: <Text style={styles.amount}>{carEntry.chargedAmount} RWF</Text>
            </Text>
          </View>
        </View>
      )}
      
      {isActive && (
        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Clock size={16} color="#666" />
            <Text style={styles.timeText}>
              Ongoing session
            </Text>
          </View>
        </View>
      )}
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
  activeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3071E8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  plateContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
  },
  plateNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#3071E8',
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#2CC069',
  },
  completedBadgeText: {
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
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  amount: {
    fontWeight: '600',
    color: '#333',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#3071E8',
    fontWeight: '500',
  },
});

export default CarEntryCard;