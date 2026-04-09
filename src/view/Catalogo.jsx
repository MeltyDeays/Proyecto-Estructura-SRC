import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner, Badge, Form, InputGroup, Button } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("productos")
        .select("*, categorias(nombre_categoria)")
        .order("creado_el", { ascending: false });

      if (error) throw error;
      setProductos(data || []);
    } catch (err) {
      console.error("Error al obtener catálogo:", err.message);
    } finally {
      setCargando(false);
    }
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre_producto.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categorias?.nombre_categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="bg-primary bg-gradient text-white py-5 mb-5 shadow-sm rounded-bottom-5">
        <Container className="py-4 text-center">
          <Badge bg="white" className="text-primary rounded-pill px-3 py-2 mb-3 fw-bold shadow-sm">
            Catálogo Público
          </Badge>
          <h1 className="display-4 fw-bold mb-3">Nuestros <span className="text-info">Productos</span></h1>
          <p className="lead opacity-75 mb-4">Explora nuestra selección exclusiva de artículos de alta calidad.</p>
          
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <div className="position-relative">
                <InputGroup className="shadow-lg rounded-pill overflow-hidden border-0 bg-white p-1">
                  <InputGroup.Text className="bg-transparent border-0 ps-4">
                    <i className="bi bi-search text-primary h5 mb-0"></i>
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Busca el producto perfecto..."
                    className="border-0 py-3 ps-2 shadow-none h5 mb-0 fw-normal"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                  {busqueda && (
                    <Button 
                      variant="link" 
                      className="text-muted pe-4 text-decoration-none"
                      onClick={() => setBusqueda("")}
                    >
                      <i className="bi bi-x-circle-fill"></i>
                    </Button>
                  )}
                </InputGroup>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="mb-5">
        {cargando ? (
          <div className="text-center py-5">
            <Spinner animation="grow" variant="primary" />
            <p className="mt-3 text-muted fw-medium">Cargando catálogo...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-5 opacity-50">
            <i className="bi bi-search display-1 mb-3"></i>
            <h4>No encontramos lo que buscas</h4>
            <p>Intenta con otros términos de búsqueda.</p>
          </div>
        ) : (
          <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
            {productosFiltrados.map((prod, index) => (
              <Col key={prod.id_producto} className={`animate-fade-in-up delay-${(index % 3) + 1}`}>
                <Card className="h-100 border-0 shadow-sm hover-lift rounded-4 overflow-hidden glass-card">
                  <div className="position-relative" style={{ height: "220px" }}>
                    <Card.Img
                      variant="top"
                      src={prod.imagen_url || "https://placehold.co/600x400?text=Producto"}
                      className="h-100 w-100 object-fit-cover"
                    />
                    <Badge bg="primary" className="position-absolute top-0 end-0 m-3 shadow-sm rounded-pill px-3 py-2">
                      ${prod.precio_producto.toFixed(2)}
                    </Badge>
                  </div>
                  <Card.Body className="p-4">
                    <div className="mb-2 text-primary small fw-bold text-uppercase tracking-wider">
                      {prod.categorias?.nombre_categoria || "General"}
                    </div>
                    <h5 className="card-title fw-bold text-dark mb-2">{prod.nombre_producto}</h5>
                    <p className="card-text text-muted small line-clamp-3 mb-0">
                      {prod.descripcion_producto || "Sin descripción."}
                    </p>
                  </Card.Body>
                  <Card.Footer className="bg-transparent border-0 p-4 pt-0">
                    <div className="d-flex align-items-center text-muted small fw-bold">
                      <i className={`bi bi-circle-fill me-2 ${prod.stock_producto > 0 ? 'text-success' : 'text-danger'}`}></i>
                      {prod.stock_producto > 0 ? 'Disponible' : 'Agotado'}
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Catalogo;
