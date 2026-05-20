import React from "react";
import { Modal, Button, Alert } from "react-bootstrap";

const ModalEliminacionProducto = ({
  mostrarModal,
  setMostrarModal,
  productoEliminar,
  eliminarProducto,
}) => {
  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      centered
    >
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title>Eliminar Producto</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Alert variant="danger">
          ¿Estás seguro de que deseas eliminar el producto: <strong>{productoEliminar?.nombre_producto}</strong>?
          <br /><br />
          Esta acción no se puede deshacer.
        </Alert>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModal(false)}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={eliminarProducto}>
          Eliminar Definitivamente
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminacionProducto;
