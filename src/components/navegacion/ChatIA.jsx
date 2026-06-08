import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Table, Spinner } from "react-bootstrap";
import { supabase } from "../../database/supabaseconfig";

const ChatIA = ({ mostrar, setMostrar }) => {
  const [mensajes, setMensajes] = useState([
    {
      tipo: "ia",
      texto: "¡Hola! Soy el asistente inteligente de Discosa. ¿En qué te puedo ayudar hoy? Puedes consultarme sobre ventas, clientes, productos o estadísticas."
    }
  ]);
  const [entrada, setEntrada] = useState("");
  const [cargando, setCargando] = useState(false);
  const finChatRef = useRef(null);

  useEffect(() => {
    if (finChatRef.current) {
      finChatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensajes, cargando]);

  const obtenerSQL = (texto) => {
    const t = texto.toLowerCase().trim();
    if (t.startsWith("select ") || t.startsWith("with ")) {
      return texto;
    }
    if (t.includes("venta") || t.includes("factura") || t.includes("transaccion")) {
      return "SELECT * FROM ventas";
    }
    if (t.includes("cliente") || t.includes("comprador")) {
      return "SELECT * FROM clientes";
    }
    if (t.includes("producto") || t.includes("articulo") || t.includes("inventario") || t.includes("stock")) {
      return "SELECT * FROM productos";
    }
    if (t.includes("categoria")) {
      return "SELECT * FROM categorias";
    }
    if (t.includes("empleado")) {
      return "SELECT * FROM empleados";
    }
    return null;
  };

  const enviarConsulta = async () => {
    if (!entrada.trim()) return;

    const consulta = entrada;
    setEntrada("");
    setMensajes((prev) => [...prev, { tipo: "usuario", texto: consulta }]);
    setCargando(true);

    const querySQL = obtenerSQL(consulta);

    if (!querySQL) {
      setMensajes((prev) => [
        ...prev,
        {
          tipo: "ia",
          texto: "No he podido traducir tu consulta a SQL. Intenta con frases simples como: 'mostrar ventas', 'listar clientes', 'ver productos' o escribe directamente tu consulta SELECT."
        }
      ]);
      setCargando(false);
      return;
    }

    try {
      // Invocación a la función segura en base de datos
      const { data, error } = await supabase.rpc("ejecutar_consulta_segura", { query_sql: querySQL });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // La función retorna filas en una propiedad "datos" que contiene cada registro como JSON
        const filas = data.map(item => item.datos);
        const columnas = Object.keys(filas[0]);
        setMensajes((prev) => [
          ...prev,
          {
            tipo: "ia",
            texto: `Consulta SQL ejecutada: \`${querySQL}\``,
            columnas,
            datos: filas
          }
        ]);
      } else {
        setMensajes((prev) => [
          ...prev,
          {
            tipo: "ia",
            texto: `La consulta \`${querySQL}\` se ejecutó pero no devolvió resultados.`
          }
        ]);
      }
    } catch (err) {
      console.warn("Error de conexión o RPC, ejecutando fallback mock:", err);
      await new Promise((resolve) => setTimeout(resolve, 850));

      const queryLower = consulta.toLowerCase();
      let respuestaIA = { tipo: "ia", texto: "" };

      if (queryLower.includes("venta") || queryLower.includes("factura") || queryLower.includes("transaccion")) {
        respuestaIA.texto = "Previsualización local (Servidor fuera de línea): ventas registradas en el sistema:";
        respuestaIA.columnas = ["id_venta", "fecha_venta", "cliente", "empleado", "metodo_pago", "total"];
        respuestaIA.datos = [
          { id_venta: 101, fecha_venta: "2026-06-08 10:15", cliente: "Juan Pérez", empleado: "Suyen Gómez", metodo_pago: "efectivo", total: "C$ 1,450.00" },
          { id_venta: 102, fecha_venta: "2026-06-08 11:30", cliente: "Ana Leyton", empleado: "Suyen Gómez", metodo_pago: "tarjeta", total: "C$ 850.00" },
          { id_venta: 103, fecha_venta: "2026-06-08 12:45", cliente: "Carlos Meza", empleado: "Carlos Ruiz", metodo_pago: "transferencia", total: "C$ 3,200.00" },
          { id_venta: 104, fecha_venta: "2026-06-08 14:00", cliente: "María Espinoza", empleado: "Carlos Ruiz", metodo_pago: "efectivo", total: "C$ 450.00" }
        ];
      } else if (queryLower.includes("cliente") || queryLower.includes("comprador")) {
        respuestaIA.texto = "Previsualización local (Servidor fuera de línea): clientes en la base de datos:";
        respuestaIA.columnas = ["id_cliente", "nombre_cliente", "apellido_cliente", "celular"];
        respuestaIA.datos = [
          { id_cliente: 1, nombre_cliente: "Juan", apellido_cliente: "Pérez", celular: "505 8844 1122" },
          { id_cliente: 2, nombre_cliente: "Ana", apellido_cliente: "Leyton", celular: "505 7766 5544" },
          { id_cliente: 3, nombre_cliente: "Carlos", apellido_cliente: "Meza", celular: "505 8899 0011" },
          { id_cliente: 4, nombre_cliente: "María", apellido_cliente: "Espinoza", celular: "505 5544 3322" }
        ];
      } else if (queryLower.includes("producto") || queryLower.includes("articulo") || queryLower.includes("inventario") || queryLower.includes("stock")) {
        respuestaIA.texto = "Previsualización local (Servidor fuera de línea): productos en catálogo:";
        respuestaIA.columnas = ["id_producto", "nombre_producto", "precio_venta", "categoria"];
        respuestaIA.datos = [
          { id_producto: 1, nombre_producto: "Gaseosa Coca-Cola 2L", precio_venta: "C$ 45.00", categoria: "Bebidas" },
          { id_producto: 2, nombre_producto: "Gaseosa Pepsi 2L", precio_venta: "C$ 40.00", categoria: "Bebidas" },
          { id_producto: 3, nombre_producto: "Jugo Del Valle 1L", precio_venta: "C$ 35.00", categoria: "Jugos" },
          { id_producto: 4, nombre_producto: "Agua Purificada 1.5L", precio_venta: "C$ 20.00", categoria: "Agua" }
        ];
      } else if (queryLower.includes("categoria")) {
        respuestaIA.texto = "Previsualización local (Servidor fuera de línea): categorías de productos:";
        respuestaIA.columnas = ["id_categoria", "nombre_categoria"];
        respuestaIA.datos = [
          { id_categoria: 1, nombre_categoria: "Bebidas" },
          { id_categoria: 2, nombre_categoria: "Jugos" },
          { id_categoria: 3, nombre_categoria: "Agua" }
        ];
      } else if (queryLower.includes("empleado")) {
        respuestaIA.texto = "Previsualización local (Servidor fuera de línea): empleados registrados:";
        respuestaIA.columnas = ["id_empleado", "nombre", "apellido", "cargo"];
        respuestaIA.datos = [
          { id_empleado: 1, nombre: "Suyen", apellido: "Gómez", cargo: "Vendedora" },
          { id_empleado: 2, nombre: "Carlos", apellido: "Ruiz", cargo: "Administrador" }
        ];
      } else {
        respuestaIA.texto = "No se pudo conectar a la base de datos de Supabase. Para demostración local, puedes consultar sobre 'ventas', 'clientes', 'productos', 'categorias' o 'empleados'.";
      }

      setMensajes((prev) => [...prev, respuestaIA]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal show={mostrar} onHide={() => setMostrar(false)} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-cpu me-2 text-primary"></i> Asistente de Inteligencia Artificial
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="d-flex flex-column" style={{ height: "500px", backgroundColor: "var(--bg-main)" }}>
          <div className="flex-grow-1 p-3 overflow-auto" style={{ maxHeight: "430px", backgroundColor: "var(--bg-main)" }}>
            {mensajes.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-3 d-flex flex-column ${
                  msg.tipo === "usuario" ? "align-items-end" : "align-items-start"
                }`}
              >
                <div
                  className={`p-3 rounded-3`}
                  style={{
                    maxWidth: "85%",
                    border: "2px solid var(--border-main)",
                    boxShadow: "3px 3px 0px var(--border-main)",
                    backgroundColor: msg.tipo === "usuario" ? "var(--primary)" : "#ffffff"
                  }}
                >
                  <div className="mb-1 fw-medium" style={{ color: msg.tipo === "usuario" ? "#ffffff" : "var(--text-main)" }}>{msg.texto}</div>
                  {msg.columnas && msg.columnas.length > 0 && (
                    <Table
                      striped
                      bordered
                      hover
                      size="sm"
                      variant={msg.tipo === "usuario" ? "dark" : "light"}
                      className="mt-2 text-wrap bg-white"
                    >
                      <thead>
                        <tr>
                          {msg.columnas.map((col, i) => (
                            <th key={i}>{col.replace(/_/g, ' ')}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {msg.datos.map((fila, i) => (
                          <tr key={i}>
                            {msg.columnas.map((col, j) => (
                              <td key={j}>{fila[col]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              </div>
            ))}

            {cargando && (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" /> Procesando consulta...
              </div>
            )}
            <div ref={finChatRef} />
          </div>

          <Form onSubmit={(e) => { e.preventDefault(); enviarConsulta(); }} style={{ width: "100%" }}>
            <div className="d-flex gap-2 p-3" style={{ borderTop: "2px solid var(--border-main)", backgroundColor: "var(--bg-main)" }}>
              <Form.Control
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                placeholder="Escribe tu consulta en lenguaje natural..."
                disabled={cargando}
                style={{ border: "2px solid var(--border-main)", borderRadius: "6px" }}
              />
              <Button 
                variant="primary" 
                onClick={enviarConsulta} 
                disabled={cargando || !entrada.trim()}
                className="btn-rounded py-2"
                style={{ minWidth: "100px" }}
              >
                Enviar
              </Button>
            </div>
          </Form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ChatIA;
