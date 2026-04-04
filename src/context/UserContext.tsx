'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ja' | 'en';

interface TrainerSubscription {
  id: string;
  name: string;
}

interface UserData {
  completedVideoIds: string[];
  totalStamps: number;
  streak: number;
  lastTrainingDate: string | null;
  completedDates: string[];
  favoriteTrainers: TrainerSubscription[]; // List of Trainer objects
  language: Language;
  isFullLibraryUnlocked: boolean; // Flag for Ad Reward
  userName: string;
  aiStamina: number; // AI Request Credits
  aiStaminaExpiresAt: string | null; // Date (YYYY-MM-DD)
  dailyRecord?: Record<string, string[]>;
  fitnessProfile?: {
    goals: string[];
    focusAreas: string[];
    frequency: string;
    duration: string;
  };
}

interface UserContextType {
  userData: UserData;
  completeTraining: (videoId: string) => void;
  toggleFavoriteTrainer: (trainerId: string, trainerName?: string) => void;
  unlockFullLibrary: () => void;
  consumeAiStamina: () => void;
  rechargeAiStamina: () => void;
  setLanguage: (lang: Language) => void;
  updateUserName: (name: string) => void;
  updateFitnessProfile: (profile: any) => void;
  undoTraining: (videoId: string, dateStr?: string) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'gfn_user_data_v5';

const DEFAULT_DATA: UserData = {
  completedVideoIds: [],
  totalStamps: 0,
  streak: 0,
  lastTrainingDate: null,
  completedDates: [],
  favoriteTrainers: [],
  language: 'ja',
  isFullLibraryUnlocked: false,
  userName: 'GUEST',
  aiStamina: 3,
  aiStaminaExpiresAt: null, // Set on first load
  dailyRecord: {},
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: If favoriteTrainers is still a string array (from old version), convert to object array
        if (parsed.favoriteTrainers && parsed.favoriteTrainers.length > 0 && typeof parsed.favoriteTrainers[0] === 'string') {
          parsed.favoriteTrainers = parsed.favoriteTrainers.map((id: string) => ({ id, name: id }));
        }

        // Migration: Set initial expiry if newly added
        if (parsed.aiStaminaExpiresAt === undefined) {
           const d = new Date();
           d.setDate(d.getDate() + 7);
           parsed.aiStaminaExpiresAt = d.toISOString().split('T')[0];
        }

        // Check Expiry
        if (parsed.aiStamina > 0 && parsed.aiStaminaExpiresAt && today > parsed.aiStaminaExpiresAt) {
           console.log("AI Stamina expired.");
           parsed.aiStamina = 0;
        }

        setUserData(parsed);
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    } else {
       // First Time Setup Expiry
       const d = new Date();
       d.setDate(d.getDate() + 7);
       const initialExpiry = d.toISOString().split('T')[0];
       setUserData(prev => ({ ...prev, aiStaminaExpiresAt: initialExpiry }));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    }
  }, [userData, isLoading]);

  const completeTraining = (videoId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setUserData(prev => {
      const isAlreadyDoneToday = prev.completedDates.includes(today);
      const isNewVideo = !prev.completedVideoIds.includes(videoId);
      const newCompletedDates = isAlreadyDoneToday ? prev.completedDates : [...prev.completedDates, today];
      const newCompletedVideoIds = isNewVideo ? [...prev.completedVideoIds, videoId] : prev.completedVideoIds;
      const newTotalStamps = prev.totalStamps + 1;
      let newStreak = prev.streak;
      if (!isAlreadyDoneToday) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (prev.lastTrainingDate?.startsWith(yesterdayStr)) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }
      return {
        ...prev,
        completedVideoIds: newCompletedVideoIds,
        completedDates: newCompletedDates,
        totalStamps: newTotalStamps,
        streak: newStreak,
        lastTrainingDate: new Date().toISOString(),
        dailyRecord: {
          ...(prev.dailyRecord || {}),
          [today]: [...(prev.dailyRecord?.[today] || []), videoId].filter((v, i, a) => a.indexOf(v) === i)
        }
      };
    });
  };

  const toggleFavoriteTrainer = (trainerId: string, trainerName: string = "Unknown Trainer") => {
    setUserData(prev => {
      const isFav = prev.favoriteTrainers.some(t => t.id === trainerId);
      return {
        ...prev,
        favoriteTrainers: isFav 
          ? prev.favoriteTrainers.filter(t => t.id !== trainerId)
          : [...prev.favoriteTrainers, { id: trainerId, name: trainerName }]
      };
    });
  };

  const unlockFullLibrary = () => {
    setUserData(prev => ({ ...prev, isFullLibraryUnlocked: true }));
  };

  const setLanguage = (lang: Language) => {
    setUserData(prev => ({ ...prev, language: lang }));
  };

  const updateUserName = (name: string) => {
    setUserData(prev => ({ ...prev, userName: name }));
  };

  const undoTraining = (videoId: string, dateStr?: string) => {
    const today = dateStr || new Date().toISOString().split('T')[0];
    setUserData(prev => {
      const newVideoIds = prev.completedVideoIds.filter(id => id !== videoId);
      const newDailyRecord = { ...prev.dailyRecord || {} };
      if (newDailyRecord[today]) {
        newDailyRecord[today] = newDailyRecord[today].filter(id => id !== videoId);
        if (newDailyRecord[today].length === 0) delete newDailyRecord[today];
      }
      // If no videos left for that date, remove date from list
      const newCompletedDates = (newDailyRecord[today]?.length || 0) > 0 
        ? prev.completedDates 
        : prev.completedDates.filter(d => d !== today);

      return {
        ...prev,
        completedVideoIds: newVideoIds,
        dailyRecord: newDailyRecord,
        completedDates: newCompletedDates,
        totalStamps: Math.max(0, prev.totalStamps - 1),
      };
    });
  };

  const updateFitnessProfile = (profile: any) => {
    setUserData(prev => ({ ...prev, fitnessProfile: profile }));
  };

  const consumeAiStamina = () => {
    setUserData(prev => ({ ...prev, aiStamina: Math.max(0, prev.aiStamina - 1) }));
  };

  const rechargeAiStamina = () => {
    setUserData(prev => ({ ...prev, aiStamina: 3 }));
  };

  return (
    <UserContext.Provider value={{ 
      userData, 
      completeTraining, 
      toggleFavoriteTrainer, 
      unlockFullLibrary, 
      consumeAiStamina,
      rechargeAiStamina,
      setLanguage, 
      updateUserName, 
      updateFitnessProfile,
      undoTraining, 
      isLoading 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
