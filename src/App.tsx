
import { Routes, Route, Link } from 'react-router-dom';
import { Container, Row, Col, Nav, Form, Button } from 'react-bootstrap';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import AttendancePage from './pages/AttendancePage';
import ParticipationPage from './pages/ParticipationPage';
import MoodPage from './pages/MoodPage';
import ReportsPage from './pages/ReportsPage';
import HomePage from './pages/HomePage'; // Import HomePage
import { useState } from 'react';

function App() {
  const userId = "dummy-user-id"; // Placeholder for auth
  const [selectedPeriod, setSelectedPeriod] = useState('Verano 25'); // Default period

  const availablePeriods = ['Primavera 25', 'Verano 25', 'Otoño 25']; // Example periods

  return (
    <Container fluid>
      <Row>
        <Col sm={3} md={2} className="bg-light sidebar d-flex flex-column">
          <div className="sidebar-header text-center py-3">
            {/* Reemplaza 'logo.png' con la ruta a tu logo en la carpeta public */}
            <img src="/logo.png" alt="Logo de la Aplicación" className="img-fluid mb-2" style={{ maxWidth: '100px' }} />
            <h4 className="mb-0">Mi escuela Fav</h4>
          </div>
          <Nav className="flex-column flex-grow-1">
            <Nav.Link as={Link as any} to="/">🏠 Inicio</Nav.Link>
            <Nav.Link as={Link as any} to="/dashboard">📊 Dashboard</Nav.Link>
            <Nav.Link as={Link as any} to="/students">🧑‍🎓 Estudiantes</Nav.Link>
            <Nav.Link as={Link as any} to="/attendance">✅ Pase de Lista</Nav.Link>
            <Nav.Link as={Link as any} to="/participation">🗣️ Participación</Nav.Link>
            <Nav.Link as={Link as any} to="/mood">😊 Estado de Ánimo</Nav.Link>
            <Nav.Link as={Link as any} to="/reports">📈 Informes</Nav.Link>
          </Nav>
          <div className="mt-3 px-3 w-100">
            <Form.Group controlId="periodSelect">
              <Form.Label>Periodo Escolar</Form.Label>
              <Form.Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {availablePeriods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
          <div className="sidebar-footer text-center py-3 mt-auto">
            <small>Desarrollado por BFCH para ARPA-BUAP</small><br/>
            <small>&copy; {new Date().getFullYear()} Todos los derechos reservados.</small>
          </div>
        </Col>
        <Col sm={9} md={10} className="main-content">
          <div className="d-flex justify-content-end mb-3">
            <Button variant="outline-primary" as={Link as any} to="/" className="me-2">🏠 Inicio</Button>
            <Button variant="outline-primary" as={Link as any} to="/dashboard" className="me-2">📊 Dashboard</Button>
            <Button variant="outline-primary" as={Link as any} to="/reports">📈 Informes</Button>
          </div>
          <Routes>
            <Route path="/" element={<HomePage userId={userId} selectedPeriod={selectedPeriod} />} />
            <Route path="/dashboard" element={<DashboardPage userId={userId} selectedPeriod={selectedPeriod} />} />
            <Route path="/students" element={<StudentsPage userId={userId} selectedPeriod={selectedPeriod} />} />
            <Route path="/attendance" element={<AttendancePage userId={userId} selectedPeriod={selectedPeriod} />} />
            <Route path="/participation" element={<ParticipationPage userId={userId} selectedPeriod={selectedPeriod} />} />
            <Route path="/mood" element={<MoodPage userId={userId} selectedPeriod={selectedPeriod} />} />
            <Route path="/reports" element={<ReportsPage userId={userId} selectedPeriod={selectedPeriod} />} />
          </Routes>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
