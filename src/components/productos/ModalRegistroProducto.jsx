import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, InputGroup } from "react-bootstrap";

const ModalRegistroProducto = ({
  mostrarModal,
  setMostrarModal,
  categorias,
  nuevoProducto,
  manejoCambioInput,
  agregarProducto,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleRegistrar = async (e) => {
    e.preventDefault();
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarProducto();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
      contentClassName="modal-content-custom"
    >
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title>
          <i className="bi-box-seam-fill me-2 text-primary"></i> Registrar Nuevo Producto
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body-custom">
        <Form onSubmit={handleRegistrar}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label>Nombre del Producto</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre_producto"
                  value={nuevoProducto.nombre_producto}
                  onChange={manejoCambioInput}
                  placeholder="Ej: Laptop Pro 16"
                  required
                  autoFocus
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label>Categoría</Form.Label>
                <Form.Select
                  name="id_categoria"
                  value={nuevoProducto.id_categoria}
                  onChange={manejoCambioInput}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre_categoria}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descripcion_producto"
              value={nuevoProducto.descripcion_producto}
              onChange={manejoCambioInput}
              placeholder="Describe las características principales..."
            />
          </Form.Group>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-4">
                <Form.Label>Precio</Form.Label>
                <InputGroup className="input-group-custom">
                  <InputGroup.Text className="bg-white border-end-0">$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="precio_producto"
                    className="border-start-0"
                    value={nuevoProducto.precio_producto}
                    onChange={manejoCambioInput}
                    placeholder="0.00"
                    required
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-4">
                <Form.Label>Stock Inicial</Form.Label>
                <Form.Control
                  type="number"
                  name="stock_producto"
                  value={nuevoProducto.stock_producto}
                  onChange={manejoCambioInput}
                  placeholder="0"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-4">
                <Form.Label>URL Imagen</Form.Label>
                <Form.Control
                  type="url"
                  name="imagen_url"
                  value={nuevoProducto.imagen_url}
                  onChange={manejoCambioInput}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setMostrarModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={deshabilitado}
            >
              {deshabilitado ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </>
              ) : "Guardar Producto"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalRegistroProducto;