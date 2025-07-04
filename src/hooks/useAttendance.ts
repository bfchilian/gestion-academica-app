
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AttendanceRecord } from '../types/AttendanceRecord';

export const useAttendance = (userId: string, studentIds?: string[], selectedPeriod?: string) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (!userId) return;

    let q = query(collection(db, 'attendance'), where('userId', '==', userId));

    if (studentIds && studentIds.length > 0) {
      // Firestore 'in' query has a limit of 10, so we might need to handle this if studentIds is large
      // For simplicity, assuming studentIds will be <= 10 for now or handling in UI
      q = query(q, where('studentId', 'in', studentIds));
    } else if (studentIds && studentIds.length === 0) {
      // If studentIds is an empty array, it means no students are selected, so return empty records
      setAttendanceRecords([]);
      return;
    }

    if (selectedPeriod) {
      q = query(q, where('period', '==', selectedPeriod));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const recordsData: AttendanceRecord[] = [];
      querySnapshot.forEach((doc) => {
        recordsData.push({ ...doc.data(), id: doc.id } as AttendanceRecord);
      });
      setAttendanceRecords(recordsData);
    });

    return () => unsubscribe();
  }, [userId, studentIds, selectedPeriod]);

  const addOrUpdateAttendance = async (studentId: string, date: string, status: 'present' | 'absent', period?: string) => {
    if (!userId) return;

    // Check if a record for this student and date already exists
    const q = query(
      collection(db, 'attendance'),
      where('userId', '==', userId),
      where('studentId', '==', studentId),
      where('date', '==', date),
      where('period', '==', period || null) // Include period in query
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Add new record
      await addDoc(collection(db, 'attendance'), { studentId, date, status, userId, period: period || null });
    } else {
      // Update existing record
      const docToUpdate = querySnapshot.docs[0];
      await updateDoc(doc(db, 'attendance', docToUpdate.id), { status, period: period || null });
    }
  };

  return { attendanceRecords, addOrUpdateAttendance };
};
