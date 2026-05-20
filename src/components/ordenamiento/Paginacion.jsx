import { Pagination } from "react-bootstrap";

const Paginacion = ({ paginaActual, totalPaginas, onCambiarPagina }) => {
  if (totalPaginas <= 1) return null;

  const paginas = [];
  for (let i = 1; i <= totalPaginas; i += 1) {
    paginas.push(
      <Pagination.Item
        key={i}
        active={i === paginaActual}
        onClick={() => onCambiarPagina(i)}
      >
        {i}
      </Pagination.Item>,
    );
  }

  return (
    <div className="d-flex justify-content-center mt-4">
      <Pagination>
        <Pagination.Prev
          onClick={() => onCambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
        />
        {paginas}
        <Pagination.Next
          onClick={() => onCambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
        />
      </Pagination>
    </div>
  );
};

export default Paginacion;
