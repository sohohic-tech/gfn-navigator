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
  dailyRecord?: Record<string, string[]>;
}

interface UserContextType {
  userData: UserData;
  completeTraining: (videoId: string) => void;
  toggleFavoriteTrainer: (trainerId: string, trainerName?: string) => void;
  unlockFullLibrary: () => void;
  setLanguage: (lang: Language) => void;
  updateUserName: (name: string) => void;
  undoTraining: (videoId: string, dateStr?: string) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'gfn_user_data_v4';

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
  dailyRecord: {},
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: If favoriteTrainers is still a string array (from old version), convert to object array
        if (parsed.favoriteTrainers && parsed.favoriteTrainers.length > 0 && typeof parsed.favoriteTrainers[0] === 'string') {
          parsed.favoriteTrainers = parsed.favoriteTrainers.map((id: string) => ({ id, name: id }));
        }
        setUserData(parsed);
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
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

  return (
    <UserContext.Provider value={{ userData, completeTraining, toggleFavoriteTrainer, unlockFullLibrary, setLanguage, updateUserName, undoTraining, isLoading }}>
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
