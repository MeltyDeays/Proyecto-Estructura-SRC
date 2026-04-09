import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Button, Card, Spinner, Alert, Badge, Modal } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import ModalRegistroProducto from "../components/productos/ModalRegistroProducto";
import NotificacionOperacion from "../components/NotificacionOperacion";

const Productos = () => {
  const location = useLocation();
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState(location.state?.categoriaId || null);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre_producto: "",
    descripcion_producto: "",
    precio_producto: "",
    stock_producto: "",
    id_categoria: "",
    imagen_url: "",
  });

  useEffect(() => {
    inicializarVista();
  }, []);

  useEffect(() => {
    if (filtroCategoria) {
      setProductosFiltrados(productos.filter(p => p.id_categoria === filtroCategoria));
    } else {
      setProductosFiltrados(productos);
    }
  }, [filtroCategoria, productos]);

  const inicializarVista = async () => {
    setCargando(true);
    await Promise.all([obtenerProductos(), obtenerCategorias()]);
    setCargando(false);
  };

  const obtenerProductos = async () => {
    try {
      const { data, error } = await supabase
        .from("productos")
        .select("*, categorias(nombre_categoria)")
        .order("creado_el", { ascending: false });

      if (error) throw error;
      setProductos(data || []);
    } catch (err) {
      console.error("Error al obtener productos:", err.message);
      setError("No se pudieron cargar los productos.");
    }
  };

  const obtenerCategorias = async () => {
    try {
      const { data, error } = await supabase.from("categorias").select("*");
      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error("Error al obtener categorías:", err.message);
    }
  };

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: value }));
  };

  const agregarProducto = async () => {
    try {
      const { error } = await supabase.from("productos").insert([
        {
          nombre_producto: nuevoProducto.nombre_producto,
          descripcion_producto: nuevoProducto.descripcion_producto,
          precio_producto: parseFloat(nuevoProducto.precio_producto),
          stock_producto: parseInt(nuevoProducto.stock_producto),
          id_categoria: nuevoProducto.id_categoria,
          imagen_url: nuevoProducto.imagen_url,
        },
      ]);

      if (error) throw error;

      // 1. Mostrar notificación PRIMERO
      setToast({
        mostrar: true,
        mensaje: `Producto "${nuevoProducto.nombre_producto}" registrado correctamente.`,
        tipo: "exito",
      });

      // 2. Limpiar formulario
      setNuevoProducto({
        nombre_producto: "",
        descripcion_producto: "",
        precio_producto: "",
        stock_producto: "",
        id_categoria: "",
        imagen_url: "",
      });

      // 3. Cerrar el modal MANUALMENTE
      setMostrarModal(false);

      // 4. Refrescar datos
      obtenerProductos();
    } catch (err) {
      console.error("Error al agregar producto:", err.message);
      setToast({ mostrar: true, mensaje: "Error al registrar el producto.", tipo: "error" });
    }
  };

  const verDetalles = (producto) => {
    setProductoSeleccionado(producto);
    setMostrarDetalles(true);
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section for Productos */}
      <div className="bg-primary bg-gradient text-white py-5 mb-5 shadow-sm rounded-bottom-5 position-relative">
        <Container className="py-4">
          <Row className="align-items-center">
            <Col md={8} className="animate-fade-in-up">
              <Badge bg="white" className="text-primary rounded-pill px-3 py-2 mb-3 fw-bold shadow-sm">
                Control de Inventario
              </Badge>
              <h1 className="display-4 fw-bold mb-2">Gestión de <span className="text-info">Productos</span></h1>
              <p className="lead opacity-75 mb-0">
                Administra tu catálogo de productos con precisión y facilidad.
              </p>
            </Col>
            <Col md={4} className="text-end d-none d-md-block animate-fade-in-up delay-1">
              <Button
                variant="info"
                onClick={() => setMostrarModal(true)}
                className="btn-rounded text-white shadow-lg px-4 py-2 h5 mb-0"
              >
                <i className="bi-plus-lg me-2"></i> Nuevo Producto
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
            <i className="bi-plus-lg me-2"></i> Nuevo Producto
          </Button>
        </div>

        {filtroCategoria && (
          <Alert variant="info" className="d-flex justify-content-between align-items-center rounded-4 mb-4 animate-fade-in border-0 shadow-sm bg-primary bg-opacity-10 text-primary">
            <span className="fw-medium">
              <i className="bi-funnel-fill me-2"></i>
              Mostrando: <strong>{categorias.find(c => c.id_categoria === filtroCategoria)?.nombre_categoria}</strong>
            </span>
            <Button variant="primary" size="sm" className="btn-rounded px-3 shadow-sm" onClick={() => setFiltroCategoria(null)}>
              Ver todos
            </Button>
          </Alert>
        )}

        {cargando ? (
          <div className="text-center py-5 animate-fade-in">
            <Spinner animation="grow" variant="primary" />
            <p className="mt-3 text-muted fw-medium">Sincronizando inventario...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center rounded-4 animate-fade-in-up shadow-sm">
            <i className="bi-exclamation-triangle-fill me-2"></i> {error}
          </Alert>
        ) : productosFiltrados.length === 0 ? (
          <Card className="text-center border-0 bg-light py-5 shadow-sm rounded-4 animate-fade-in-up">
            <Card.Body>
              <i className="bi-box text-muted display-1 mb-3"></i>
              <h4 className="text-muted fw-bold">No hay productos en esta selección</h4>
              <p className="text-muted mb-4">Comienza agregando productos para gestionar tu catálogo.</p>
              <Button variant="primary" className="btn-rounded" onClick={() => setMostrarModal(true)}>
                Agregar mi primer producto
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
            {productosFiltrados.map((prod, index) => (
              <Col key={prod.id_producto} className={`animate-fade-in-up delay-${(index % 3) + 1}`}>
                <Card className="h-100 border-0 shadow-sm hover-lift rounded-4 overflow-hidden glass-card">
                  <div className="position-relative overflow-hidden" style={{ height: "200px" }}>
                    <Card.Img
                      variant="top"
                      src={prod.imagen_url || "https://placehold.co/600x400?text=Sin+Imagen"}
                      className="h-100 w-100 object-fit-cover transition-all"
                    />
                    <Badge bg="primary" className="position-absolute top-0 end-0 m-3 shadow-sm rounded-pill px-3 py-2">
                      ${prod.precio_producto.toFixed(2)}
                    </Badge>
                  </div>
                  <Card.Body className="p-4">
                    <div className="mb-2 text-primary small fw-bold text-uppercase tracking-wider">
                      {prod.categorias?.nombre_categoria || "General"}
                    </div>
                    <h5 className="card-title fw-bold text-dark mb-2 text-truncate">{prod.nombre_producto}</h5>
                    <p className="card-text text-muted small line-clamp-3 mb-0" style={{ minHeight: "3.6em" }}>
                      {prod.descripcion_producto || "Sin descripción disponible."}
                    </p>
                  </Card.Body>
                  <Card.Footer className="bg-transparent border-0 p-4 pt-0 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <i className={`bi-circle-fill me-2 small ${prod.stock_producto > 5 ? "text-success" : "text-danger"}`}></i>
                      <span className="small fw-bold text-muted">{prod.stock_producto} en stock</span>
                    </div>
                    <Button variant="outline-primary" size="sm" className="btn-rounded px-3" onClick={() => verDetalles(prod)}>
                      Detalles
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <ModalRegistroProducto
          mostrarModal={mostrarModal}
          setMostrarModal={setMostrarModal}
          categorias={categorias}
          nuevoProducto={nuevoProducto}
          manejoCambioInput={manejoCambioInput}
          agregarProducto={agregarProducto}
        />

        {/* Modal de Detalles */}
        <Modal 
          show={mostrarDetalles} 
          onHide={() => setMostrarDetalles(false)} 
          centered 
          size="md"
          contentClassName="modal-content-custom"
        >
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>
              <i className="bi-info-circle-fill me-2 text-primary"></i> Detalles del Producto
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body-custom text-center">
            {productoSeleccionado && (
              <div className="animate-fade-in">
                <div className="position-relative mb-4 overflow-hidden rounded-4 shadow-sm" style={{ height: '250px' }}>
                  <img 
                    src={productoSeleccionado.imagen_url || "https://placehold.co/600x400?text=Sin+Imagen"} 
                    alt={productoSeleccionado.nombre_producto}
                    className="h-100 w-100 object-fit-cover hover-lift transition-all"
                  />
                  <Badge bg="primary" className="position-absolute top-0 end-0 m-3 shadow-sm rounded-pill px-3 py-2">
                    ${productoSeleccionado.precio_producto.toFixed(2)}
                  </Badge>
                </div>
                
                <div className="mb-2 text-primary small fw-bold text-uppercase tracking-wider">
                  {productoSeleccionado.categorias?.nombre_categoria || "General"}
                </div>
                <h3 className="fw-bold text-dark mb-3">{productoSeleccionado.nombre_producto}</h3>
                
                <Row className="g-3 mb-4">
                  <Col xs={6}>
                    <div className="p-3 bg-light rounded-4 border border-white shadow-sm h-100">
                      <div className="small text-muted text-uppercase fw-bold mb-1">Precio Unitario</div>
                      <div className="h4 fw-bold text-primary mb-0">${productoSeleccionado.precio_producto.toFixed(2)}</div>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className={`p-3 rounded-4 border border-white shadow-sm h-100 ${productoSeleccionado.stock_producto > 5 ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
                      <div className="small text-muted text-uppercase fw-bold mb-1">Stock Disponible</div>
                      <div className={`h4 fw-bold mb-0 ${productoSeleccionado.stock_producto > 5 ? 'text-success' : 'text-danger'}`}>
                        {productoSeleccionado.stock_producto} <small className="h6">uds</small>
                      </div>
                    </div>
                  </Col>
                </Row>
                
                <div className="text-start">
                  <div className="small text-muted text-uppercase fw-bold mb-2 ps-1">Descripción del Producto</div>
                  <div className="p-3 bg-white border rounded-4 text-muted small shadow-inner" style={{ minHeight: '80px', background: 'linear-gradient(to bottom, #ffffff, #f9fafb)' }}>
                    {productoSeleccionado.descripcion_producto || "Sin descripción adicional disponible para este producto."}
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="modal-footer-custom">
            <Button variant="primary" className="w-100 py-2 fw-bold" onClick={() => setMostrarDetalles(false)}>
              Entendido
            </Button>
          </Modal.Footer>
        </Modal>

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

export default Productos;