import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import Papa from 'papaparse';
import { useStudents } from '../hooks/useStudents';

interface Props {
  userId: string;
  selectedPeriod: string;
}

const HomePage: React.FC<Props> = ({ userId, selectedPeriod }) => {
  const { addStudentsBatch } = useStudents(userId, undefined, undefined, selectedPeriod);
  const [courseName, setCourseName] = useState('');
  const [groupNumber, setGroupNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const handleFileUpload = () => {
    if (!file) {
      setUploadMessage({ type: 'danger', text: 'Por favor, selecciona un archivo CSV.' });
      return;
    }

    if (!courseName || !groupNumber) {
      setUploadMessage({ type: 'danger', text: 'Por favor, ingresa el nombre del curso y el número de grupo.' });
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const studentsToUpload: Array<{ name: string; group?: string; course?: string; email?: string; period?: string; matricula?: string }> = [];
        results.data.forEach((row: any) => {
          if (row.name) {
            studentsToUpload.push({
              name: row.name,
              group: groupNumber,
              course: courseName,
              email: row.email || undefined,
              period: selectedPeriod,
              matricula: row.matricula || undefined, // Process matricula from CSV
            });
          }
        });

        if (studentsToUpload.length > 0) {
          try {
            await addStudentsBatch(studentsToUpload);
            setUploadMessage({ type: 'success', text: `Se han añadido ${studentsToUpload.length} estudiantes al curso ${courseName}, grupo ${groupNumber} para el periodo ${selectedPeriod}.` });
            setFile(null);
            setCourseName('');
            setGroupNumber('');
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
      <h1>👋 Bienvenido a tu App de Gestión Académica</h1>
      <p>Aquí puedes gestionar estudiantes, asistencia, participación, estado de ánimo e informes.</p>

      <Card className="mt-4">
        <Card.Header>Carga Masiva de Estudiantes</Card.Header>
        <Card.Body>
          {uploadMessage && <Alert variant={uploadMessage.type}>{uploadMessage.text}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Periodo Escolar Actual</Form.Label>
              <Form.Control type="text" value={selectedPeriod} readOnly />
              <Form.Text className="text-muted">
                El periodo escolar se selecciona desde el menú lateral.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Curso</Form.Label>
              <Form.Control
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Ej: Matemáticas I"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Número de Grupo</Form.Label>
              <Form.Control
                type="text"
                value={groupNumber}
                onChange={(e) => setGroupNumber(e.target.value)}
                placeholder="Ej: G101"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Lista de Estudiantes (CSV)</Form.Label>
              <Form.Control
                type="file"
                accept=".csv"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files ? e.target.files[0] : null)}
              />
              <Form.Text className="text-muted">
                El archivo CSV debe tener una columna 'name'. Opcionalmente, puede tener 'email' y 'matricula'.
              </Form.Text>
            </Form.Group>
            <Button variant="primary" onClick={handleFileUpload}>
              Cargar Estudiantes
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default HomePage;
