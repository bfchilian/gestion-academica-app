
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Student } from '../types/Student';

export const useStudents = (userId: string, selectedGroup?: string, selectedCourse?: string, selectedPeriod?: string) => {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (!userId) return;

    let studentsQuery = query(collection(db, 'students'), where('userId', '==', userId));

    if (selectedGroup) {
      studentsQuery = query(studentsQuery, where('group', '==', selectedGroup));
    }

    if (selectedCourse) {
      studentsQuery = query(studentsQuery, where('course', '==', selectedCourse));
    }

    if (selectedPeriod) {
      studentsQuery = query(studentsQuery, where('period', '==', selectedPeriod));
    }

    const unsubscribe = onSnapshot(studentsQuery, (querySnapshot) => {
      const studentsData: Student[] = [];
      querySnapshot.forEach((doc) => {
        studentsData.push({ ...doc.data(), id: doc.id } as Student);
      });
      setStudents(studentsData);
    });

    return () => unsubscribe();
  }, [userId, selectedGroup, selectedCourse, selectedPeriod]);

  const addStudent = async (name: string, group?: string, course?: string, email?: string, period?: string) => {
    if (!userId) return;
    await addDoc(collection(db, 'students'), { name, userId, group: group || null, course: course || null, email: email || null, period: period || null });
  };

  const addStudentsBatch = async (studentsToAdd: Array<{ name: string; group?: string; course?: string; email?: string; period?: string }>) => {
    if (!userId) return;
    const batch = writeBatch(db);
    studentsToAdd.forEach(student => {
      const newStudentRef = doc(collection(db, 'students'));
      batch.set(newStudentRef, { ...student, userId, group: student.group || null, course: student.course || null, email: student.email || null, period: student.period || null });
    });
    await batch.commit();
  };

  const updateStudent = async (id: string, name: string, group?: string, course?: string, email?: string, period?: string) => {
    const studentDoc = doc(db, 'students', id);
    await updateDoc(studentDoc, { name, group: group || null, course: course || null, email: email || null, period: period || null });
  };

  const deleteStudent = async (studentId: string) => {
    // Delete student document
    const studentDocRef = doc(db, 'students', studentId);
    await deleteDoc(studentDocRef);

    // Delete associated attendance records
    const attendanceQuery = query(collection(db, 'attendance'), where('studentId', '==', studentId));
    const attendanceSnapshot = await getDocs(attendanceQuery);
    attendanceSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    // Delete associated participation records
    const participationQuery = query(collection(db, 'participation'), where('studentId', '==', studentId));
    const participationSnapshot = await getDocs(participationQuery);
    participationSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    // Delete associated mood records
    const moodQuery = query(collection(db, 'mood'), where('studentId', '==', studentId));
    const moodSnapshot = await getDocs(moodQuery);
    moodSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  };

  return { students, addStudent, addStudentsBatch, updateStudent, deleteStudent };
};
