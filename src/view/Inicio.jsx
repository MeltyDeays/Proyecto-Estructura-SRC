import React from "react";
import { Container, Row, Col, Button, Card, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "../assets/hero.png";

const Inicio = () => {
  const navigate = useNavigate();

  // Variantes para animaciones fluidas con Framer Motion (Física de resortes)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 40, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 12,
      },
    },
    hover: {
      y: -6,
      x: -2,
      boxShadow: "6px 6px 0px #352520",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17,
      },
    },
  };

  return (
    <div className="animate-fade-in pb-5">
      {/* Hero Section - Estilo Editorial Cálido */}
      <Container className="py-5 my-4">
        <Row className="align-items-center g-5">
          <Col lg={6}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="d-flex flex-column gap-3"
            >
              <motion.div variants={itemVariants}>
                <Badge bg="white" className="text-primary rounded px-3 py-2 fw-bold shadow-sm">
                  ★ Plataforma de Gestión v2.0
                </Badge>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h1 className="display-3 fw-bold mb-0 text-uppercase" style={{ letterSpacing: "-1px", lineHeight: "1.05" }}>
                  Tu Inventario, <br />
                  <span className="text-primary">Simplificado.</span>
                </h1>
              </motion.div>

              <motion.div variants={itemVariants}>
                <p className="lead text-muted mb-4" style={{ maxWidth: "480px" }}>
                  Gestiona tus productos, categorías y permisos de forma profesional con nuestra plataforma moderna, rápida y segura basada en Supabase.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="d-flex gap-3">
                <Button
                  variant="primary"
                  className="btn-rounded text-white shadow px-4 py-2"
                  onClick={() => navigate("/productos")}
                >
                  Ver Inventario <i className="bi-arrow-right ms-2"></i>
                </Button>
                <Button
                  variant="outline-light"
                  className="btn-rounded px-4"
                  onClick={() => navigate("/categorias")}
                >
                  Categorías
                </Button>
              </motion.div>

              <motion.div 
                variants={itemVariants} 
                className="d-flex flex-wrap gap-4 mt-4 border-top pt-4 border-2 border-opacity-10" 
                style={{ borderColor: "#352520" }}
              >
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-cpu-fill text-primary h5 mb-0"></i>
                  <span className="small fw-semibold">Base de Datos Supabase Activa</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-shield-lock-fill text-primary h5 mb-0"></i>
                  <span className="small fw-semibold">Control de Permisos por Roles</span>
                </div>
              </motion.div>
            </motion.div>
          </Col>

          <Col lg={6} className="d-none d-lg-block">
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.3 }}
              className="border border-2 border-dark rounded-4 overflow-hidden shadow-sm hover-lift"
              style={{ boxShadow: "4px 4px 0px #352520" }}
            >
              <img src={heroImage} alt="Dashboard Preview" className="img-fluid w-100" style={{ objectFit: "cover" }} />
            </motion.div>
          </Col>
        </Row>
      </Container>

      {/* Características / Estadísticas */}
      <Container className="mb-5">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Row className="g-4 text-center">
            <Col md={4}>
              <motion.div variants={cardVariants} whileHover="hover" className="h-100">
                <Card className="border-2 rounded-3 h-100 p-4 cursor-pointer">
                  <div className="bg-primary bg-opacity-10 icon-circle mx-auto mb-3">
                    <i className="bi-lightning-charge-fill text-primary h3 mb-0"></i>
                  </div>
                  <h4 className="fw-bold text-uppercase">Velocidad Real</h4>
                  <p className="text-muted small mb-0">
                    Consultas optimizadas para una respuesta instantánea en tu gestión diaria.
                  </p>
                </Card>
              </motion.div>
            </Col>

            <Col md={4}>
              <motion.div variants={cardVariants} whileHover="hover" className="h-100">
                <Card className="border-2 rounded-3 h-100 p-4 cursor-pointer">
                  <div className="bg-success bg-opacity-10 icon-circle mx-auto mb-3">
                    <i className="bi-shield-check text-success h3 mb-0"></i>
                  </div>
                  <h4 className="fw-bold text-uppercase">Seguridad Total</h4>
                  <p className="text-muted small mb-0">
                    Tus datos están protegidos con políticas de seguridad de grado industrial (RLS).
                  </p>
                </Card>
              </motion.div>
            </Col>

            <Col md={4}>
              <motion.div variants={cardVariants} whileHover="hover" className="h-100">
                <Card className="border-2 rounded-3 h-100 p-4 cursor-pointer">
                  <div className="bg-info bg-opacity-10 icon-circle mx-auto mb-3">
                    <i className="bi-grid-fill text-info h3 mb-0"></i>
                  </div>
                  <h4 className="fw-bold text-uppercase">Control Total</h4>
                  <p className="text-muted small mb-0">
                    Organiza todo por categorías para mantener tu catálogo siempre ordenado.
                  </p>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </Container>
    </div>
  );
};

export default Inicio;
