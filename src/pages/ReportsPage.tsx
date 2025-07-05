import React, { useState, useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Button, Card, Col, Row, Form } from 'react-bootstrap';
import { useStudents } from '../hooks/useStudents';
import { useAttendance } from '../hooks/useAttendance';
import { useParticipation } from '../hooks/useParticipation';
import { useMood } from '../hooks/useMood';
import { processAttendanceData, processParticipationData, processMoodData, downloadCSV } from '../utils/chartUtils';

interface Props {
  userId: string;
  selectedPeriod: string;
}

const ReportsPage: React.FC<Props> = ({ userId, selectedPeriod }) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const { students: allStudents } = useStudents(userId, undefined, undefined, selectedPeriod);

  const filteredStudentsByCourseGroup = useMemo(() => {
    return allStudents.filter(student => {
      const matchesGroup = selectedGroup ? student.group === selectedGroup : true;
      const matchesCourse = selectedCourse ? student.course === selectedCourse : true;
      return matchesGroup && matchesCourse;
    });
  }, [allStudents, selectedGroup, selectedCourse]);

  const studentIdsForHooks = useMemo(() => {
    if (selectedStudentId) {
      return [selectedStudentId];
    } else if (selectedGroup || selectedCourse) {
      return filteredStudentsByCourseGroup.map(s => s.id);
    } else {
      return undefined; // No specific filter, fetch all for the period
    }
  }, [selectedStudentId, selectedGroup, selectedCourse, filteredStudentsByCourseGroup]);

  const { attendanceRecords } = useAttendance(userId, studentIdsForHooks, selectedPeriod);
  const { participationRecords } = useParticipation(userId, studentIdsForHooks, selectedPeriod);
  const { moodRecords } = useMood(userId, studentIdsForHooks, selectedPeriod);

  const uniqueGroups = useMemo(() => {
    const groups = new Set<string>();
    allStudents.forEach(student => {
      if (student.group) groups.add(student.group);
    });
    return Array.from(groups).sort();
  }, [allStudents]);

  const uniqueCourses = useMemo(() => {
    const courses = new Set<string>();
    allStudents.forEach(student => {
      if (student.course) courses.add(student.course);
    });
    return Array.from(courses).sort();
  }, [allStudents]);

  const attendanceChartData = processAttendanceData(attendanceRecords, filteredStudentsByCourseGroup, selectedStudentId, selectedGroup, selectedCourse);
  const participationChartData = processParticipationData(participationRecords, filteredStudentsByCourseGroup, selectedStudentId, selectedGroup, selectedCourse);
  const moodChartData = processMoodData(moodRecords, filteredStudentsByCourseGroup, selectedStudentId);

  return (
    <div>
      <h1>📈 Informes y Visualizaciones</h1>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group controlId="courseSelect">
            <Form.Label>Filtrar por Curso</Form.Label>
            <Form.Control
              as="select"
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedGroup(''); // Reset group when course changes
                setSelectedStudentId(''); // Reset student when course changes
              }}
            >
              <option value="">Todos los Cursos</option>
              {uniqueCourses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="groupSelect">
            <Form.Label>Filtrar por Grupo</Form.Label>
            <Form.Control
              as="select"
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                setSelectedStudentId(''); // Reset student when group changes
              }}
            >
              <option value="">Todos los Grupos</option>
              {uniqueGroups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="studentSelect">
            <Form.Label>Filtrar por Estudiante</Form.Label>
            <Form.Control
              as="select"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">Todos los Estudiantes</option>
              {filteredStudentsByCourseGroup.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>Gráfico de Asistencia</Card.Header>
            <Card.Body>
              <Bar data={attendanceChartData.data} />
              <Button
                variant="primary"
                className="mt-3"
                onClick={() => downloadCSV(attendanceChartData.csvData, 'asistencia.csv')}
              >
                Descargar Datos de Asistencia
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>Gráfico de Participación</Card.Header>
            <Card.Body>
              <Bar data={participationChartData.data} />
              <Button
                variant="primary"
                className="mt-3"
                onClick={() => downloadCSV(participationChartData.csvData, 'participacion.csv')}
              >
                Descargar Datos de Participación
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>Gráfico de Estado de Ánimo</Card.Header>
            <Card.Body>
              <Line data={moodChartData.data} />
              <Button
                variant="primary"
                className="mt-3"
                onClick={() => downloadCSV(moodChartData.csvData, 'estado_animo.csv')}
              >
                Descargar Datos de Estado de Ánimo
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportsPage;