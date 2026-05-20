import React from "react";
import useCategoriasLogic from "./categorias/useCategoriasLogic";
import CategoriasView from "./categorias/CategoriasView";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Categorias = () => {
  const logic = useCategoriasLogic();

  const generarPDFCategoria = (categoria) => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text("Reporte de Categoría", 14, 20);

    // Línea decorativa
    doc.line(14, 25, 195, 25);

    // Información de la categoría
    doc.setFontSize(12);

    autoTable(doc, {
      startY: 35,
      head: [["Campo", "Valor"]],
      body: [
        ["ID", categoria.id_categoria],
        ["Nombre", categoria.nombre_categoria],
        ["Descripción", categoria.descripcion_categoria],
      ],
    });

    // Descargar PDF
    doc.save(`categoria_${categoria.id_categoria}.pdf`);
  };

  const generarPDFTodasCategorias = (categoriasList) => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text("Reporte General de Categorías", 14, 20);

    // Línea decorativa
    doc.line(14, 25, 195, 25);

    // Mapear cuerpo
    const bodyData = categoriasList.map((cat) => [
      cat.id_categoria,
      cat.nombre_categoria,
      cat.descripcion_categoria || "Sin descripción",
    ]);

    autoTable(doc, {
      startY: 35,
      head: [["ID", "Nombre", "Descripción"]],
      body: bodyData,
    });

    // Descargar PDF
    doc.save("reporte_general_categorias.pdf");
  };

  return (
    <CategoriasView
      {...logic}
      generarPDFCategoria={generarPDFCategoria}
      generarPDFTodasCategorias={generarPDFTodasCategorias}
    />
  );
};

export default Categorias;