import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { getParkings, getCarEntries, Parking, CarEntry } from '@/services/parkingService';
import ParkingCard from '@/components/ParkingCard';
import CarEntryCard from '@/components/CarEntryCard';
import { Car, MapPin, Clock } from 'lucide-react-native';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [activeEntries, setActiveEntries] = useState<CarEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const parkingsData = await getParkings();
      const entriesData = await getCarEntries();
      
      // Filter active entries (no exit time)
      const activeEntriesData = entriesData.filter(entry => entry.exitDateTime === null);
      
      setParkings(parkingsData);
      setActiveEntries(activeEntriesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Handle error
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3071E8" />
      </View>
    );
  }

  // Calculate total spaces and available spaces
  const totalSpaces = parkings.reduce((sum, parking) => sum + parking.totalSpaces, 0);
  const availableSpaces = parkings.reduce((sum, parking) => sum + parking.availableSpaces, 0);
  const occupancyRate = totalSpaces > 0 ? ((totalSpaces - availableSpaces) / totalSpaces) * 100 : 0;

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3071E8']} />
      }
    >
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <MapPin size={24} color="#3071E8" />
          </View>
          <View>
            <Text style={styles.statTitle}>Total Locations</Text>
            <Text style={styles.statValue}>{parkings.length}</Text>
          </View>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Car size={24} color="#2CC069" />
          </View>
          <View>
            <Text style={styles.statTitle}>Available Spaces</Text>
            <Text style={styles.statValue}>{availableSpaces} / {totalSpaces}</Text>
          </View>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Clock size={24} color="#F39C12" />
          </View>
          <View>
            <Text style={styles.statTitle}>Occupancy Rate</Text>
            <Text style={styles.statValue}>{occupancyRate.toFixed(1)}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Parking Sessions</Text>
        {activeEntries.length > 0 ? (
          activeEntries.map(entry => (
            <CarEntryCard key={entry.id} carEntry={entry} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No active parking sessions</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parking Locations</Text>
        {parkings.map(parking => (
          <ParkingCard key={parking.id} parking={parking} />
        ))}
      </View>
    </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
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
});