import React, { useState, useMemo } from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { useStudents } from '../hooks/useStudents';
import { useAttendance } from '../hooks/useAttendance';
import { useParticipation } from '../hooks/useParticipation';
import { useMood } from '../hooks/useMood';

interface Props {
  userId: string;
  selectedPeriod: string;
}

const DashboardPage: React.FC<Props> = ({ userId, selectedPeriod }) => {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  // Fetch all students to populate group/course filters
  const { students: allStudents } = useStudents(userId, undefined, undefined, selectedPeriod);

  // Fetch filtered students based on selected group/course
  const { students: filteredStudents } = useStudents(userId, selectedGroup, selectedCourse, selectedPeriod);

  const filteredStudentIds = useMemo(() => filteredStudents.map(s => s.id), [filteredStudents]);

  const { attendanceRecords } = useAttendance(userId, filteredStudentIds, selectedPeriod);
  const { participationRecords } = useParticipation(userId, filteredStudentIds, selectedPeriod);
  const { moodRecords } = useMood(userId, filteredStudentIds, selectedPeriod);

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

  return (
    <div>
      <h1>📊 Panel de Control</h1>
      <p>User ID: {userId}</p>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Filtrar por Grupo</Form.Label>
            <Form.Control
              as="select"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="">Todos los Grupos</option>
              {uniqueGroups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Filtrar por Curso</Form.Label>
            <Form.Control
              as="select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Todos los Cursos</option>
              {uniqueCourses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={3}>
          <Card
            className="text-center bg-primary text-white mb-3"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/students')}
          >
            <Card.Body>
              <Card.Title>{filteredStudents.length}</Card.Title>
              <Card.Text>Estudiantes Filtrados</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card
            className="text-center bg-success text-white mb-3"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/attendance')}
          >
            <Card.Body>
              <Card.Title>{attendanceRecords.length}</Card.Title>
              <Card.Text>Registros de Asistencia</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card
            className="text-center bg-info text-white mb-3"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/participation')}
          >
            <Card.Body>
              <Card.Title>{participationRecords.length}</Card.Title>
              <Card.Text>Registros de Participación</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card
            className="text-center bg-warning text-white mb-3"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/mood')}
          >
            <Card.Body>
              <Card.Title>{moodRecords.length}</Card.Title>
              <Card.Text>Registros de Estado de Ánimo</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Las tarjetas de Grupos y Cursos Existentes se mantienen para mostrar todos los disponibles */}
      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header>Todos los Grupos</Card.Header>
            <Card.Body>
              {uniqueGroups.length > 0 ? (
                <ul>
                  {uniqueGroups.map(group => (
                    <li key={group}>
                      <a href="#" onClick={() => navigate(`/students?group=${encodeURIComponent(group)}`)}>
                        {group}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay grupos registrados.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>Todos los Cursos</Card.Header>
            <Card.Body>
              {uniqueCourses.length > 0 ? (
                <ul>
                  {uniqueCourses.map(course => (
                    <li key={course}>
                      <a href="#" onClick={() => navigate(`/students?course=${encodeURIComponent(course)}`)}>
                        {course}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay cursos registrados.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;