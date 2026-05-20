import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import FormCategoria from "../formularios/FormCategoria";

const ModalRegistroCategoria = ({
  mostrarModal,
  setMostrarModal,
  nuevaCategoria,
  manejoCambioInput,
  agregarCategoria,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleRegistrar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarCategoria();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      backdrop="static"
      keyboard={false}
      centered
      animation
      contentClassName="modal-content-custom"
    >
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title>
          <i className="bi-tag-fill me-2 text-primary"></i> Nueva Categoria
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body-custom">
        <FormCategoria categoria={nuevaCategoria} onChange={manejoCambioInput} />
      </Modal.Body>
      <Modal.Footer className="modal-footer-custom">
        <Button variant="secondary" onClick={() => setMostrarModal(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleRegistrar}
          disabled={nuevaCategoria.nombre_categoria.trim() === "" || deshabilitado}
        >
          {deshabilitado ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Guardando...
            </>
          ) : (
            "Guardar Categoria"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroCategoria;
