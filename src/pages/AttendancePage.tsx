
import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Table } from 'react-bootstrap';
import { useStudents } from '../hooks/useStudents';
import { useAttendance } from '../hooks/useAttendance';
import { AttendanceRecord } from '../types/AttendanceRecord';

interface Props {
  userId: string;
  selectedPeriod: string;
}

const AttendancePage: React.FC<Props> = ({ userId, selectedPeriod }) => {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const { students } = useStudents(userId, selectedGroup, selectedCourse, selectedPeriod);
  const { attendanceRecords, addOrUpdateAttendance } = useAttendance(userId, undefined, selectedPeriod);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentAttendance, setCurrentAttendance] = useState<{
    [studentId: string]: 'present' | 'absent' | undefined;
  }>({});

  const allGroups = useMemo(() => {
    const groups = new Set<string>();
    students.forEach(s => s.group && groups.add(s.group));
    return Array.from(groups).sort();
  }, [students]);

  const allCourses = useMemo(() => {
    const courses = new Set<string>();
    students.forEach(s => s.course && courses.add(s.course));
    return Array.from(courses).sort();
  }, [students]);

  useEffect(() => {
    const recordsForSelectedDate = attendanceRecords.filter(
      (record) => record.date === selectedDate
    );
    const newCurrentAttendance: { [studentId: string]: 'present' | 'absent' | undefined } = {};
    recordsForSelectedDate.forEach((record) => {
      newCurrentAttendance[record.studentId] = record.status;
    });
    setCurrentAttendance(newCurrentAttendance);
  }, [attendanceRecords, selectedDate]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent') => {
    setCurrentAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    addOrUpdateAttendance(studentId, selectedDate, status, selectedPeriod);
  };

  return (
    <div>
      <h1>✅ Pase de Lista</h1>
      <Form.Group controlId="attendanceDate" className="mb-3">
        <Form.Label>Seleccionar Fecha</Form.Label>
        <Form.Control
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Filtrar por Grupo</Form.Label>
        <Form.Control
          as="select"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="">Todos los Grupos</option>
          {allGroups.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </Form.Control>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Filtrar por Curso</Form.Label>
        <Form.Control
          as="select"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">Todos los Cursos</option>
          {allCourses.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Form.Control>
      </Form.Group>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>
                <Button
                  variant={currentAttendance[student.id] === 'present' ? 'success' : 'outline-success'}
                  onClick={() => handleStatusChange(student.id, 'present')}
                  className="me-2"
                >
                  Presente
                </Button>
                <Button
                  variant={currentAttendance[student.id] === 'absent' ? 'danger' : 'outline-danger'}
                  onClick={() => handleStatusChange(student.id, 'absent')}
                >
                  Ausente
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AttendancePage;
