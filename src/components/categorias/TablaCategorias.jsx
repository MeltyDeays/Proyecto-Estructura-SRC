import React from "react";
import { Table, Button } from "react-bootstrap";

const TablaCategorias = ({ 
  categorias,
  abrirModalEdicion,
  abrirModalEliminacion,
  generarPDFCategoria,
  copiarCategoria
}) => {
  return (
    <Table striped hover responsive className="align-middle shadow-sm rounded-4 overflow-hidden">
      <thead className="table-light">
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Descripción</th>
          <th className="text-center" style={{ width: "150px" }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {categorias.map((categoria) => (
          <tr key={categoria.id_categoria}>
            <td><strong>{categoria.id_categoria}</strong></td>
            <td>{categoria.nombre_categoria}</td>
            <td>{categoria.descripcion_categoria || "Sin descripción"}</td>
            <td className="text-center">
              <div className="d-flex justify-content-center align-items-center gap-1">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="rounded-circle"
                  onClick={() => abrirModalEdicion(categoria)}
                  title="Editar Categoría"
                >
                  <i className="bi bi-pencil"></i>
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="rounded-circle"
                  onClick={() => abrirModalEliminacion(categoria)}
                  title="Eliminar Categoría"
                >
                  <i className="bi bi-trash"></i>
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="rounded-circle"
                  onClick={() => generarPDFCategoria(categoria)}
                  title="Generar PDF"
                >
                  <i className="bi bi-file-earmark-pdf"></i>
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="rounded-circle"
                  onClick={() => copiarCategoria(categoria)}
                  title="Copiar al portapapeles"
                >
                  <i className="bi bi-clipboard"></i>
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaCategorias;
