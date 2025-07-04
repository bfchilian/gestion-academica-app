import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { MoodRecord } from '../types/MoodRecord';

export const useMood = (userId: string, studentIds?: string[], selectedPeriod?: string) => {
  const [moodRecords, setMoodRecords] = useState<MoodRecord[]>([]);

  useEffect(() => {
    if (!userId) return;

    let q = query(collection(db, 'mood'), where('userId', '==', userId));

    if (studentIds && studentIds.length > 0) {
      q = query(q, where('studentId', 'in', studentIds));
    } else if (studentIds && studentIds.length === 0) {
      setMoodRecords([]);
      return;
    }

    if (selectedPeriod) {
      q = query(q, where('period', '==', selectedPeriod));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const recordsData: MoodRecord[] = [];
      querySnapshot.forEach((doc) => {
        recordsData.push({ ...doc.data(), id: doc.id } as MoodRecord);
      });
      setMoodRecords(recordsData);
    });

    return () => unsubscribe();
  }, [userId, studentIds, selectedPeriod]);

  const addMoodRecord = async (studentId: string, date: string, mood: number, notes?: string, period?: string) => {
    if (!userId) return;
    await addDoc(collection(db, 'mood'), { studentId, date, mood, notes, userId, period: period || null });
  };

  return { moodRecords, addMoodRecord };
};