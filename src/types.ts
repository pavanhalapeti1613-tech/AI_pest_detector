export interface PestDetection {
  id: string;
  detected: boolean;
  pest: string | null;
  confidence: number; // 0 - 100
  timestamp: string; // ISO string
  db_level: number; // decibels from INMP441
  frequency_hz: number; // dominant peak frequency
  device_id: string;
  battery_v?: number;
  acknowledged?: boolean;
  field_zone?: string;
  remedy?: string;
}

export interface PestInfo {
  id: string;
  commonName: string;
  scientificName: string;
  localFarmerName: string;
  targetCrops: string[];
  acousticProfile: {
    frequencyRange: string;
    soundType: string;
    description: string;
  };
  chemicalTreatments: {
    chemicalName: string;
    activeIngredient: string;
    recommendedDosage: string;
    applicationMethod: string;
    preHarvestInterval: string;
  }[];
  organicAlternatives: {
    methodName: string;
    materials: string;
    dosageOrSetup: string;
    applicationTiming: string;
  }[];
  sprayPrecautions: string[];
  identificationTips: string[];
  urgencyLevel: 'high' | 'critical' | 'moderate' | 'beneficial';
}

export interface ESP32Status {
  ipAddress: string;
  isOnline: boolean;
  isSimulated: boolean;
  lastSuccessfulPing: string | null;
  errorMessage: string | null;
  isPolling: boolean;
  batteryVoltage: number;
  micNoiseFloorDb: number;
}
