import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ParticipationRecord } from '../types/ParticipationRecord';

export const useParticipation = (userId: string, studentIds?: string[], selectedPeriod?: string) => {
  const [participationRecords, setParticipationRecords] = useState<ParticipationRecord[]>([]);

  useEffect(() => {
    if (!userId) return;

    let q = query(collection(db, 'participation'), where('userId', '==', userId));

    if (studentIds && studentIds.length > 0) {
      q = query(q, where('studentId', 'in', studentIds));
    } else if (studentIds && studentIds.length === 0) {
      setParticipationRecords([]);
      return;
    }

    if (selectedPeriod) {
      q = query(q, where('period', '==', selectedPeriod));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const recordsData: ParticipationRecord[] = [];
      querySnapshot.forEach((doc) => {
        recordsData.push({ ...doc.data(), id: doc.id } as ParticipationRecord);
      });
      setParticipationRecords(recordsData);
    });

    return () => unsubscribe();
  }, [userId, studentIds, selectedPeriod]);

  const addParticipation = async (studentId: string, date: string, points: number, notes?: string, period?: string) => {
    if (!userId) return;
    await addDoc(collection(db, 'participation'), { studentId, date, points, notes, userId, period: period || null });
  };

  return { participationRecords, addParticipation };
};