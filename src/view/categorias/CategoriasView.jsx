import { Alert, Badge, Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import CuadroBusquedas from "../../components/busquedas/CuadroBusquedas";
import Paginacion from "../../components/ordenamiento/Paginacion";
import ModalRegistroCategoria from "../../components/categorias/modales/ModalRegistroCategoria";
import ModalEdicionCategoria from "../../components/categorias/modales/ModalEdicionCategoria";
import ModalEliminacionCategoria from "../../components/categorias/modales/ModalEliminacionCategoria";
import NotificacionOperacion from "../../components/NotificacionOperacion";
import TablaCategorias from "../../components/categorias/TablaCategorias";

const CategoriasView = ({
  cargando,
  error,
  toast,
  setToast,
  categoriasFiltradas,
  categoriasPaginadas,
  totalPaginas,
  paginaActual,
  setPaginaActual,
  textoBusqueda,
  manejoCambioBusqueda,
  mostrarModalRegistro,
  setMostrarModalRegistro,
  nuevaCategoria,
  manejoCambioInput,
  agregarCategoria,
  mostrarModalEdicion,
  setMostrarModalEdicion,
  categoriaEditar,
  manejoCambioInputEditar,
  prepararEdicion,
  actualizarCategoria,
  mostrarModalEliminacion,
  setMostrarModalEliminacion,
  categoriaAEliminar,
  prepararEliminacion,
  eliminarCategoria,
  irAProductosDeCategoria,
  generarPDFCategoria,
  generarPDFTodasCategorias,
}) => {
  return (
    <div className="animate-fade-in">
      <div className="py-5 mb-5 position-relative">
        <Container className="py-4">
          <Row className="align-items-center">
            <Col md={8} className="animate-fade-in-up">
              <Badge bg="white" className="text-primary rounded-pill px-3 py-2 mb-3 fw-bold shadow-sm">
                Organizacion de Inventario
              </Badge>
              <h1 className="display-4 fw-bold mb-2">
                Gestion de <span className="text-info">Categorias</span>
              </h1>
              <p className="lead opacity-75 mb-0">
                Clasifica tus productos para un acceso rapido y un control total de tu stock.
              </p>
            </Col>
             <Col md={4} className="text-end d-none d-md-block animate-fade-in-up delay-1">
              <Button
                variant="outline-danger"
                onClick={() => generarPDFTodasCategorias(categoriasFiltradas)}
                className="btn-rounded shadow px-4 py-2 h5 mb-0 me-2"
              >
                <i className="bi-file-earmark-pdf me-2"></i> Exportar PDF
              </Button>
              <Button
                variant="info"
                onClick={() => setMostrarModalRegistro(true)}
                className="btn-rounded text-white shadow-lg px-4 py-2 h5 mb-0"
              >
                <i className="bi-plus-lg me-2"></i> Nueva Categoria
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="mb-5">
        <div className="d-md-none text-center mb-4 d-flex justify-content-center gap-2">
          <Button
            variant="outline-danger"
            onClick={() => generarPDFTodasCategorias(categoriasFiltradas)}
            className="btn-rounded shadow px-4"
          >
            <i className="bi-file-earmark-pdf me-2"></i> Exportar PDF
          </Button>
          <Button
            variant="primary"
            onClick={() => setMostrarModalRegistro(true)}
            className="btn-rounded shadow px-4"
          >
            <i className="bi-plus-lg me-2"></i> Nueva Categoria
          </Button>
        </div>

        <hr className="mb-4" />
        <CuadroBusquedas
          valor={textoBusqueda}
          onChange={manejoCambioBusqueda}
          placeholder="Buscar por nombre o descripcion..."
        />

        {!cargando && !error && categoriasFiltradas.length === 0 && (
          <Alert variant="warning" className="rounded-4">
            No se encontraron categorias con el criterio de busqueda.
          </Alert>
        )}

        {cargando ? (
          <div className="text-center py-5 animate-fade-in">
            <Spinner animation="grow" variant="primary" />
            <p className="mt-3 text-muted fw-medium">Sincronizando categorias...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center shadow-sm rounded-4 animate-fade-in-up">
            <i className="bi-exclamation-triangle-fill me-2"></i> {error}
          </Alert>
        ) : categoriasPaginadas.length === 0 ? (
          <Card className="text-center border-0 bg-light py-5 shadow-sm rounded-4 animate-fade-in-up">
            <Card.Body>
              <i className="bi-inbox text-muted display-1 mb-3"></i>
              <h4 className="text-muted fw-bold">No hay categorias registradas</h4>
              <p className="text-muted mb-4 px-3">
                Comienza agregando una nueva categoria para organizar tu inventario de forma profesional.
              </p>
              <Button variant="primary" className="btn-rounded" onClick={() => setMostrarModalRegistro(true)}>
                Crear mi primera categoria
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <TablaCategorias
            categorias={categoriasPaginadas}
            abrirModalEdicion={prepararEdicion}
            abrirModalEliminacion={prepararEliminacion}
            generarPDFCategoria={generarPDFCategoria}
          />
        )}

        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onCambiarPagina={setPaginaActual}
        />

        <ModalRegistroCategoria
          mostrarModal={mostrarModalRegistro}
          setMostrarModal={setMostrarModalRegistro}
          nuevaCategoria={nuevaCategoria}
          manejoCambioInput={manejoCambioInput}
          agregarCategoria={agregarCategoria}
        />

        <ModalEdicionCategoria
          mostrarModal={mostrarModalEdicion}
          setMostrarModal={setMostrarModalEdicion}
          categoriaEditar={categoriaEditar}
          manejoCambioInputEditar={manejoCambioInputEditar}
          actualizarCategoria={actualizarCategoria}
        />

        <ModalEliminacionCategoria
          mostrarModal={mostrarModalEliminacion}
          setMostrarModal={setMostrarModalEliminacion}
          categoriaAEliminar={categoriaAEliminar}
          eliminarCategoria={eliminarCategoria}
        />

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

export default CategoriasView;
