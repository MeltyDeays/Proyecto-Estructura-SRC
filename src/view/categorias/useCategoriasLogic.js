import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../database/supabaseconfig";

const categoriaInicial = { nombre_categoria: "", descripcion_categoria: "" };
const ITEMS_POR_PAGINA = 6;

const useCategoriasLogic = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });

  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);

  const [nuevaCategoria, setNuevaCategoria] = useState(categoriaInicial);
  const [categoriaEditar, setCategoriaEditar] = useState({ id_categoria: null, ...categoriaInicial });
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);

  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const obtenerCategorias = async () => {
    try {
      setCargando(true);
      setError(null);
      const { data, error: errorConsulta } = await supabase
        .from("categorias")
        .select("*")
        .order("creado_el", { ascending: false });

      if (errorConsulta) throw errorConsulta;
      setCategorias(data || []);
    } catch (err) {
      console.error("Error al obtener categorias:", err.message);
      setError("No se pudieron cargar las categorias.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerCategorias();
  }, []);

  const categoriasFiltradas = useMemo(() => {
    const texto = textoBusqueda.trim().toLowerCase();
    if (!texto) return categorias;

    return categorias.filter((cat) =>
      `${cat.nombre_categoria || ""} ${cat.descripcion_categoria || ""}`
        .toLowerCase()
        .includes(texto),
    );
  }, [categorias, textoBusqueda]);

  const totalPaginas = Math.max(1, Math.ceil(categoriasFiltradas.length / ITEMS_POR_PAGINA));

  useEffect(() => {
    setPaginaActual(1);
  }, [textoBusqueda]);

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  const categoriasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    const fin = inicio + ITEMS_POR_PAGINA;
    return categoriasFiltradas.slice(inicio, fin);
  }, [categoriasFiltradas, paginaActual]);

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevaCategoria((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioInputEditar = (e) => {
    const { name, value } = e.target;
    setCategoriaEditar((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  const agregarCategoria = async () => {
    try {
      if (!nuevaCategoria.nombre_categoria.trim() || !nuevaCategoria.descripcion_categoria.trim()) {
        setToast({ mostrar: true, mensaje: "Debe llenar todos los campos.", tipo: "advertencia" });
        return;
      }

      const { error: errorInsercion } = await supabase.from("categorias").insert([nuevaCategoria]);
      if (errorInsercion) throw errorInsercion;

      setMostrarModalRegistro(false);
      setToast({
        mostrar: true,
        mensaje: `Categoria "${nuevaCategoria.nombre_categoria}" registrada exitosamente.`,
        tipo: "exito",
      });
      setNuevaCategoria(categoriaInicial);
      await obtenerCategorias();
    } catch (err) {
      console.error("Excepcion al agregar categoria:", err.message);
      setToast({ mostrar: true, mensaje: "Error al registrar categoria.", tipo: "error" });
    }
  };

  const prepararEdicion = (categoria) => {
    setCategoriaEditar({
      id_categoria: categoria.id_categoria,
      nombre_categoria: categoria.nombre_categoria || "",
      descripcion_categoria: categoria.descripcion_categoria || "",
    });
    setMostrarModalEdicion(true);
  };

  const actualizarCategoria = async () => {
    try {
      if (!categoriaEditar.id_categoria) return;
      if (!categoriaEditar.nombre_categoria.trim() || !categoriaEditar.descripcion_categoria.trim()) {
        setToast({ mostrar: true, mensaje: "Debe llenar todos los campos.", tipo: "advertencia" });
        return;
      }

      const { error: errorActualizacion } = await supabase
        .from("categorias")
        .update({
          nombre_categoria: categoriaEditar.nombre_categoria,
          descripcion_categoria: categoriaEditar.descripcion_categoria,
        })
        .eq("id_categoria", categoriaEditar.id_categoria);

      if (errorActualizacion) throw errorActualizacion;

      setMostrarModalEdicion(false);
      setToast({
        mostrar: true,
        mensaje: `Categoria "${categoriaEditar.nombre_categoria}" actualizada correctamente.`,
        tipo: "exito",
      });
      await obtenerCategorias();
    } catch (err) {
      console.error("Error al actualizar categoria:", err.message);
      setToast({ mostrar: true, mensaje: "Error al actualizar categoria.", tipo: "error" });
    }
  };

  const prepararEliminacion = (categoria) => {
    setCategoriaAEliminar(categoria);
    setMostrarModalEliminacion(true);
  };

  const eliminarCategoria = async () => {
    try {
      if (!categoriaAEliminar?.id_categoria) return;

      const { error: errorEliminacion } = await supabase
        .from("categorias")
        .delete()
        .eq("id_categoria", categoriaAEliminar.id_categoria);

      if (errorEliminacion) throw errorEliminacion;

      setMostrarModalEliminacion(false);
      setToast({
        mostrar: true,
        mensaje: `Categoria "${categoriaAEliminar.nombre_categoria}" eliminada correctamente.`,
        tipo: "exito",
      });
      setCategoriaAEliminar(null);
      await obtenerCategorias();
    } catch (err) {
      console.error("Error al eliminar categoria:", err.message);
      setToast({ mostrar: true, mensaje: "Error al eliminar categoria.", tipo: "error" });
    }
  };

  const irAProductosDeCategoria = (idCategoria) => {
    navigate("/productos", { state: { categoriaId: idCategoria } });
  };

  return {
    navigate,
    cargando,
    error,
    toast,
    setToast,
    categoriasFiltradas,
    categoriasPaginadas,
    totalPaginas,
    paginaActual,
    setPaginaActual,
    textoBusqueda,
    manejoCambioBusqueda,
    mostrarModalRegistro,
    setMostrarModalRegistro,
    nuevaCategoria,
    manejoCambioInput,
    agregarCategoria,
    mostrarModalEdicion,
    setMostrarModalEdicion,
    categoriaEditar,
    manejoCambioInputEditar,
    prepararEdicion,
    actualizarCategoria,
    mostrarModalEliminacion,
    setMostrarModalEliminacion,
    categoriaAEliminar,
    prepararEliminacion,
    eliminarCategoria,
    irAProductosDeCategoria,
  };
};

export default useCategoriasLogic;
