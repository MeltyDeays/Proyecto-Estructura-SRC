import { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminacionCategoria = ({
  mostrarModal,
  setMostrarModal,
  categoriaAEliminar,
  eliminarCategoria,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleEliminar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await eliminarCategoria();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      backdrop="static"
      keyboard={false}
      centered
      contentClassName="modal-content-custom"
    >
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title>
          <i className="bi-trash-fill me-2 text-danger"></i> Eliminar Categoria
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body-custom">
        <p className="mb-2">
          Esta accion eliminara la categoria <strong>{categoriaAEliminar?.nombre_categoria}</strong>.
        </p>
        <p className="text-muted mb-0">Esta operacion no se puede deshacer.</p>
      </Modal.Body>
      <Modal.Footer className="modal-footer-custom">
        <Button variant="secondary" onClick={() => setMostrarModal(false)}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleEliminar} disabled={deshabilitado}>
          {deshabilitado ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Eliminando...
            </>
          ) : (
            "Eliminar Categoria"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminacionCategoria;
