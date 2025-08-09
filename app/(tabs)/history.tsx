import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Clock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { FirestoreService } from '@/services/FirestoreService';

interface CheckInRecord {
  id: string;
  timestamp: Date;
  latitude: number;
  longitude: number;
  address?: string;
}

export default function HistoryScreen() {
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCheckIns();
    }
  }, [user]);

  const loadCheckIns = async () => {
    if (!user) return;
    
    try {
      const records = await FirestoreService.getCheckIns(user.uid);
      setCheckIns(records);
    } catch (error) {
      console.error('Error loading check-ins:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCheckIns();
    setRefreshing(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const renderCheckInItem = ({ item }: { item: CheckInRecord }) => (
    <View style={styles.checkInItem}>
      <View style={styles.checkInHeader}>
        <View style={styles.iconContainer}>
          <MapPin size={20} color="#000000" />
        </View>
        <View style={styles.checkInInfo}>
          <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
          <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
        </View>
      </View>
      
      <View style={styles.locationInfo}>
        <Text style={styles.coordinatesText}>
          {formatCoordinates(item.latitude, item.longitude)}
        </Text>
        {item.address && (
          <Text style={styles.addressText}>{item.address}</Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading check-in history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Check-In History</Text>
        <Text style={styles.subtitle}>
          Your attendance records with location data
        </Text>
      </View>

      {checkIns.length === 0 ? (
        <View style={styles.centerContent}>
          <Clock size={60} color="#666666" />
          <Text style={styles.emptyTitle}>No Check-ins Yet</Text>
          <Text style={styles.emptyText}>
            Your check-in history will appear here once you start recording attendance.
          </Text>
        </View>
      ) : (
        <FlatList
          data={checkIns}
          renderItem={renderCheckInItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContainer: {
    padding: 24,
    paddingTop: 8,
  },
  checkInItem: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  checkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  checkInInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  timeText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  locationInfo: {
    marginLeft: 32,
  },
  coordinatesText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#000000',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
});