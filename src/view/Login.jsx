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
      className="d-flex justify-content-center align-items-center animate-fade-in"
      style={{ minHeight: "85vh" }}
    >
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <Card className="border-0 shadow-lg rounded-4 overflow-hidden glass-card animate-fade-in-up">
            <Card.Header className="text-center bg-primary p-4 border-0">
              <div className="bg-white bg-opacity-20 d-inline-block p-3 rounded-circle mb-3">
                <i className="bi-person-badge text-white display-5"></i>
              </div>
              <h3 className="text-white fw-bold mb-0">Bienvenido</h3>
              <p className="text-white-50 small mb-0">Ingresa tus credenciales para continuar</p>
            </Card.Header>
            <Card.Body className="p-4 p-md-5">
              <Form onSubmit={handleLogin}>
                {error && (
                  <Alert variant="danger" className="rounded-3 small animate-fade-in">
                    <i className="bi-exclamation-circle me-2"></i> {error}
                  </Alert>
                )}

                <Form.Group className="mb-4" controlId="formBasicEmail">
                  <Form.Label className="fw-semibold small text-muted text-uppercase">Correo Electrónico</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0"><i className="bi-envelope text-muted"></i></span>
                    <Form.Control
                      type="email"
                      className="bg-light border-0 py-2"
                      placeholder="nombre@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label className="fw-semibold small text-muted text-uppercase">Contraseña</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0"><i className="bi-lock text-muted"></i></span>
                    <Form.Control
                      type="password"
                      className="bg-light border-0 py-2"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" className="btn-rounded py-2 shadow-sm" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Iniciando...
                      </>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
            <Card.Footer className="bg-light border-0 p-4 text-center">
               <p className="small text-muted mb-0">¿Olvidaste tu contraseña? <a href="#" className="text-primary fw-bold text-decoration-none">Recupérala aquí</a></p>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;