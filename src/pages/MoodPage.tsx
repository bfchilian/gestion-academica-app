
import React, { useState, useMemo } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useStudents } from '../hooks/useStudents';
import { useMood } from '../hooks/useMood';

interface Props {
  userId: string;
  selectedPeriod: string;
}

const MoodPage: React.FC<Props> = ({ userId, selectedPeriod }) => {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const { students } = useStudents(userId, selectedGroup, selectedCourse, selectedPeriod);
  const { addMoodRecord } = useMood(userId, undefined, selectedPeriod);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState<number>(3); // Default to neutral mood
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

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

  const getMoodEmoji = (moodValue: number) => {
    switch (moodValue) {
      case 1: return '😠';
      case 2: return '😞';
      case 3: return '😐';
      case 4: return '🙂';
      case 5: return '😄';
      default: return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setMessage({ type: 'danger', text: 'Por favor, selecciona un estudiante.' });
      return;
    }

    try {
      await addMoodRecord(selectedStudentId, date, mood, notes, selectedPeriod);
      setMessage({ type: 'success', text: 'Estado de ánimo registrado con éxito.' });
      // Reset form
      setSelectedStudentId('');
      setMood(3);
      setNotes('');
    } catch (error) {
      console.error("Error al registrar estado de ánimo:", error);
      setMessage({ type: 'danger', text: 'Error al registrar estado de ánimo.' });
    }
  };

  return (
    <div>
      <h1>😊 Seguimiento de Estado de Ánimo</h1>
      {message && <Alert variant={message.type}>{message.text}</Alert>}
      <Form onSubmit={handleSubmit}>
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

        <Form.Group className="mb-3">
          <Form.Label>Estudiante</Form.Label>
          <Form.Control
            as="select"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            required
          >
            <option value="">Selecciona un estudiante</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Fecha</Form.Label>
          <Form.Control
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Estado de Ánimo: {getMoodEmoji(mood)} ({mood})</Form.Label>
          <Form.Range
            min="1"
            max="5"
            value={mood}
            onChange={(e) => setMood(parseInt(e.target.value))}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Notas (Opcional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Registrar Estado de Ánimo
        </Button>
      </Form>
    </div>
  );
};

export default MoodPage;
