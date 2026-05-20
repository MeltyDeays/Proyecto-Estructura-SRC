import { Form } from "react-bootstrap";

const FormCategoria = ({ categoria, onChange }) => {
  return (
    <Form>
      <Form.Group className="mb-4">
        <Form.Label>Nombre de la Categoria</Form.Label>
        <Form.Control
          type="text"
          name="nombre_categoria"
          value={categoria.nombre_categoria}
          onChange={onChange}
          placeholder="Ej: Electronica, Ropa..."
          autoFocus
        />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Descripcion</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="descripcion_categoria"
          value={categoria.descripcion_categoria}
          onChange={onChange}
          placeholder="Describe que productos pertenecen a esta categoria..."
        />
      </Form.Group>
    </Form>
  );
};

export default FormCategoria;
