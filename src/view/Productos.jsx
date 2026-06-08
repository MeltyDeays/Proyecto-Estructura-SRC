import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Button, Alert, Spinner, Card, Badge, Modal, Image } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import anime from "animejs/lib/anime.es.js";
import ModalRegistroProducto from "../components/productos/ModalRegistroProducto";
import ModalEdicionProducto from "../components/productos/ModalEdicionProducto";
import ModalEliminacionProducto from "../components/productos/ModalEliminacionProducto";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import ModalQRProducto from "../components/productos/modales/ModalQRProducto";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
  const [mostrarModalQR, setMostrarModalQR] = useState(false);
  const [productoQR, setProductoQR] = useState(null);

  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre_producto: "",
    descripcion_producto: "",
    precio_venta: "",
    id_categoria: "",
    archivo: null,
  });

  const [productoEditar, setProductoEditar] = useState({
    id_producto: "",
    nombre_producto: "",
    descripcion_producto: "",
    categoria_producto: "",
    precio_venta: "",
    url_imagen: "",
    archivo: null,
  });

  const [productoEliminar, setProductoEliminar] = useState(null);
  const [productoDetalle, setProductoDetalle] = useState(null);

  // Handlers para Registro
  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioArchivo = (e) => {
    const archivo = e.target.files[0];
    if (archivo && archivo.type.startsWith("image/")) {
      setNuevoProducto((prev) => ({ ...prev, archivo }));
    } else {
      alert("Selecciona una imagen válida (JPG, PNG, etc.)");
    }
  };

  // Handlers para Edición
  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setProductoEditar((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioArchivoActualizar = (e) => {
    const archivo = e.target.files[0];
    if (archivo && archivo.type.startsWith("image/")) {
      setProductoEditar((prev) => ({ ...prev, archivo }));
    } else {
      alert("Selecciona una imagen válida (JPG, PNG, etc.)");
    }
  };

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  const headerRef = useRef(null);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      await Promise.all([obtenerProductos(), cargarCategorias()]);
      setCargando(false);
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    // Header animation
    if (headerRef.current) {
      anime({
        targets: headerRef.current,
        translateY: [-20, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 800,
      });
    }
  }, []);

  useEffect(() => {
    // Cards animation when they load
    if (!cargando && productosFiltrados.length > 0) {
      anime({
        targets: '.producto-card',
        scale: [0.9, 1],
        opacity: [0, 1],
        translateY: [20, 0],
        easing: 'easeOutExpo',
        duration: 600,
        delay: anime.stagger(50)
      });
    }
  }, [cargando, productosFiltrados.length]);

  useEffect(() => {
    if (textoBusqueda.trim() === "") {
      setProductosFiltrados(productos);
    } else {
      const filtrados = productos.filter((p) => {
        const nombre = p.nombre_producto?.toLowerCase() || "";
        const descripcion = p.descripcion_producto?.toLowerCase() || "";
        const precio = p.precio_venta?.toString() || "";
        const termino = textoBusqueda.toLowerCase();
        return (
          nombre.includes(termino) ||
          descripcion.includes(termino) ||
          precio.includes(termino)
        );
      });
      setProductosFiltrados(filtrados);
    }
  }, [textoBusqueda, productos]);

  const obtenerProductos = async () => {
    try {
      const { data, error } = await supabase
        .from("productos")
        .select(`
          *,
          categorias (
            nombre_categoria
          )
        `)
        .order("id_producto", { ascending: false });

      if (error) throw error;
      console.log("Productos cargados:", data);
      setProductos(data || []);
      setProductosFiltrados(data || []);
    } catch (err) {
      console.error("Error al obtener productos:", err.message);
    }
  };

  const cargarCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("id_categoria", { ascending: true });
      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const agregarProducto = async () => {
    try {
      if (
        !nuevoProducto.nombre_producto ||
        !nuevoProducto.id_categoria ||
        !nuevoProducto.precio_venta ||
        !nuevoProducto.archivo
      ) {
        setToast({
          mostrar: true,
          mensaje: "Completa los campos obligatorios (nombre, categoría, precio e imagen).",
          tipo: "advertencia",
        });
        return;
      }

      setMostrarModal(false);

      const nombreArchivo = `${Date.now()}_${nuevoProducto.archivo.name}`;

      const { error: uploadError } = await supabase.storage
        .from("imagenes_productos")
        .upload(nombreArchivo, nuevoProducto.archivo);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("imagenes_productos")
        .getPublicUrl(nombreArchivo);

      const urlPublica = urlData.publicUrl;

      const { error: insertError } = await supabase.from("productos").insert([
        {
          nombre_producto: nuevoProducto.nombre_producto,
          descripcion_producto: nuevoProducto.descripcion_producto,
          categoria_producto: nuevoProducto.id_categoria,
          precio_venta: parseFloat(nuevoProducto.precio_venta),
          url_imagen: urlPublica,
        },
      ]);

      if (insertError) throw insertError;

      setToast({
        mostrar: true,
        mensaje: "Producto registrado correctamente",
        tipo: "exito",
      });

      setNuevoProducto({
        nombre_producto: "",
        descripcion_producto: "",
        precio_venta: "",
        id_categoria: "",
        archivo: null,
      });

      obtenerProductos();
    } catch (err) {
      console.error("Error al agregar producto:", err);
      setToast({ mostrar: true, mensaje: "Error al registrar producto", tipo: "error" });
    }
  };

  const actualizarProducto = async () => {
    try {
      if (!productoEditar.nombre_producto.trim() || !productoEditar.categoria_producto || !productoEditar.precio_venta) {
        setToast({ mostrar: true, mensaje: "Completa los campos obligatorios", tipo: "advertencia" });
        return;
      }

      setMostrarModalEdicion(false);

      let datosActualizados = {
        nombre_producto: productoEditar.nombre_producto,
        descripcion_producto: productoEditar.descripcion_producto || null,
        categoria_producto: productoEditar.categoria_producto,
        precio_venta: parseFloat(productoEditar.precio_venta),
        url_imagen: productoEditar.url_imagen,
      };

      if (productoEditar.archivo) {
        const nombreArchivo = `${Date.now()}_${productoEditar.archivo.name}`;
        const { error: uploadError } = await supabase.storage
          .from('imagenes_productos')
          .upload(nombreArchivo, productoEditar.archivo);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('imagenes_productos')
          .getPublicUrl(nombreArchivo);

        datosActualizados.url_imagen = urlData.publicUrl;

        if (productoEditar.url_imagen) {
          const nombreAnterior = productoEditar.url_imagen.split('/').pop().split('?')[0];
          await supabase.storage.from('imagenes_productos').remove([nombreAnterior]).catch(() => {});
        }
      }

      const { error } = await supabase
        .from('productos')
        .update(datosActualizados)
        .eq('id_producto', productoEditar.id_producto);

      if (error) throw error;

      await obtenerProductos();
      setProductoEditar({
        id_producto: null,
        nombre_producto: "",
        descripcion_producto: "",
        categoria_producto: "",
        precio_venta: "",
        url_imagen: "",
        archivo: null,
      });

      setToast({ mostrar: true, mensaje: "Producto actualizado correctamente", tipo: "exito" });
    } catch (error) {
      console.error("Error al actualizar: ", error);
      setToast({ mostrar: true, mensaje: "Error al actualizar producto", tipo: "error" });
    }
  };

  const eliminarProducto = async () => {
    try {
      const { error } = await supabase
        .from("productos")
        .delete()
        .eq("id_producto", productoEliminar.id_producto);

      if (error) throw error;

      setToast({ mostrar: true, mensaje: "Producto eliminado correctamente", tipo: "exito" });
      setMostrarModalEliminar(false);
      obtenerProductos();
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      setToast({ mostrar: true, mensaje: "Error al eliminar producto", tipo: "error" });
    }
  };

  const abrirModalEdicion = (prod) => {
    setProductoEditar({
      id_producto: prod.id_producto,
      nombre_producto: prod.nombre_producto,
      descripcion_producto: prod.descripcion_producto,
      categoria_producto: prod.categoria_producto,
      precio_venta: prod.precio_venta,
      url_imagen: prod.url_imagen,
      archivo: null,
    });
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminar = (prod) => {
    setProductoEliminar(prod);
    setMostrarModalEliminar(true);
  };

  const abrirModalDetalles = (prod) => {
    setProductoDetalle(prod);
    setMostrarModalDetalles(true);
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);
  };

  const copiarProducto = (producto) => {
    const texto = `Producto: ${producto.nombre_producto}\nPrecio: ${formatearPrecio(producto.precio_venta)}\nDescripción: ${producto.descripcion_producto || "Sin descripción"}\nImagen: ${producto.url_imagen || "Sin imagen"}`;
    navigator.clipboard.writeText(texto)
      .then(() => {
        setToast({ mostrar: true, mensaje: "Información del producto copiada al portapapeles.", tipo: "exito" });
      })
      .catch((err) => {
        console.error("Error al copiar:", err);
        setToast({ mostrar: true, mensaje: "Error al copiar al portapapeles.", tipo: "error" });
      });
  };

  const generarQRImagen = (prod) => {
    setProductoQR(prod);
    setMostrarModalQR(true);
  };

  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-3" ref={headerRef} style={{ opacity: 0 }}>
        <Col className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi-bag-heart-fill me-2"></i> Productos
          </h3>
        </Col>

        <Col xs={12} sm={6} md={5} lg={3} className="text-end">
          <Button onClick={() => setMostrarModal(true)} size="md">
            <i className="bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nuevo Producto</span>
          </Button>
        </Col>
      </Row>

      <hr />

      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por nombre, descripción o precio..."
          />
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Cargando productos...</p>
        </div>
      ) : productosFiltrados.length === 0 ? (
        <Alert variant="info" className="text-center">
          No se encontraron productos disponibles.
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} xl={4} className="g-4">
          {productosFiltrados.map((prod) => (
            <Col key={prod.id_producto} className="producto-card" style={{ opacity: 0 }}>
              <Card className="h-100 shadow-sm border-0 rounded-4 overflow-hidden hover-lift">
                <div style={{ height: "200px", overflow: "hidden", cursor: "pointer" }} onClick={() => abrirModalDetalles(prod)}>
                  <Card.Img
                    variant="top"
                    src={prod.url_imagen || "https://placehold.co/600x400?text=Sin+Imagen"}
                    className="h-100 w-100 object-fit-cover"
                  />
                </div>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge bg="info" className="text-dark">
                      {prod.categorias?.nombre_categoria || "General"}
                    </Badge>
                    <span className="fw-bold text-primary">
                      {formatearPrecio(prod.precio_venta)}
                    </span>
                  </div>
                  <Card.Title className="h5 fw-bold text-truncate">{prod.nombre_producto}</Card.Title>
                  <Card.Text className="text-muted small text-truncate-2">
                    {prod.descripcion_producto || "Sin descripción."}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="bg-white border-0 pb-3 d-flex gap-2">
                  <Button variant="outline-primary" size="sm" className="flex-grow-1 rounded-pill" onClick={() => abrirModalDetalles(prod)} title="Ver Detalles">
                    Detalles
                  </Button>
                  <Button variant="outline-secondary" size="sm" className="rounded-circle" onClick={() => copiarProducto(prod)} title="Copiar al portapapeles">
                    <i className="bi bi-clipboard"></i>
                  </Button>
                  <Button variant="outline-dark" size="sm" className="rounded-circle" onClick={() => generarQRImagen(prod)} title="Generar QR">
                    <i className="bi bi-qr-code"></i>
                  </Button>
                  <Button variant="outline-warning" size="sm" className="rounded-circle" onClick={() => abrirModalEdicion(prod)} title="Editar Producto">
                    <i className="bi-pencil"></i>
                  </Button>
                  <Button variant="outline-danger" size="sm" className="rounded-circle" onClick={() => abrirModalEliminar(prod)} title="Eliminar Producto">
                    <i className="bi-trash"></i>
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal de Registro */}
      <ModalRegistroProducto
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoProducto={nuevoProducto}
        manejoCambioInput={manejoCambioInput}
        manejoCambioArchivo={manejoCambioArchivo}
        agregarProducto={agregarProducto}
        categorias={categorias}
      />

      {/* Modal de Edición */}
      <ModalEdicionProducto 
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        productoEditar={productoEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        manejoCambioArchivoActualizar={manejoCambioArchivoActualizar}
        actualizarProducto={actualizarProducto}
        categorias={categorias}
      />

      {/* Modal de Eliminación */}
      <ModalEliminacionProducto 
        mostrarModal={mostrarModalEliminar}
        setMostrarModal={setMostrarModalEliminar}
        productoEliminar={productoEliminar}
        eliminarProducto={eliminarProducto}
      />

      {/* Modal QR de Producto */}
      <ModalQRProducto
        mostrarModalQR={mostrarModalQR}
        setMostrarModalQR={setMostrarModalQR}
        productoQR={productoQR}
      />

      {/* Modal de Detalles */}
      <Modal show={mostrarModalDetalles} onHide={() => setMostrarModalDetalles(false)} centered size="md">
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Image src={productoDetalle?.url_imagen} fluid className="rounded-4 mb-3 shadow-sm" style={{ maxHeight: "300px" }} />
          <h4 className="fw-bold">{productoDetalle?.nombre_producto}</h4>
          <Badge bg="info" className="text-dark mb-2">{productoDetalle?.categorias?.nombre_categoria}</Badge>
          <p className="text-primary fw-bold h5">{formatearPrecio(productoDetalle?.precio_venta || 0)}</p>
          <hr />
          <p className="text-muted text-start px-3">{productoDetalle?.descripcion_producto || "Sin descripción disponible."}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModalDetalles(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </Container>
  );
};

export default Productos;