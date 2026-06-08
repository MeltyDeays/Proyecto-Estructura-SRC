import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalEnvioCorreoCategorias = ({
  mostrarModalCorreo,
  setMostrarModalCorreo,
  emailDestino,
  setEmailDestino,
  enviandoCorreo,
  enviarCorreoCategorias,
  totalCategorias
}) => {
  return (
    <Modal show={mostrarModalCorreo} onHide={() => setMostrarModalCorreo(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-envelope-open me-2 text-primary"></i> Enviar Categorías por Correo
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: "var(--bg-main)" }}>
        <Form.Group className="mb-3">
          <Form.Label className="fw-bold">Correo Destino</Form.Label>
          <Form.Control
            type="email"
            placeholder="ejemplo@correo.com"
            value={emailDestino}
            onChange={(e) => setEmailDestino(e.target.value)}
          />
        </Form.Group>
        <div className="p-2 text-center rounded bg-white" style={{ border: "2px solid var(--border-main)" }}>
          <small className="text-muted fw-bold">
            Se enviará el listado completo de <span className="text-primary">{totalCategorias}</span> categorías.
          </small>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModalCorreo(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={enviarCorreoCategorias}
          disabled={enviandoCorreo}
        >
          {enviandoCorreo ? "Enviando..." : "Enviar Correo"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEnvioCorreoCategorias;
