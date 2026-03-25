import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        // Almacenamos el email en localStorage, como lo usa el Encabezado
        localStorage.setItem("usuario-supabase", data.user.email);
        navigate("/"); // Redirigimos al inicio
      }
    } catch (err) {
      console.error("Error en el inicio de sesión:", err.message);
      setError("Credenciales inválidas. Por favor, verifica tu email y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}
    >
      <Row>
        <Col md={12}>
          <Card className="shadow-lg" style={{ width: "25rem" }}>
            <Card.Header as="h3" className="text-center color-navbar text-white">
              <i className="bi-box-arrow-in-right me-2"></i>
              Inicio de Sesión
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleLogin}>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Ingresa tu correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                        <span className="ms-2">Ingresando...</span>
                      </>
                    ) : (
                      "Ingresar"
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
            <Card.Footer className="text-muted text-center">
              <small>Discosa &copy; 2023</small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;