import React, { useRef } from "react";
import { Modal, Button, Image } from "react-bootstrap";
import QRCode from "react-qr-code";

const ModalQRProducto = ({ mostrarModalQR, setMostrarModalQR, productoQR }) => {
  const qrWrapperRef = useRef(null);

  if (!productoQR) return null;

  const qrValue = productoQR.url_imagen || JSON.stringify({
    id: productoQR.id_producto,
    nombre: productoQR.nombre_producto,
    precio: productoQR.precio_venta,
    stock: productoQR.stock_actual
  });

  const copiarQRComoImagen = () => {
    try {
      if (!qrWrapperRef.current) return;
      const svgElement = qrWrapperRef.current.querySelector("svg");
      if (!svgElement) return;

      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 250;
        canvas.height = 250;
        const context = canvas.getContext("2d");
        
        // Fondo blanco para el QR
        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar SVG en canvas
        context.drawImage(image, 25, 25, 200, 200);
        
        canvas.toBlob(async (blob) => {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob })
            ]);
            alert("¡Imagen del Código QR copiada al portapapeles!");
          } catch (err) {
            console.error("Error al copiar imagen al portapapeles:", err);
            alert("No se pudo copiar la imagen automáticamente.");
          }
        }, "image/png");
      };
      image.src = blobURL;
    } catch (error) {
      console.error("Fallo al procesar copia de QR:", error);
    }
  };

  return (
    <Modal show={mostrarModalQR} onHide={() => setMostrarModalQR(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-qr-code me-2 text-primary"></i> Código QR del Producto
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center p-4" style={{ backgroundColor: "var(--bg-main)" }}>
        {productoQR.url_imagen && (
          <div className="mb-3">
            <Image
              src={productoQR.url_imagen}
              alt={productoQR.nombre_producto}
              fluid
              rounded
              style={{
                maxHeight: "150px",
                objectFit: "cover",
                border: "2px solid var(--border-main)",
                boxShadow: "4px 4px 0px var(--border-main)",
              }}
            />
          </div>
        )}
        <h5 className="mb-3 fw-bold">{productoQR.nombre_producto}</h5>
        <div 
          ref={qrWrapperRef}
          className="p-3 d-inline-block bg-white" 
          style={{ border: "2px solid var(--border-main)", boxShadow: "4px 4px 0px var(--border-main)", borderRadius: "8px" }}
        >
          <QRCode value={qrValue} size={200} />
        </div>
        <div className="mt-3 text-muted small">
          Escanea este código QR para ver la imagen y los detalles del producto en tu dispositivo.
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={copiarQRComoImagen} className="btn-rounded me-2">
          <i className="bi bi-clipboard-plus me-1"></i> Copiar Imagen QR
        </Button>
        <Button variant="secondary" onClick={() => setMostrarModalQR(false)}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalQRProducto;
