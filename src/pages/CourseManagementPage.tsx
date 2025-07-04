import React, { useState } from 'react';
import { Button, Form, Table, Modal, Alert } from 'react-bootstrap';
import { useCourses } from '../hooks/useCourses';
import { Course } from '../types/Course';

interface Props {
  userId: string;
  selectedPeriod: string;
}

const CourseManagementPage: React.FC<Props> = ({ userId, selectedPeriod }) => {
  const { courses, addCourse, updateCourse, deleteCourse } = useCourses(userId, selectedPeriod);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [name, setName] = useState('');
  const [group, setGroup] = useState(''); // New state for group
  const [course, setCourse] = useState(''); // New state for course
  const [summary, setSummary] = useState('');
  const [objectives, setObjectives] = useState('');
  const [strategies, setStrategies] = useState('');
  const [activities, setActivities] = useState('');
  const [tasks, setTasks] = useState('');

  const handleShowAddEditModal = (course?: Course) => {
    setCurrentCourse(course || null);
    setName(course ? course.name : '');
    setGroup(course?.group || ''); // Set group for editing
    setCourse(course?.course || ''); // Set course for editing
    setSummary(course?.summary || '');
    setObjectives(course?.objectives || '');
    setStrategies(course?.strategies || '');
    setActivities(course?.activities || '');
    setTasks(course?.tasks || '');
    setShowAddEditModal(true);
  };

  const handleCloseAddEditModal = () => {
    setShowAddEditModal(false);
    setCurrentCourse(null);
    setName('');
    setGroup(''); // Clear group on close
    setCourse(''); // Clear course on close
    setSummary('');
    setObjectives('');
    setStrategies('');
    setActivities('');
    setTasks('');
  };

  const handleSaveCourse = () => {
    if (!name || !group || !course) {
      alert('Por favor, completa el Nombre de la Materia, Grupo y Curso.');
      return;
    }

    if (currentCourse) {
      updateCourse(currentCourse.id, name, group, course, summary, objectives, strategies, activities, tasks);
    } else {
      addCourse(name, group, course, summary, objectives, strategies, activities, tasks);
    }
    handleCloseAddEditModal();
  };

  return (
    <div>
      <h1>📚 Gestión de Materias</h1>
      <p>Periodo Actual: {selectedPeriod}</p>
      <div className="mb-3">
        <Button onClick={() => handleShowAddEditModal()} className="me-2">
          Añadir Materia
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Grupo</th>
            <th>Curso</th>
            <th>Resumen</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>{course.name}</td>
              <td>{course.group}</td>
              <td>{course.course}</td>
              <td>{course.summary || 'N/A'}</td>
              <td>
                <Button variant="warning" onClick={() => handleShowAddEditModal(course)} className="me-2">
                  Editar
                </Button>
                <Button variant="danger" onClick={() => deleteCourse(course.id)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal para Añadir/Editar Materia */}
      <Modal show={showAddEditModal} onHide={handleCloseAddEditModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{currentCourse ? 'Editar' : 'Añadir'} Materia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de la Materia</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Grupo</Form.Label>
              <Form.Control
                type="text"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Curso</Form.Label>
              <Form.Control
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Resumen</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Objetivos</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estrategias</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={strategies}
                onChange={(e) => setStrategies(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Actividades</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tareas</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddEditModal}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={handleSaveCourse}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CourseManagementPage;
