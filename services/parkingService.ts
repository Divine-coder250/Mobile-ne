import { mockApi } from './api';

// Types
export type Parking = {
  id: string;
  code: string;
  name: string;
  totalSpaces: number;
  availableSpaces: number;
  location: string;
  feePerHour: number;
};

export type CarEntry = {
  id: string;
  plateNumber: string;
  parkingCode: string;
  entryDateTime: string;
  exitDateTime: string | null;
  chargedAmount: number;
};

// Mock data
const mockParkings: Parking[] = [
  {
    id: '1',
    code: 'PKG001',
    name: 'Downtown Parking',
    totalSpaces: 100,
    availableSpaces: 65,
    location: 'Kigali City Center',
    feePerHour: 500
  },
  {
    id: '2',
    code: 'PKG002',
    name: 'Airport Parking',
    totalSpaces: 200,
    availableSpaces: 120,
    location: 'Kigali International Airport',
    feePerHour: 800
  },
  {
    id: '3',
    code: 'PKG003',
    name: 'Shopping Mall Parking',
    totalSpaces: 150,
    availableSpaces: 30,
    location: 'Kigali Heights',
    feePerHour: 600
  }
];

const mockCarEntries: CarEntry[] = [
  {
    id: '1',
    plateNumber: 'RAA123B',
    parkingCode: 'PKG001',
    entryDateTime: '2023-06-01T08:00:00Z',
    exitDateTime: '2023-06-01T10:30:00Z',
    chargedAmount: 1250
  },
  {
    id: '2',
    plateNumber: 'RAB456C',
    parkingCode: 'PKG002',
    entryDateTime: '2023-06-01T09:15:00Z',
    exitDateTime: null,
    chargedAmount: 0
  },
  {
    id: '3',
    plateNumber: 'RAC789D',
    parkingCode: 'PKG001',
    entryDateTime: '2023-06-01T11:00:00Z',
    exitDateTime: '2023-06-01T14:45:00Z',
    chargedAmount: 1875
  }
];

// API Functions
export const getParkings = async (): Promise<Parking[]> => {
  try {
    // In a real app, this would be an API call
    // const response = await mockApi.get('/parkings');
    // return response.data;
    
    // For mock purposes
    return mockParkings;
  } catch (error) {
    console.error('Error fetching parkings:', error);
    throw error;
  }
};

export const getParkingById = async (id: string): Promise<Parking> => {
  try {
    // In a real app, this would be an API call
    // const response = await mockApi.get(`/parkings/${id}`);
    // return response.data;
    
    // For mock purposes
    const parking = mockParkings.find(p => p.id === id);
    if (!parking) throw new Error('Parking not found');
    return parking;
  } catch (error) {
    console.error(`Error fetching parking with id ${id}:`, error);
    throw error;
  }
};

export const createParking = async (parking: Omit<Parking, 'id'>): Promise<Parking> => {
  try {
    // In a real app, this would be an API call
    // const response = await mockApi.post('/parkings', parking);
    // return response.data;
    
    // For mock purposes
    const newParking = {
      ...parking,
      id: `${mockParkings.length + 1}`
    };
    mockParkings.push(newParking as Parking);
    return newParking as Parking;
  } catch (error) {
    console.error('Error creating parking:', error);
    throw error;
  }
};

export const getCarEntries = async (): Promise<CarEntry[]> => {
  try {
    // In a real app, this would be an API call
    // const response = await mockApi.get('/car-entries');
    // return response.data;
    
    // For mock purposes
    return mockCarEntries;
  } catch (error) {
    console.error('Error fetching car entries:', error);
    throw error;
  }
};

export const getCarEntriesByDateRange = async (startDate: string, endDate: string): Promise<CarEntry[]> => {
  try {
    // In a real app, this would be an API call
    // const response = await mockApi.get(`/car-entries?startDate=${startDate}&endDate=${endDate}`);
    // return response.data;
    
    // For mock purposes
    return mockCarEntries.filter(entry => {
      const entryDate = new Date(entry.entryDateTime);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return entryDate >= start && entryDate <= end;
    });
  } catch (error) {
    console.error('Error fetching car entries by date range:', error);
    throw error;
  }
};

export const createCarEntry = async (plateNumber: string, parkingCode: string): Promise<CarEntry> => {
  try {
    // In a real app, this would be an API call
    // const response = await mockApi.post('/car-entries', { plateNumber, parkingCode });
    // return response.data;
    
    // For mock purposes
    // First, update available spaces in the parking
    const parking = mockParkings.find(p => p.code === parkingCode);
    if (!parking) throw new Error('Parking not found');
    if (parking.availableSpaces <= 0) throw new Error('No available spaces');
    
    parking.availableSpaces -= 1;
    
    const newEntry: CarEntry = {
      id: `${mockCarEntries.length + 1}`,
      plateNumber,
      parkingCode,
      entryDateTime: new Date().toISOString(),
      exitDateTime: null,
      chargedAmount: 0
    };
    
    mockCarEntries.push(newEntry);
    return newEntry;
  } catch (error) {
    console.error('Error creating car entry:', error);
    throw error;
  }
};

export const recordCarExit = async (id: string): Promise<CarEntry> => {
  try {
    // In a real app, this would be an API call
    // const response = await mockApi.put(`/car-entries/${id}/exit`);
    // return response.data;
    
    // For mock purposes
    const entry = mockCarEntries.find(e => e.id === id);
    if (!entry) throw new Error('Car entry not found');
    if (entry.exitDateTime) throw new Error('Car has already exited');
    
    // Calculate charged amount based on time spent
    const entryTime = new Date(entry.entryDateTime);
    const exitTime = new Date();
    const hoursSpent = (exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60);
    
    // Get parking fee per hour
    const parking = mockParkings.find(p => p.code === entry.parkingCode);
    if (!parking) throw new Error('Parking not found');
    
    // Update the entry
    entry.exitDateTime = exitTime.toISOString();
    entry.chargedAmount = Math.ceil(hoursSpent) * parking.feePerHour;
    
    // Update available spaces in the parking
    parking.availableSpaces += 1;
    
    return entry;
  } catch (error) {
    console.error('Error recording car exit:', error);
    throw error;
  }
};

export const generateReport = async (startDate: string, endDate: string, type: 'entry' | 'exit'): Promise<CarEntry[]> => {
  try {
    // In a real app, this would be an API call
    // const response = await mockApi.get(`/reports?startDate=${startDate}&endDate=${endDate}&type=${type}`);
    // return response.data;
    
    // For mock purposes
    if (type === 'entry') {
      return mockCarEntries.filter(entry => {
        const entryDate = new Date(entry.entryDateTime);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return entryDate >= start && entryDate <= end;
      });
    } else { // exit
      return mockCarEntries.filter(entry => {
        if (!entry.exitDateTime) return false;
        const exitDate = new Date(entry.exitDateTime);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return exitDate >= start && exitDate <= end;
      });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};