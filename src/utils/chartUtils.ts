
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import Papa from 'papaparse';
import { Student } from '../types/Student';
import { AttendanceRecord } from '../types/AttendanceRecord';
import { ParticipationRecord } from '../types/ParticipationRecord';
import { MoodRecord } from '../types/MoodRecord';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

export const processAttendanceData = (attendanceRecords: AttendanceRecord[], students: Student[], selectedStudentId?: string) => {
  const filteredRecords = selectedStudentId
    ? attendanceRecords.filter(record => record.studentId === selectedStudentId)
    : attendanceRecords;

  const dates = Array.from(new Set(filteredRecords.map(record => record.date))).sort();
  const presentCounts: { [date: string]: number } = {};
  const absentCounts: { [date: string]: number } = {};

  dates.forEach(date => {
    presentCounts[date] = 0;
    absentCounts[date] = 0;
  });

  filteredRecords.forEach(record => {
    if (record.status === 'present') {
      presentCounts[record.date]++;
    } else {
      absentCounts[record.date]++;
    }
  });

  const data = {
    labels: dates,
    datasets: [
      {
        label: 'Presentes',
        data: dates.map(date => presentCounts[date]),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Ausentes',
        data: dates.map(date => absentCounts[date]),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const csvData = dates.map(date => ({
    Fecha: date,
    Presentes: presentCounts[date],
    Ausentes: absentCounts[date],
  }));

  return { data, csvData };
};

export const processParticipationData = (participationRecords: ParticipationRecord[], students: Student[], selectedStudentId?: string) => {
  const filteredRecords = selectedStudentId
    ? participationRecords.filter(record => record.studentId === selectedStudentId)
    : participationRecords;

  const studentPoints: { [studentId: string]: number } = {};
  const studentNames: { [studentId: string]: string } = {};

  students.forEach(student => {
    studentPoints[student.id] = 0;
    studentNames[student.id] = student.name;
  });

  filteredRecords.forEach(record => {
    studentPoints[record.studentId] += record.points;
  });

  const labels = selectedStudentId ? [studentNames[selectedStudentId]] : students.map(student => student.name);
  const data = {
    labels,
    datasets: [
      {
        label: 'Puntos de Participación Totales',
        data: selectedStudentId ? [studentPoints[selectedStudentId]] : students.map(student => studentPoints[student.id]),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  const csvData = filteredRecords.map(record => ({
    Fecha: record.date,
    Estudiante: studentNames[record.studentId],
    'Puntos de Participación': record.points,
    Notas: record.notes || '',
  }));

  return { data, csvData };
};

export const processMoodData = (moodRecords: MoodRecord[], students: Student[], selectedStudentId?: string) => {
  const filteredRecords = selectedStudentId
    ? moodRecords.filter(record => record.studentId === selectedStudentId)
    : moodRecords;

  const studentMoods: { [studentId: string]: { date: string; mood: number }[] } = {};
  const studentNames: { [studentId: string]: string } = {};

  students.forEach(student => {
    studentMoods[student.id] = [];
    studentNames[student.id] = student.name;
  });

  filteredRecords.forEach(record => {
    studentMoods[record.studentId].push({ date: record.date, mood: record.mood });
  });

  const allDates = Array.from(new Set(filteredRecords.map(record => record.date))).sort();

  const datasets = (selectedStudentId ? students.filter(s => s.id === selectedStudentId) : students).map(student => {
    const moodsByDate: { [date: string]: number[] } = {};
    studentMoods[student.id].forEach(record => {
      if (!moodsByDate[record.date]) {
        moodsByDate[record.date] = [];
      }
      moodsByDate[record.date].push(record.mood);
    });

    const dataPoints = allDates.map(date => {
      const moods = moodsByDate[date];
      return moods ? moods.reduce((sum, m) => sum + m, 0) / moods.length : null;
    });

    return {
      label: student.name,
      data: dataPoints,
      borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`, // Random color for each student
      fill: false,
      tension: 0.1,
    };
  });

  const data = {
    labels: allDates,
    datasets,
  };

  const csvData = filteredRecords.map(record => {
    return {
      Fecha: record.date,
      Estudiante: studentNames[record.studentId],
      'Estado de Ánimo': record.mood,
      Notas: record.notes || '',
    };
  });

  return { data, csvData };
};

export const downloadCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
