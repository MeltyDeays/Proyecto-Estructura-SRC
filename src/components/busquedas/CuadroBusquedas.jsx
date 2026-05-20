import { Form, InputGroup } from "react-bootstrap";

const CuadroBusquedas = ({ textoBusqueda, manejarCambioBusqueda, placeholder = "Buscar..." }) => {
  return (
    <InputGroup className="mb-3">
      <InputGroup.Text>
        <i className="bi-search"></i>
      </InputGroup.Text>
      <Form.Control
        type="text"
        value={textoBusqueda}
        onChange={manejarCambioBusqueda}
        placeholder={placeholder}
      />
    </InputGroup>
  );
};

export default CuadroBusquedas;
