
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

export const processAttendanceData = (attendanceRecords: AttendanceRecord[], studentsInScope: Student[], selectedStudentId?: string, selectedGroup?: string, selectedCourse?: string) => {
  let recordsToProcess = attendanceRecords;

  // If a specific student is selected, override group/course filters for this chart
  if (selectedStudentId) {
    recordsToProcess = attendanceRecords.filter(record => record.studentId === selectedStudentId);
    studentsInScope = studentsInScope.filter(s => s.id === selectedStudentId); // Ensure studentsInScope also reflects single student
  }

  const dates = Array.from(new Set(recordsToProcess.map(record => record.date))).sort();
  const datasets: any[] = [];
  const csvData: any[] = [];

  if (selectedStudentId) {
    // Single student view
    const studentName = studentsInScope[0]?.name || 'Estudiante Desconocido';
    const presentCounts: { [date: string]: number } = {};
    const absentCounts: { [date: string]: number } = {};

    dates.forEach(date => {
      presentCounts[date] = 0;
      absentCounts[date] = 0;
    });

    recordsToProcess.forEach(record => {
      if (record.status === 'present') {
        presentCounts[record.date]++;
      } else {
        absentCounts[record.date]++;
      }
    });

    datasets.push({
      label: `${studentName} - Presente`,
      data: dates.map(date => presentCounts[date]),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    });
    datasets.push({
      label: `${studentName} - Ausente`,
      data: dates.map(date => absentCounts[date]),
      backgroundColor: 'rgba(255, 99, 132, 0.6)',
    });

    csvData.push(...dates.map(date => ({
      Fecha: date,
      Estudiante: studentName,
      Presente: presentCounts[date],
      Ausente: absentCounts[date],
    })));

  } else if (selectedCourse && !selectedGroup) {
    // Contrast by group within a selected course
    const uniqueGroups = Array.from(new Set(studentsInScope.map(s => s.group))).filter(Boolean) as string[];
    uniqueGroups.sort();

    uniqueGroups.forEach(group => {
      const groupStudentIds = studentsInScope.filter(s => s.group === group).map(s => s.id);
      const groupRecords = recordsToProcess.filter(record => groupStudentIds.includes(record.studentId));

      const presentCounts: { [date: string]: number } = {};
      const absentCounts: { [date: string]: number } = {};

      dates.forEach(date => {
        presentCounts[date] = 0;
        absentCounts[date] = 0;
      });

      groupRecords.forEach(record => {
        if (record.status === 'present') {
          presentCounts[record.date]++;
        } else {
          absentCounts[record.date]++;
        }
      });

      datasets.push({
        label: `Grupo ${group} - Presente`,
        data: dates.map(date => presentCounts[date]),
        backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
      });
      datasets.push({
        label: `Grupo ${group} - Ausente`,
        data: dates.map(date => absentCounts[date]),
        backgroundColor: `hsl(${Math.random() * 360}, 50%, 70%)`,
      });

      csvData.push(...dates.map(date => ({
        Fecha: date,
        Curso: selectedCourse,
        Grupo: group,
        Presente: presentCounts[date],
        Ausente: absentCounts[date],
      })));
    });

  } else {
    // General view (all students, or filtered by group/course if both are selected)
    const presentCounts: { [date: string]: number } = {};
    const absentCounts: { [date: string]: number } = {};

    dates.forEach(date => {
      presentCounts[date] = 0;
      absentCounts[date] = 0;
    });

    recordsToProcess.forEach(record => {
      if (record.status === 'present') {
        presentCounts[record.date]++;
      } else {
        absentCounts[record.date]++;
      }
    });

    datasets.push({
      label: 'Presentes',
      data: dates.map(date => presentCounts[date]),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    });
    datasets.push({
      label: 'Ausentes',
      data: dates.map(date => absentCounts[date]),
      backgroundColor: 'rgba(255, 99, 132, 0.6)',
    });

    csvData.push(...dates.map(date => ({
      Fecha: date,
      Presentes: presentCounts[date],
      Ausentes: absentCounts[date],
    })));
  }

  return {
    data: {
      labels: dates,
      datasets,
    },
    csvData
  };
};

export const processParticipationData = (participationRecords: ParticipationRecord[], studentsInScope: Student[], selectedStudentId?: string, selectedGroup?: string, selectedCourse?: string) => {
  let recordsToProcess = participationRecords;

  // If a specific student is selected, override group/course filters for this chart
  if (selectedStudentId) {
    recordsToProcess = participationRecords.filter(record => record.studentId === selectedStudentId);
    studentsInScope = studentsInScope.filter(s => s.id === selectedStudentId); // Ensure studentsInScope also reflects single student
  }

  const studentPoints: { [studentId: string]: number } = {};
  const studentNames: { [studentId: string]: string } = {};

  studentsInScope.forEach(student => {
    studentPoints[student.id] = 0;
    studentNames[student.id] = student.name;
  });

  recordsToProcess.forEach(record => {
    studentPoints[record.studentId] += record.points;
  });

  const datasets: any[] = [];
  const csvData: any[] = [];

  if (selectedStudentId) {
    // Single student view
    const studentName = studentsInScope[0]?.name || 'Estudiante Desconocido';
    datasets.push({
      label: `${studentName} - Puntos de Participación`,
      data: [studentPoints[selectedStudentId]],
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
    });
    csvData.push(...recordsToProcess.map(record => ({
      Fecha: record.date,
      Estudiante: studentName,
      'Puntos de Participación': record.points,
      Notas: record.notes || '',
    })));

  } else if (selectedCourse && !selectedGroup) {
    // Contrast by group within a selected course
    const uniqueGroups = Array.from(new Set(studentsInScope.map(s => s.group))).filter(Boolean) as string[];
    uniqueGroups.sort();

    uniqueGroups.forEach(group => {
      const groupStudentIds = studentsInScope.filter(s => s.group === group).map(s => s.id);
      const groupRecords = recordsToProcess.filter(record => groupStudentIds.includes(record.studentId));
      const groupTotalPoints = groupRecords.reduce((sum, record) => sum + record.points, 0);

      datasets.push({
        label: `Grupo ${group} - Puntos Totales`,
        data: [groupTotalPoints],
        backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
      });

      csvData.push({
        Curso: selectedCourse,
        Grupo: group,
        'Puntos de Participación Totales': groupTotalPoints,
      });
    });

  } else {
    // General view (all students, or filtered by group/course if both are selected)
    const labels = studentsInScope.map(student => student.name);
    datasets.push({
      label: 'Puntos de Participación Totales',
      data: studentsInScope.map(student => studentPoints[student.id]),
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
    });
    csvData.push(...recordsToProcess.map(record => ({
      Fecha: record.date,
      Estudiante: studentNames[record.studentId],
      'Puntos de Participación': record.points,
      Notas: record.notes || '',
    })));
  }

  return {
    data: {
      labels: selectedStudentId ? [studentsInScope[0]?.name || 'Estudiante'] : (selectedCourse && !selectedGroup ? uniqueGroups : studentsInScope.map(s => s.name)),
      datasets,
    },
    csvData
  };
};

export const processMoodData = (moodRecords: MoodRecord[], studentsInScope: Student[], selectedStudentId?: string) => {
  const filteredRecords = selectedStudentId
    ? moodRecords.filter(record => record.studentId === selectedStudentId)
    : moodRecords;

  const studentMoods: { [studentId: string]: { date: string; mood: number }[] } = {};
  const studentNames: { [studentId: string]: string } = {};

  studentsInScope.forEach(student => {
    studentMoods[student.id] = [];
    studentNames[student.id] = student.name;
  });

  filteredRecords.forEach(record => {
    studentMoods[record.studentId].push({ date: record.date, mood: record.mood });
  });

  const allDates = Array.from(new Set(filteredRecords.map(record => record.date))).sort();

  const datasets = (selectedStudentId ? studentsInScope.filter(s => s.id === selectedStudentId) : studentsInScope).map(student => {
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
