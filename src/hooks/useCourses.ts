import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Course } from '../types/Course';

export const useCourses = (userId: string, selectedPeriod: string) => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!userId || !selectedPeriod) return;

    const q = query(
      collection(db, 'courses'),
      where('userId', '==', userId),
      where('period', '==', selectedPeriod)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const coursesData: Course[] = [];
      querySnapshot.forEach((doc) => {
        coursesData.push({ ...doc.data(), id: doc.id } as Course);
      });
      setCourses(coursesData);
    });

    return () => unsubscribe();
  }, [userId, selectedPeriod]);

  const addCourse = async (name: string, summary?: string, objectives?: string, strategies?: string, activities?: string, tasks?: string) => {
    if (!userId || !selectedPeriod) return;
    await addDoc(collection(db, 'courses'), {
      userId,
      period: selectedPeriod,
      name,
      summary: summary || null,
      objectives: objectives || null,
      strategies: strategies || null,
      activities: activities || null,
      tasks: tasks || null,
    });
  };

  const updateCourse = async (id: string, name: string, summary?: string, objectives?: string, strategies?: string, activities?: string, tasks?: string) => {
    const courseDoc = doc(db, 'courses', id);
    await updateDoc(courseDoc, {
      name,
      summary: summary || null,
      objectives: objectives || null,
      strategies: strategies || null,
      activities: activities || null,
      tasks: tasks || null,
    });
  };

  const deleteCourse = async (id: string) => {
    const courseDoc = doc(db, 'courses', id);
    await deleteDoc(courseDoc);
  };

  return { courses, addCourse, updateCourse, deleteCourse };
};