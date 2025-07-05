import React, { useState } from 'react';
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

  const { students } = useStudents(userId, undefined, undefined, selectedPeriod);
  const { attendanceRecords } = useAttendance(userId, selectedStudentId ? [selectedStudentId] : undefined, selectedPeriod);
  const { participationRecords } = useParticipation(userId, selectedStudentId ? [selectedStudentId] : undefined, selectedPeriod);
  const { moodRecords } = useMood(userId, selectedStudentId ? [selectedStudentId] : undefined, selectedPeriod);

  const attendanceChartData = processAttendanceData(attendanceRecords, students, selectedStudentId);
  const participationChartData = processParticipationData(participationRecords, students, selectedStudentId);
  const moodChartData = processMoodData(moodRecords, students, selectedStudentId);

  return (
    <div>
      <h1>📈 Informes y Visualizaciones</h1>

      <Form.Group controlId="studentSelect" className="mb-3">
        <Form.Label>Filtrar por Estudiante</Form.Label>
        <Form.Control
          as="select"
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
        >
          <option value="">Todos los Estudiantes</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

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