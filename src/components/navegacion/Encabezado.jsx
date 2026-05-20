import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Nav, Navbar, Offcanvas, Button } from "react-bootstrap";
import logo from "../../assets/react.svg";
import { useAuth } from "../../context/AuthContext";

const Encabezado = () => {
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Para detectar la ruta actual
  const { tienePermiso, logout, usuario } = useAuth();

  const manejarToggle = () => setMostrarMenu(!mostrarMenu);

  const manejarNavegacion = (ruta) => {
    navigate(ruta);
    setMostrarMenu(false);
  };

  const cerrarSesion = async () => {
    await logout();
    setMostrarMenu(false);
    navigate("/login");
  };

  // Detectar rutas especiales
  const esLogin = location.pathname === "/login";
  const esCatalogo = location.pathname === "/catalogo" && !usuario;

  // Contenido del menú
  let contenidoMenu;

  const estaLogueado = !!usuario;

  if (esLogin) {
    contenidoMenu = (
      <Nav className="ms-auto pe-2">
        <Nav.Link 
          onClick={() => manejarNavegacion("/login")} 
          className={`nav-link-custom ${location.pathname === '/login' ? 'nav-link-active' : ''}`}
        >
          <i className="bi-person-fill-lock me-2"></i> Iniciar sesión
        </Nav.Link>
      </Nav>
    );
  } else if (!estaLogueado) {
    // Menú para visitantes (Solo Catálogo e Inicio si es necesario)
    contenidoMenu = (
      <Nav className="ms-auto align-items-lg-center gap-1">
        <Nav.Link 
          onClick={() => manejarNavegacion("/catalogo")} 
          className={`nav-link-custom ${location.pathname === '/catalogo' ? 'nav-link-active' : ''}`}
        >
          <i className="bi-layout-text-window-reverse me-2"></i> Catálogo Público
        </Nav.Link>
        <Nav.Link 
          onClick={() => manejarNavegacion("/login")} 
          className={`nav-link-custom ${location.pathname === '/login' ? 'nav-link-active' : ''}`}
        >
          <i className="bi-person-circle me-2"></i> Acceso Admin
        </Nav.Link>
      </Nav>
    );
  } else {
    // Menú para administradores autenticados
    contenidoMenu = (
      <Nav className="ms-auto align-items-lg-center gap-1">
        {tienePermiso('ver_inicio') && (
          <Nav.Link 
            onClick={() => manejarNavegacion("/")} 
            className={`nav-link-custom ${location.pathname === '/' ? 'nav-link-active' : ''}`}
          >
            <i className="bi-house-fill me-2"></i> Inicio
          </Nav.Link>
        )}
        {tienePermiso('ver_categorias') && (
          <Nav.Link 
            onClick={() => manejarNavegacion("/categorias")} 
            className={`nav-link-custom ${location.pathname === '/categorias' ? 'nav-link-active' : ''}`}
          >
            <i className="bi-grid-fill me-2"></i> Categorías
          </Nav.Link>
        )}
        {tienePermiso('ver_productos') && (
          <Nav.Link 
            onClick={() => manejarNavegacion("/productos")} 
            className={`nav-link-custom ${location.pathname === '/productos' ? 'nav-link-active' : ''}`}
          >
            <i className="bi-box-seam-fill me-2"></i> Productos
          </Nav.Link>
        )}
        {tienePermiso('ver_empleados') && (
          <Nav.Link 
            onClick={() => manejarNavegacion("/empleados")} 
            className={`nav-link-custom ${location.pathname === '/empleados' ? 'nav-link-active' : ''}`}
          >
            <i className="bi-person-badge-fill me-2"></i> Empleados
          </Nav.Link>
        )}
        {tienePermiso('ver_permisos') && (
          <Nav.Link 
            onClick={() => manejarNavegacion("/permisos")} 
            className={`nav-link-custom ${location.pathname === '/permisos' ? 'nav-link-active' : ''}`}
          >
            <i className="bi-shield-lock-fill me-2"></i> Permisos
          </Nav.Link>
        )}
        {tienePermiso('ver_catalogo') && (
          <Nav.Link 
            onClick={() => manejarNavegacion("/catalogo")} 
            className={`nav-link-custom ${location.pathname === '/catalogo' ? 'nav-link-active' : ''}`}
          >
            <i className="bi-layout-text-window-reverse me-2"></i> Catálogo
          </Nav.Link>
        )}
        <Button 
          variant="outline-light" 
          className="btn-rounded border-0 ms-lg-2 opacity-75 hover-lift"
          onClick={cerrarSesion}
          title="Cerrar Sesión"
        >
          <i className="bi-box-arrow-right h5 mb-0"></i>
        </Button>
      </Nav>
    );
  }

  return (
    <Navbar 
      expand="lg" 
      variant="dark" 
      className="color-navbar shadow-sm sticky-top py-3"
      style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(16, 104, 219, 0.95) !important' }}
    >
      <Container>
        <Navbar.Brand 
          onClick={() => manejarNavegacion("/")} 
          className="d-flex align-items-center cursor-pointer"
          style={{ cursor: 'pointer' }}
        >
          <div className="bg-white p-2 rounded-3 me-2 shadow-sm d-flex align-items-center justify-content-center">
            <img 
              src={logo} 
              alt="Logo" 
              width="24" 
              height="24" 
              className="d-inline-block align-top"
            />
          </div>
          <span className="fw-bold tracking-wider text-white h4 mb-0">Discosa</span>
        </Navbar.Brand>

        <Navbar.Toggle 
          aria-controls="offcanvasNavbar" 
          onClick={manejarToggle}
          className="border-0 shadow-none"
        />

        <Navbar.Offcanvas
          show={mostrarMenu}
          onHide={() => setMostrarMenu(false)}
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          placement="end"
          className="bg-primary text-white"
        >
          <Offcanvas.Header closeButton closeVariant="white" className="border-bottom border-white border-opacity-10">
            <Offcanvas.Title id="offcanvasNavbarLabel" className="fw-bold">
              Menú Principal
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            {contenidoMenu}
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
};

export default Encabezado;