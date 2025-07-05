import React, { useState, useMemo } from 'react';
import { Button, Form, Table, Modal, Alert } from 'react-bootstrap';
import { useCourses } from '../hooks/useCourses';
import { Course } from '../types/Course';

interface Props {
  userId: string;
}

const CourseManagementPage: React.FC<Props> = ({ userId }) => {
  const [localSelectedPeriod, setLocalSelectedPeriod] = useState('Verano 25'); // Default period for this page
  const availablePeriods = ['Primavera 25', 'Verano 25', 'Otoño 25']; // Example periods

  const { courses, addCourse, updateCourse, deleteCourse } = useCourses(userId, localSelectedPeriod);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [course, setCourse] = useState('');
  const [summary, setSummary] = useState('');
  const [objectives, setObjectives] = useState('');
  const [strategies, setStrategies] = useState('');
  const [activities, setActivities] = useState('');
  const [tasks, setTasks] = useState('');

  const [sortColumn, setSortColumn] = useState<keyof Course>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedCourses = useMemo(() => {
    let sortableCourses = [...courses];
    if (sortColumn) {
      sortableCourses.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        // Fallback for other types or if values are not comparable
        return 0;
      });
    }
    return sortableCourses;
  }, [courses, sortColumn, sortDirection]);

  const handleSort = (column: keyof Course) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleShowAddEditModal = (course?: Course) => {
    setCurrentCourse(course || null);
    setName(course ? course.name : '');
    setGroup(course?.group || '');
    setCourse(course?.course || '');
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
    setGroup('');
    setCourse('');
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
      <Form.Group controlId="periodSelect" className="mb-3">
        <Form.Label>Filtrar por Periodo Escolar</Form.Label>
        <Form.Select
          value={localSelectedPeriod}
          onChange={(e) => setLocalSelectedPeriod(e.target.value)}
        >
          {availablePeriods.map(period => (
            <option key={period} value={period}>{period}</option>
          ))}
        </Form.Select>
      </Form.Group>
      <p>Periodo Seleccionado: {localSelectedPeriod}</p>
      <div className="mb-3">
        <Button onClick={() => handleShowAddEditModal()} className="me-2">
          Añadir Materia
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Nombre {sortColumn === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
            <th onClick={() => handleSort('group')} style={{ cursor: 'pointer' }}>Grupo {sortColumn === 'group' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
            <th onClick={() => handleSort('course')} style={{ cursor: 'pointer' }}>Curso {sortColumn === 'course' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
            <th>Periodo</th>
            <th>Resumen</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedCourses.map((course) => (
            <tr key={course.id}>
              <td>{course.name}</td>
              <td>{course.group}</td>
              <td>{course.course}</td>
              <td>{course.period}</td>
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
