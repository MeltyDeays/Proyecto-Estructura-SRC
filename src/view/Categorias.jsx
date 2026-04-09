import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Spinner, Alert, Badge } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";
import NotificacionOperacion from "../components/NotificacionOperacion";

const Categorias = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [mostrarModal, setMostrarModal] = useState(false);

  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre_categoria: "",
    descripcion_categoria: "",
  });

  useEffect(() => {
    obtenerCategorias();
  }, []);

  const obtenerCategorias = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("creado_el", { ascending: false });

      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error("Error al obtener categorías:", err.message);
      setError("No se pudieron cargar las categorías.");
    } finally {
      setCargando(false);
    }
  };

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevaCategoria((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const agregarCategoria = async () => {
    try {
      if (!nuevaCategoria.nombre_categoria.trim() || !nuevaCategoria.descripcion_categoria.trim()) {
        setToast({ mostrar: true, mensaje: "Debe llenar todos los campos.", tipo: "advertencia" });
        return;
      }

      const { error } = await supabase.from("categorias").insert([
        {
          nombre_categoria: nuevaCategoria.nombre_categoria,
          descripcion_categoria: nuevaCategoria.descripcion_categoria,
        },
      ]);

      if (error) throw error;

      // 1. Cerrar el modal MANUALMENTE primero para evitar conflictos de renderizado
      setMostrarModal(false);

      // 2. Limpieza de campos
      setNuevaCategoria({ nombre_categoria: "", descripcion_categoria: "" });

      // 3. Notificación de éxito
      setToast({
        mostrar: true,
        mensaje: `Categoría "${nuevaCategoria.nombre_categoria}" registrada exitosamente.`,
        tipo: "exito",
      });
      
      // 4. Recarga de datos
      obtenerCategorias();
    } catch (err) {
      console.error("Excepción al agregar categoría:", err.message);
      setToast({ mostrar: true, mensaje: "Error al registrar categoría.", tipo: "error" });
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section for Categorias */}
      <div className="bg-primary bg-gradient text-white py-5 mb-5 shadow-sm rounded-bottom-5 position-relative">
        <Container className="py-4">
          <Row className="align-items-center">
            <Col md={8} className="animate-fade-in-up">
              <Badge bg="white" className="text-primary rounded-pill px-3 py-2 mb-3 fw-bold shadow-sm">
                Organización de Inventario
              </Badge>
              <h1 className="display-4 fw-bold mb-2">Gestión de <span className="text-info">Categorías</span></h1>
              <p className="lead opacity-75 mb-0">
                Clasifica tus productos para un acceso rápido y un control total de tu stock.
              </p>
            </Col>
            <Col md={4} className="text-end d-none d-md-block animate-fade-in-up delay-1">
              <Button
                variant="info"
                onClick={() => setMostrarModal(true)}
                className="btn-rounded text-white shadow-lg px-4 py-2 h5 mb-0"
              >
                <i className="bi-plus-lg me-2"></i> Nueva Categoría
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="mb-5">
        {/* Floating action button for mobile */}
        <div className="d-md-none text-center mb-4">
          <Button
            variant="primary"
            onClick={() => setMostrarModal(true)}
            className="btn-rounded shadow px-4"
          >
            <i className="bi-plus-lg me-2"></i> Nueva Categoría
          </Button>
        </div>

        {/* Listado de Categorías con UX mejorada */}
        {cargando ? (
          <div className="text-center py-5 animate-fade-in">
            <Spinner animation="grow" variant="primary" />
            <p className="mt-3 text-muted fw-medium">Sincronizando categorías...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center shadow-sm rounded-4 animate-fade-in-up">
            <i className="bi-exclamation-triangle-fill me-2"></i> {error}
          </Alert>
        ) : categorias.length === 0 ? (
          <Card className="text-center border-0 bg-light py-5 shadow-sm rounded-4 animate-fade-in-up">
            <Card.Body>
              <i className="bi-inbox text-muted display-1 mb-3"></i>
              <h4 className="text-muted fw-bold">No hay categorías registradas</h4>
              <p className="text-muted mb-4 px-3">Comienza agregando una nueva categoría para organizar tu inventario de forma profesional.</p>
              <Button variant="primary" className="btn-rounded" onClick={() => setMostrarModal(true)}>
                Crear mi primera categoría
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row xs={1} sm={2} lg={3} className="g-4">
            {categorias.map((cat, index) => (
              <Col key={cat.id_categoria} className={`animate-fade-in-up delay-${(index % 3) + 1}`}>
                <Card className="h-100 border-0 shadow-sm hover-lift rounded-4 overflow-hidden glass-card">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3" style={{ transition: '0.3s' }}>
                        <i className="bi-tag-fill text-primary h4 mb-0"></i>
                      </div>
                      <h5 className="card-title fw-bold mb-0 text-truncate text-dark">{cat.nombre_categoria}</h5>
                    </div>
                    <p className="card-text text-muted small line-clamp-3 mb-0" style={{ lineHeight: '1.6' }}>
                      {cat.descripcion_categoria || "Sin descripción disponible."}
                    </p>
                  </Card.Body>
                  <Card.Footer className="bg-transparent border-0 p-4 pt-0 d-flex justify-content-between align-items-center">
                     <small className="text-muted fw-medium opacity-75">
                      <i className="bi-calendar3 me-1"></i>
                      {new Date(cat.creado_el).toLocaleDateString()}
                     </small>
                     <Button 
                        variant="link" 
                        className="text-primary p-0 text-decoration-none fw-bold small"
                        onClick={() => navigate('/productos', { state: { categoriaId: cat.id_categoria } })}
                      >
                        Ver productos <i className="bi-arrow-right ms-1"></i>
                     </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Modal de Registro */}
        <ModalRegistroCategoria
          mostrarModal={mostrarModal}
          setMostrarModal={setMostrarModal}
          nuevaCategoria={nuevaCategoria}
          manejoCambioInput={manejoCambioInput}
          agregarCategoria={agregarCategoria}
        />

        {/* Notificación */}
        <NotificacionOperacion
          mostrar={toast.mostrar}
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onCerrar={() => setToast({ ...toast, mostrar: false })}
        />
      </Container>
    </div>
  );
};

export default Categorias;