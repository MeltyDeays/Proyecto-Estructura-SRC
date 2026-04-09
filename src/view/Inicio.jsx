import React from "react";
import { Container, Row, Col, Button, Card, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/hero.png";

const Inicio = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="bg-primary bg-gradient text-white py-5 mb-5 shadow-sm rounded-bottom-5 overflow-hidden position-relative" 
           style={{ borderBottomLeftRadius: '3rem', borderBottomRightRadius: '3rem' }}>
        <Container className="py-4">
          <Row className="align-items-center">
            <Col lg={6} className="animate-fade-in-up">
              <Badge bg="white" className="text-primary rounded-pill px-3 py-2 mb-3 fw-bold shadow-sm">
                ¡Bienvenido a Discosa!
              </Badge>
              <h1 className="display-3 fw-bold mb-3">Tu Inventario, <br/><span className="text-info">Simplificado.</span></h1>
              <p className="lead mb-4 opacity-75">
                Gestiona tus productos y categorías de forma profesional con nuestra plataforma moderna y segura basada en Supabase.
              </p>
              <div className="d-flex gap-3">
                <Button variant="info" className="btn-rounded text-white shadow" onClick={() => navigate('/productos')}>
                  Ver Inventario <i className="bi-arrow-right ms-2"></i>
                </Button>
                <Button variant="outline-light" className="btn-rounded" onClick={() => navigate('/categorias')}>
                  Categorías
                </Button>
              </div>
            </Col>
            <Col lg={6} className="d-none d-lg-block animate-fade-in-up delay-2">
              <img src={heroImage} alt="Hero" className="img-fluid rounded-4 shadow-lg hover-lift" />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Stats / Features */}
      <Container className="mb-5">
        <Row className="g-4 text-center">
          <Col md={4} className="animate-fade-in-up delay-1">
            <Card className="border-0 shadow-sm rounded-4 h-100 p-4 hover-lift glass-card">
              <div className="bg-primary bg-opacity-10 d-inline-block p-3 rounded-circle mb-3">
                <i className="bi-lightning-charge-fill text-primary h3 mb-0"></i>
              </div>
              <h4 className="fw-bold">Velocidad Real</h4>
              <p className="text-muted small mb-0">Consultas optimizadas para una respuesta instantánea en tu gestión diaria.</p>
            </Card>
          </Col>
          <Col md={4} className="animate-fade-in-up delay-2">
            <Card className="border-0 shadow-sm rounded-4 h-100 p-4 hover-lift glass-card">
              <div className="bg-success bg-opacity-10 d-inline-block p-3 rounded-circle mb-3">
                <i className="bi-shield-check text-success h3 mb-0"></i>
              </div>
              <h4 className="fw-bold">Seguridad Total</h4>
              <p className="text-muted small mb-0">Tus datos están protegidos con políticas de seguridad de grado industrial.</p>
            </Card>
          </Col>
          <Col md={4} className="animate-fade-in-up delay-3">
            <Card className="border-0 shadow-sm rounded-4 h-100 p-4 hover-lift glass-card">
              <div className="bg-info bg-opacity-10 d-inline-block p-3 rounded-circle mb-3">
                <i className="bi-grid-fill text-info h3 mb-0"></i>
              </div>
              <h4 className="fw-bold">Control Total</h4>
              <p className="text-muted small mb-0">Organiza todo por categorías para mantener tu catálogo siempre ordenado.</p>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Inicio;
