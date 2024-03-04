import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useAtom } from "jotai";
import { roomAtom } from "../room/roomAtom";
import { v4 as uuid4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { Logout, profile } from "../Auth/keycloack";
import { FaSignOutAlt } from "react-icons/fa";

export const NavigationBar = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [joinShow, setJoinShow] = useState(false);
  const [room, setRoom] = useAtom(roomAtom);
  const [user, setUser] = useState("");

  const handleCreateClose = () => setShow(false);
  const handleCreateOpen = () => {
    setRoom(uuid4());
    setShow(true);
  };

  const handleJoinClose = () => setJoinShow(false);
  const handleJoinOpen = () => {
    setJoinShow(true);
  };
  const handleJoinRoom = (e: SubmitEvent) => {
    e.preventDefault();
    setJoinShow(false);
    navigate("/newBoard");
  };
  const handleJoinSession = () => {
    navigate(`/newBoard#${room}`);
  };

  const handleLogout = () => {
    Logout();
  };

  async function setuser() {
    setTimeout(() => setUser(profile.firstName), 1000);
  }

  useEffect(() => {
    setuser();
  },[]);

  return (
    <>
      <Navbar collapseOnSelect expand="lg" bg="dark" data-bs-theme="dark">
        <Container>
          <Navbar.Brand href="#home">whiteBoard</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <NavDropdown title="Options" id="collapsible-nav-dropdown">
                <NavDropdown.Item onClick={handleCreateOpen}>
                  Create Session
                </NavDropdown.Item>
                <NavDropdown.Item onClick={handleJoinOpen}>
                  Join Session
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            </Nav>
            <Nav className="mx-2">
              <Navbar.Text>
                Signed in as: <a>{user}</a>
              </Navbar.Text>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Modal show={show} onHide={handleCreateClose}>
        <Modal.Header closeButton>
          <Modal.Title>Session Created</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          SessionId : {room}
          <br />
          <p className="text-center text-secondary d-inline">
            Copy this Id to invite others
          </p>{" "}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCreateClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleJoinSession}>
            Join Session
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={joinShow} onHide={handleJoinClose}>
        <Modal.Header closeButton>
          <Modal.Title>Join Session</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleJoinRoom}>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Room Id</Form.Label>
              <Form.Control
                type="input"
                placeholder="Enter Room Id"
                autoFocus
                onChange={(e) => setRoom(e.target.value)}
              />
            </Form.Group>
            <Button variant="secondary" onClick={handleJoinClose}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Join Room
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};
