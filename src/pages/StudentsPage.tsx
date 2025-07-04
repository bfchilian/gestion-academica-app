
import React, { useState, useMemo, useEffect } from 'react';
import { Button, Form, Table, Modal, Alert } from 'react-bootstrap';
import { useStudents } from '../hooks/useStudents';
import { Student } from '../types/Student';
import Papa from 'papaparse';
import { useLocation } from 'react-router-dom';

interface Props {
  userId: string;
  selectedPeriod: string;
}

const StudentsPage: React.FC<Props> = ({ userId, selectedPeriod }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialGroup = queryParams.get('group') || '';
  const initialCourse = queryParams.get('course') || '';

  const [selectedGroup, setSelectedGroup] = useState(initialGroup);
  const [selectedCourse, setSelectedCourse] = useState(initialCourse);

  const { students, addStudent, addStudentsBatch, updateStudent, deleteStudent } = useStudents(userId, selectedGroup, selectedCourse, selectedPeriod);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [course, setCourse] = useState('');
  const [email, setEmail] = useState(''); // New state for email
  const [file, setFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

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

  const handleShowAddEditModal = (student?: Student) => {
    setCurrentStudent(student || null);
    setName(student ? student.name : '');
    setGroup(student?.group || '');
    setCourse(student?.course || '');
    setEmail(student?.email || ''); // Set email for editing
    setShowAddEditModal(true);
  };

  const handleCloseAddEditModal = () => {
    setShowAddEditModal(false);
    setCurrentStudent(null);
    setName('');
    setGroup('');
    setCourse('');
    setEmail(''); // Clear email on close
  };

  const handleSaveStudent = () => {
    if (currentStudent) {
      updateStudent(currentStudent.id, name, group, course, email, selectedPeriod);
    } else {
      addStudent(name, group, course, email, selectedPeriod);
    }
    handleCloseAddEditModal();
  };

  const handleFileUpload = () => {
    if (!file) {
      setUploadMessage({ type: 'danger', text: 'Por favor, selecciona un archivo CSV.' });
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const studentsToUpload: Array<{ name: string; group?: string; course?: string; email?: string }> = [];
        results.data.forEach((row: any) => {
          if (row.name) {
            studentsToUpload.push({
              name: row.name,
              group: row.group || undefined,
              course: row.course || undefined,
              email: row.email || undefined, // Process email from CSV
            });
          }
        });

        if (studentsToUpload.length > 0) {
          try {
            await addStudentsBatch(studentsToUpload.map(s => ({ ...s, period: selectedPeriod })));
            setUploadMessage({ type: 'success', text: `Se han añadido ${studentsToUpload.length} estudiantes.` });
            setFile(null);
            setShowUploadModal(false);
          } catch (error) {
            console.error("Error al subir estudiantes por CSV:", error);
            setUploadMessage({ type: 'danger', text: 'Error al subir estudiantes. Consulta la consola para más detalles.' });
          }
        } else {
          setUploadMessage({ type: 'danger', text: 'No se encontraron estudiantes válidos en el archivo CSV.' });
        }
      },
      error: (error: any) => {
        console.error("Error al parsear CSV:", error);
        setUploadMessage({ type: 'danger', text: 'Error al leer el archivo CSV.' });
      },
    });
  };

  return (
    <div>
      <h1>🧑‍🎓 Gestión de Estudiantes</h1>
      <div className="mb-3">
        <Button onClick={() => handleShowAddEditModal()} className="me-2">
          Añadir Estudiante
        </Button>
        <Button variant="info" onClick={() => setShowUploadModal(true)}>
          Subir Lista de Estudiantes (CSV)
        </Button>
      </div>

      

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Grupo</th>
            <th>Curso</th>
            <th>Email</th> {/* New column header */}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.group || 'N/A'}</td>
              <td>{student.course || 'N/A'}</td>
              <td>{student.email || 'N/A'}</td> {/* Display email */}
              <td>
                <Button variant="warning" onClick={() => handleShowAddEditModal(student)} className="me-2">
                  Editar
                </Button>
                <Button variant="danger" onClick={() => deleteStudent(student.id)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal para Añadir/Editar Estudiante */}
      <Modal show={showAddEditModal} onHide={handleCloseAddEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentStudent ? 'Editar' : 'Añadir'} Estudiante</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Grupo (Opcional)</Form.Label>
              <Form.Control
                type="text"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Curso (Opcional)</Form.Label>
              <Form.Control
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email Institucional (Opcional)</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddEditModal}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={handleSaveStudent}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para Subir CSV */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Subir Lista de Estudiantes (CSV)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {uploadMessage && <Alert variant={uploadMessage.type}>{uploadMessage.text}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Selecciona un archivo CSV</Form.Label>
            <Form.Control
              type="file"
              accept=".csv"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files ? e.target.files[0] : null)}
            />
            <Form.Text className="text-muted">
              El archivo CSV debe tener una columna 'name'. Opcionalmente, puede tener 'group', 'course' y 'email'.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleFileUpload}>
            Subir
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StudentsPage;
