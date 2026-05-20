import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import FormCategoria from "../formularios/FormCategoria";

const ModalEdicionCategoria = ({
  mostrarModal,
  setMostrarModal,
  categoriaEditar,
  manejoCambioInputEditar,
  actualizarCategoria,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleActualizar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await actualizarCategoria();
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
          <i className="bi-pencil-square me-2 text-primary"></i> Editar Categoria
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body-custom">
        <FormCategoria categoria={categoriaEditar} onChange={manejoCambioInputEditar} />
      </Modal.Body>
      <Modal.Footer className="modal-footer-custom">
        <Button variant="secondary" onClick={() => setMostrarModal(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleActualizar}
          disabled={categoriaEditar.nombre_categoria.trim() === "" || deshabilitado}
        >
          {deshabilitado ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Actualizando...
            </>
          ) : (
            "Actualizar Categoria"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionCategoria;
