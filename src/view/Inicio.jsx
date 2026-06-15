import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Card, Spinner, Form, Button } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { supabase } from "../database/supabaseconfig";
import * as XLSX from 'xlsx';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

const Inicio = () => {
  const [cargando, setCargando] = useState(true);
  const [fechaDesde, setFechaDesde] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "America/Managua" })
  );
  const [fechaHasta, setFechaHasta] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "America/Managua" })
  );

  const graficoHoraRef = useRef(null);
  const graficoCategoriaRef = useRef(null);

  const [estadisticas, setEstadisticas] = useState({
    totalVentas: 0,
    ventasEfectivo: 0,
    ventasTarjeta: 0,
    productosVendidos: 0,
    montoProductos: 0,
    cantidadVentas: 0,
    ventasPorHora: [],
    ventasPorCategoria: []
  });

  useEffect(() => {
    cargarDatos(fechaDesde, fechaHasta);
  }, [fechaDesde, fechaHasta]);

  const cargarDatos = async (desde, hasta) => {
    try {
      setCargando(true);
      const inicioRango = `${desde} 00:00:00`;
      const finRango = `${hasta} 23:59:59`;

      const { data: ventas, error } = await supabase
        .from("ventas")
        .select("id_venta, total, fecha_venta, metodo_pago")
        .gte("fecha_venta", inicioRango)
        .lte("fecha_venta", finRango);

      if (error) throw error;

      const idsVentas = ventas?.map((v) => v.id_venta) || [];

      let productosVendidos = 0;
      let montoProductos = 0;
      let ventasPorCategoria = [];

      if (idsVentas.length > 0) {
        const { data: detalles } = await supabase
          .from("detalles_ventas")
          .select(`
            cantidad,
            subtotal,
            productos (
              nombre_producto,
              categorias (nombre_categoria)
            )
          `)
          .in("id_venta", idsVentas);

        detalles?.forEach((d) => {
          productosVendidos += d.cantidad || 0;
          montoProductos += d.subtotal || 0;

          const categoria = d.productos?.categorias?.nombre_categoria || "Sin categoría";
          const existente = ventasPorCategoria.find((c) => c.name === categoria);

          if (existente) {
            existente.value += d.subtotal || 0;
          } else {
            ventasPorCategoria.push({ name: categoria, value: d.subtotal || 0 });
          }
        });

        ventasPorCategoria.sort((a, b) => b.value - a.value);
      }

      const totalVentas = ventas?.reduce((sum, v) => sum + (v.total || 0), 0) || 0;
      const ventasEfectivo =
        ventas
          ?.filter((v) => v.metodo_pago === "efectivo")
          .reduce((sum, v) => sum + (v.total || 0), 0) || 0;
      const ventasTarjeta =
        ventas
          ?.filter((v) => v.metodo_pago === "tarjeta")
          .reduce((sum, v) => sum + (v.total || 0), 0) || 0;

      const horaMap = Array(24).fill(0);
      ventas?.forEach((venta) => {
        if (!venta.fecha_venta) return;
        const hora = new Date(venta.fecha_venta).getHours();
        if (hora >= 0 && hora < 24) horaMap[hora] += venta.total || 0;
      });

      const ventasPorHora = [];
      let acumulado = 0;
      for (let h = 8; h <= 22; h++) {
        acumulado += horaMap[h];
        ventasPorHora.push({
          hora: `${h.toString().padStart(2, "0")}:00`,
          total: Math.round(acumulado)
        });
      }

      setEstadisticas({
        totalVentas,
        ventasEfectivo,
        ventasTarjeta,
        productosVendidos,
        montoProductos,
        cantidadVentas: ventas?.length || 0,
        ventasPorHora,
        ventasPorCategoria
      });
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    } finally {
      setCargando(false);
    }
  };

  const descargarExcel = async () => {
    try {
      setCargando(true);
      const inicioRango = `${fechaDesde} 00:00:00`;
      const finRango = `${fechaHasta} 23:59:59`;

      // 1. Obtener Ventas
      const { data: ventas, error: errorVentas } = await supabase
        .from("ventas")
        .select(`
          id_venta,
          fecha_venta,
          total,
          metodo_pago,
          id_empleado,
          id_cliente
        `)
        .gte("fecha_venta", inicioRango)
        .lte("fecha_venta", finRango)
        .order("fecha_venta", { ascending: false });

      if (errorVentas) throw errorVentas;

      // 2. Obtener Detalles
      const idsVentas = ventas?.map((v) => v.id_venta) || [];
      let detallesVenta = [];

      if (idsVentas.length > 0) {
        const { data: detalles, error: errorDetalles } = await supabase
          .from("detalles_ventas")
          .select(`
            id_detalle,
            id_venta,
            cantidad,
            precio_unitario,
            subtotal,
            id_producto,
            productos (
              nombre_producto,
              categorias (nombre_categoria)
            )
          `)
          .in("id_venta", idsVentas)
          .order("id_venta");

        if (errorDetalles) console.error("Error en detalles:", errorDetalles);
        else detallesVenta = detalles || [];
      }

      const wb = XLSX.utils.book_new();

      // Hoja Ventas
      if (ventas && ventas.length > 0) {
        const wsVentas = XLSX.utils.json_to_sheet(ventas);
        XLSX.utils.book_append_sheet(wb, wsVentas, "Ventas");
      } else {
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.json_to_sheet([{ Mensaje: "No hay ventas en este rango" }]),
          "Ventas"
        );
      }

      // Hoja Detalles
      if (detallesVenta && detallesVenta.length > 0) {
        const wsDetalles = XLSX.utils.json_to_sheet(detallesVenta);
        XLSX.utils.book_append_sheet(wb, wsDetalles, "Detalles_Ventas");
      } else {
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.json_to_sheet([{ Mensaje: "No hay detalles de ventas" }]),
          "Detalles_Ventas"
        );
      }

      XLSX.writeFile(wb, `Reporte_Ventas_${fechaDesde}_a_${fechaHasta}.xlsx`);
    } catch (err) {
      console.error("Error generando Excel:", err);
      alert("Error al generar el Excel. Revisa la consola.");
    } finally {
      setCargando(false);
    }
  };

  const generarPdfVentasHora = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");

      // Título y fecha
      pdf.setFontSize(18);
      pdf.setTextColor("#330775");
      pdf.setFont("helvetica", "bold");
      pdf.text("Reporte de Ventas por Hora", 14, 15);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor("#000000");
      pdf.setFontSize(10);
      pdf.text(`Periodo: ${fechaDesde} - ${fechaHasta}`, 14, 22);

      // Imagen del gráfico
      const canvas = await html2canvas(graficoHoraRef.current);
      const imagen = canvas.toDataURL('image/png');
      pdf.addImage(imagen, "PNG", 10, 30, 190, 80);

      // Resumen general
      pdf.setFontSize(14);
      pdf.setTextColor("#330775");
      pdf.setFont("helvetica", "bold");
      pdf.text("Resumen General", 14, 115);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor("#000000");
      pdf.setFontSize(10);

      pdf.text(`Total Ventas: C$ ${estadisticas.totalVentas.toFixed(2)}`, 14, 125);
      pdf.text(`Ventas Efectivo: C$ ${estadisticas.ventasEfectivo.toFixed(2)}`, 14, 132);
      pdf.text(`Ventas Tarjeta: C$ ${estadisticas.ventasTarjeta.toFixed(2)}`, 14, 139);
      pdf.text(`Productos Vendidos: ${estadisticas.productosVendidos}`, 14, 146);
      pdf.text(`Cantidad Ventas: ${estadisticas.cantidadVentas}`, 14, 153);

      // Tabla de ventas por hora
      const filas = estadisticas.ventasPorHora.map(item => [
        item.hora,
        `C$ ${item.total}`
      ]);

      autoTable(pdf, {
        startY: 160,
        head: [["Hora", "Monto Acumulado"]],
        body: filas
      });

      const fechaActual = new Date().toLocaleDateString('en-CA', { timeZone: "America/Managua" });
      pdf.save(`VentasHora_${fechaDesde}_${fechaHasta}_Generado_${fechaActual}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Error generando PDF");
    }
  };

  const generarPdfVentasCategoria = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");

      // Título y fecha
      pdf.setFontSize(18);
      pdf.setTextColor("#330775");
      pdf.setFont("helvetica", "bold");
      pdf.text("Reporte de Ventas por Categoría", 14, 15);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor("#000000");
      pdf.setFontSize(10);
      pdf.text(`Periodo: ${fechaDesde} - ${fechaHasta}`, 14, 22);

      // Imagen del gráfico
      const canvas = await html2canvas(graficoCategoriaRef.current);
      const imagen = canvas.toDataURL('image/png');
      pdf.addImage(imagen, "PNG", 10, 30, 190, 80);

      // Resumen general
      pdf.setFontSize(14);
      pdf.setTextColor("#330775");
      pdf.setFont("helvetica", "bold");
      pdf.text("Resumen General", 14, 115);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor("#000000");
      pdf.setFontSize(10);

      pdf.text(`Total Ventas: C$ ${estadisticas.totalVentas.toFixed(2)}`, 14, 125);
      pdf.text(`Productos Vendidos: ${estadisticas.productosVendidos}`, 14, 132);

      // Tabla de ventas por categoría
      const filas = estadisticas.ventasPorCategoria.map(item => [
        item.name,
        `C$ ${item.value.toFixed(2)}`
      ]);

      autoTable(pdf, {
        startY: 145,
        head: [["Categoría", "Monto de Ventas"]],
        body: filas
      });

      const fechaActual = new Date().toLocaleDateString('en-CA', { timeZone: "America/Managua" });
      pdf.save(`VentasCategoria_${fechaDesde}_${fechaHasta}_Generado_${fechaActual}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Error generando PDF");
    }
  };

  const generarPdfGeneral = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");

      pdf.setFontSize(18);
      pdf.setTextColor("#330775");
      pdf.setFont("helvetica", "bold");
      pdf.text("Reporte Estadístico General", 14, 15);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor("#000000");
      pdf.setFontSize(10);
      pdf.text(`Periodo: ${fechaDesde} - ${fechaHasta}`, 14, 22);

      pdf.setFontSize(14);
      pdf.setTextColor("#330775");
      pdf.setFont("helvetica", "bold");
      pdf.text("Resumen General", 14, 35);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor("#000000");
      pdf.setFontSize(10);

      pdf.text(`Total Ventas: C$ ${estadisticas.totalVentas.toFixed(2)}`, 14, 45);
      pdf.text(`Ventas Efectivo: C$ ${estadisticas.ventasEfectivo.toFixed(2)}`, 14, 52);
      pdf.text(`Ventas Tarjeta: C$ ${estadisticas.ventasTarjeta.toFixed(2)}`, 14, 59);
      pdf.text(`Productos Vendidos: ${estadisticas.productosVendidos}`, 14, 66);
      pdf.text(`Cantidad Ventas: ${estadisticas.cantidadVentas}`, 14, 73);

      const canvasHora = await html2canvas(graficoHoraRef.current);
      const imagenHora = canvasHora.toDataURL('image/png');
      pdf.addImage(imagenHora, "PNG", 10, 85, 190, 80);
      
      const canvasCategoria = await html2canvas(graficoCategoriaRef.current);
      const imagenCategoria = canvasCategoria.toDataURL('image/png');
      pdf.addPage();
      pdf.addImage(imagenCategoria, "PNG", 10, 20, 190, 80);

      const fechaActual = new Date().toLocaleDateString('en-CA', { timeZone: "America/Managua" });
      pdf.save(`ReporteGeneral_${fechaDesde}_${fechaHasta}_Generado_${fechaActual}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Error generando PDF general");
    }
  };

  const COLORES = ["#F26430", "#CA8A04", "#8A9A86", "#4F709C", "#E28F83", "#705E59"];

  if (cargando) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" size="lg" />
        <p className="mt-3">Cargando estadísticas...</p>
      </Container>
    );
  }

  const datosPie = estadisticas.ventasPorCategoria.length > 0 
    ? estadisticas.ventasPorCategoria 
    : [{ name: "Sin ventas", value: 1 }];

  return (
    <Container className="mt-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold" style={{ letterSpacing: "-1.5px", fontSize: "2.25rem" }}>Dashboard</h2>
          <p className="text-muted mb-0"><i className="bi bi-speedometer2 me-1"></i> Resumen de rendimiento y métricas del negocio</p>
        </div>
      </div>

      <Card className="mb-4 shadow-sm border-2">
        <Card.Body className="p-3">
          <Row className="align-items-center g-3">
            <Col xs={12} md={3}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold mb-1 small"><i className="bi bi-calendar-event me-1"></i>Desde</Form.Label>
                <Form.Control
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="form-control-sm"
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={3}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold mb-1 small"><i className="bi bi-calendar-event-fill me-1"></i>Hasta</Form.Label>
                <Form.Control
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="form-control-sm"
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6} className="d-flex align-items-end justify-content-md-end gap-2">
              <Button variant="danger" onClick={generarPdfGeneral} className="btn-rounded py-2 px-3">
                <i className="bi bi-file-earmark-pdf-fill me-2"></i>Reporte PDF
              </Button>
              <Button variant="success" onClick={descargarExcel} className="btn-rounded py-2 px-3">
                <i className="bi bi-file-earmark-excel-fill me-2"></i>Descargar Excel
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tarjetas de Estadísticas */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 hover-lift">
            <Card.Body className="d-flex align-items-center justify-content-between p-4">
              <div>
                <span className="text-muted text-uppercase fw-semibold small" style={{ letterSpacing: "0.5px" }}>Ventas Totales</span>
                <h2 className="mb-0 mt-2 fw-bold text-truncate" style={{ fontSize: '1.8rem', letterSpacing: '-0.5px' }}>
                  C$ {estadisticas.totalVentas.toFixed(2)}
                </h2>
              </div>
              <div className="icon-circle ms-2" style={{ minWidth: '55px', height: '55px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border-main)', background: '#FDF2EC' }}>
                <i className="bi bi-cash-coin fs-3" style={{ color: 'var(--primary)' }}></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 hover-lift">
            <Card.Body className="d-flex align-items-center justify-content-between p-4">
              <div>
                <span className="text-muted text-uppercase fw-semibold small" style={{ letterSpacing: "0.5px" }}>Efectivo</span>
                <h2 className="mb-0 mt-2 fw-bold text-truncate" style={{ fontSize: '1.8rem', letterSpacing: '-0.5px' }}>
                  C$ {estadisticas.ventasEfectivo.toFixed(2)}
                </h2>
              </div>
              <div className="icon-circle ms-2" style={{ minWidth: '55px', height: '55px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border-main)', background: '#FEF9EC' }}>
                <i className="bi bi-wallet2 fs-3" style={{ color: 'var(--secondary)' }}></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 hover-lift">
            <Card.Body className="d-flex align-items-center justify-content-between p-4">
              <div>
                <span className="text-muted text-uppercase fw-semibold small" style={{ letterSpacing: "0.5px" }}>Tarjeta</span>
                <h2 className="mb-0 mt-2 fw-bold text-truncate" style={{ fontSize: '1.8rem', letterSpacing: '-0.5px' }}>
                  C$ {estadisticas.ventasTarjeta.toFixed(2)}
                </h2>
              </div>
              <div className="icon-circle ms-2" style={{ minWidth: '55px', height: '55px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border-main)', background: '#ECF5FD' }}>
                <i className="bi bi-credit-card fs-3" style={{ color: '#0166d3' }}></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 hover-lift">
            <Card.Body className="d-flex align-items-center justify-content-between p-4">
              <div>
                <span className="text-muted text-uppercase fw-semibold small" style={{ letterSpacing: "0.5px" }}>Productos Vendidos</span>
                <h2 className="mb-0 mt-2 fw-bold text-truncate" style={{ fontSize: '1.8rem', letterSpacing: '-0.5px' }}>
                  {estadisticas.productosVendidos}
                </h2>
              </div>
              <div className="icon-circle ms-2" style={{ minWidth: '55px', height: '55px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border-main)', background: '#F8F6F0' }}>
                <i className="bi bi-box-seam fs-3" style={{ color: 'var(--text-main)' }}></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm border-2 h-100">
            <Card.Body ref={graficoHoraRef} className="p-4">
              <h5 className="mb-4 fw-bold"><i className="bi bi-graph-up me-2 text-primary"></i>Ventas por Hora</h5>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={estadisticas.ventasPorHora}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2dcd5" />
                  <XAxis dataKey="hora" stroke="var(--text-muted)" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '0.85rem' }} />
                  <YAxis tickFormatter={(v) => `C$${v}`} stroke="var(--text-muted)" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '0.85rem' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '2px solid var(--border-main)', 
                      borderRadius: '8px', 
                      fontFamily: 'Plus Jakarta Sans', 
                      color: 'var(--text-main)' 
                    }} 
                    formatter={(v) => [`C$ ${v}`, "Monto"]} 
                  />
                  <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={4} dot={{ r: 6, fill: 'var(--primary)', stroke: '#ffffff', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <Button variant="outline-danger" onClick={generarPdfVentasHora} className="btn-rounded py-2 px-3">
                  <i className="bi bi-file-earmark-pdf-fill me-2"></i>
                  Descargar PDF
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm border-2 h-100">
            <Card.Body ref={graficoCategoriaRef} className="p-4">
              <h5 className="mb-4 fw-bold"><i className="bi bi-pie-chart me-2 text-secondary"></i>Ventas por Categoría</h5>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={datosPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={100}
                    label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={false}
                  >
                    {datosPie.map((entry, i) => (
                      <Cell 
                        key={`cell-${i}`} 
                        fill={estadisticas.ventasPorCategoria.length > 0 ? COLORES[i % COLORES.length] : "#e2dcd5"} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `C$ ${v}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="p-3 text-center">
                <Button variant="outline-danger" onClick={generarPdfVentasCategoria} className="btn-rounded py-2 px-3">
                  <i className="bi bi-file-earmark-pdf-fill me-2"></i>
                  Descargar PDF
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Inicio;
