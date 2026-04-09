import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Encabezado from "./components/navegacion/Encabezado";

import Inicio from "./view/Inicio";
import Categorias from "./view/Categorias";
import Catalogo from "./view/Catalogo";
import Productos from "./view/Productos";
import Login from "./view/Login";
import RutaProtegida from "./components/rutas/RutaProtegida";
import Pagina404 from "./view/Pagina404";

import "./App.css";

const App = () => {
  return (
    <Router>
      <Encabezado />
      <div className="animate-fade-in">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RutaProtegida><Inicio /></RutaProtegida>} />
          <Route path="/categorias" element={<RutaProtegida><Categorias /></RutaProtegida>} />
          <Route path="/catalogo" element={<RutaProtegida><Catalogo /></RutaProtegida>} />
          <Route path="/productos" element={<RutaProtegida><Productos /></RutaProtegida>} />
          <Route path="*" element={<RutaProtegida><Pagina404 /></RutaProtegida>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;