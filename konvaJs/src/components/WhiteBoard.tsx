import { Arrow, Stage, Layer, Rect, Line, Circle } from "react-konva";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import { useState, useRef, useMemo, useEffect } from "react";
import { GoArrowDownRight } from "react-icons/go";
import {
  FaEraser,
  FaMousePointer,
  FaPen,
  FaRegCircle,
  FaDownload,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdOutlineClear, MdOutlineRectangle } from "react-icons/md";
import { io } from "socket.io-client";
import { roomAtom } from "../room/roomAtom";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { v4 as uuid4 } from "uuid";

export default function WhiteBoard() {
  type rectangle = [
    { color: string; id: string; x: number; y: number; w: number; h: number },
  ];
  type pen = [{ color: string; tool: string; points: Number[] }];
  type arrow = [
    { color: string; id: string; x: number; y: number; points: Number[] },
  ];
  type circle = [
    { color: string; id: string; x: number; y: number; radius: number },
  ];

  const socket = useMemo(() => io("http://localhost:3001"), []);
  const navigate = useNavigate();
  const stageRef = useRef();

  const [room, setRoom] = useAtom(roomAtom);

  const setData = (res) => {
    const s = res.tool;
    console.log({ tool: s });
    switch (s) {
      case "pen":
        setLines(res.l);
        break;
      case "rectangle":
        setRectangle(res.l);
        break;
      case "circle":
        setCircle(res.l);
        break;
      case "arrow":
        setArrow(res.l);
        break;
      case "clear":
        clearBoard();
        break;
    }
  };

  const setLocalRoom = (room: string) => {
    const item = localStorage.getItem("room") || "";
    room === ""
      ? setRoom("none")
      : room === item
        ? null
        : localStorage.setItem("room", room);
  };

  useEffect(() => {
    socket.on("welcome", (res) => {
      console.log(res);
    });

    socket.emit("joinRoom", room);

    socket.on("draw", (res) => {
      setData(res);
    });

    socket.on("mouseMove", (res) => {
      setClientX(res.x);
      setClientY(res.y);
    });

    setLocalRoom(room);
    console.log(room);
  }, []);

  const clearBoard = () => {
    setLines([]);
    setRectangle([]);
    setCircle([]);
    setArrow([]);
    setClientX(-10);
    setClientY(-10);
  };

  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState<string>("000000");
  const [lines, setLines] = useState<pen>([]);
  const [circle, setCircle] = useState<circle>([]);
  const [action, setAction] = useState("pen");
  const [rectangle, setRectangle] = useState<rectangle>([]);
  const [arrow, setArrow] = useState<arrow>([]);
  const [isDraggable, setIsDraggable] = useState(false);
  const [currentShapeId, setCurrentShapeId] = useState();
  const [clientX, setClientX] = useState(-10);
  const [clientY, setClientY] = useState(-10);

  const isDrawing = useRef(false);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    var id = uuid4();
    setCurrentShapeId(id);
    switch (action) {
      case "pen":
        setLines([...lines, { color, tool, points: [pos.x, pos.y] }]);
        break;
      case "rectangle":
        setRectangle([
          ...rectangle,
          { color, id, x: pos.x, y: pos.y, w: 100, h: 100 },
        ]);
        console.log({ mouseDown: rectangle });
        break;
      case "circle":
        setCircle([...circle, { color, id, x: pos.x, y: pos.y, radius: 20 }]);
        break;
      case "arrow":
        setArrow([
          ...arrow,
          { color, id, x: pos.x, y: pos.y, points: [0, 0, 0, 0] },
        ]);
        break;
    }
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }
    var mssg;
    switch (action) {
      case "pen":
        let lastLine = lines[lines.length - 1];
        // add point
        lastLine.points = lastLine.points.concat([point.x, point.y]);
        // replace last
        lines.splice(lines.length - 1, 1, lastLine);
        setLines(lines.concat());
        mssg = { r: room, l: lines, tool: "pen" };
        socket.emit("draw", mssg);
        break;
      case "rectangle":
        let lastRectangle = rectangle[rectangle.length - 1];
        lastRectangle.w = point.x - lastRectangle.x;
        lastRectangle.h = point.y - lastRectangle.y;
        rectangle.splice(rectangle.length - 1, 1, lastRectangle);
        setRectangle(rectangle.concat());
        mssg = { r: room, l: rectangle, tool: "rectangle" };
        socket.emit("draw", mssg);
        break;
      case "circle":
        let lastCircle = circle[circle.length - 1];
        lastCircle.radius = Math.pow(
          Math.pow(point.x - lastCircle.x, 2) +
            Math.pow(point.y - lastCircle.y, 2),
          0.5,
        );
        circle.splice(circle.length - 1, 1, lastCircle);
        setCircle(circle.concat());
        mssg = { r: room, l: circle, tool: "circle" };
        socket.emit("draw", mssg);
        break;
      case "arrow":
        let lastArrow = arrow[arrow.length - 1];
        lastArrow.points = [0, 0, point.x - lastArrow.x, point.y - lastArrow.y];
        arrow.splice(arrow.length - 1, 1, lastArrow);
        setArrow(arrow.concat());
        mssg = { r: room, l: arrow, tool: "arrow" };
        socket.emit("draw", mssg);
        break;
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleMenuClick = (e: string) => {
    setAction(e);
    if (e == "clear") {
      clearBoard();
      socket.emit("draw", { r: room, tool: "clear" });
    }
  };

  const handleSignOut = () => {
    setRoom("");
    navigate("/");
  };

  const handleDownload = () => {
    const uri = stageRef.current.toDataURL();
    var link = document.createElement("a");
    link.download = "image.png";
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlemousemove = (e) => {
    socket.emit("mouseMove", { r: room, x: e.clientX, y: e.clientY });
  };

  return (
    <div onMouseMove={handlemousemove}>
      <div
        id="topMenu"
        className="position-absolute z-3 d-flex w-100 mt-4 justify-content-center"
      >
        <Navbar
          expand="lg"
          className="bg-body-tertiary border border-secondary-subtle rounded shadow-lg"
        >
          <Container>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link
                  onClick={() => handleMenuClick("select")}
                  title="select"
                >
                  <FaMousePointer />
                </Nav.Link>
                <Nav.Link
                  onClick={() => handleMenuClick("eraser")}
                  title="eraser"
                >
                  <FaEraser />
                </Nav.Link>
                <Nav.Link
                  href="#home"
                  title="arrow"
                  onClick={() => handleMenuClick("arrow")}
                >
                  <GoArrowDownRight />
                </Nav.Link>
                <Nav.Link
                  href="#home"
                  title="pen"
                  onClick={() => handleMenuClick("pen")}
                >
                  <FaPen />
                </Nav.Link>
                <Nav.Link
                  href="#home"
                  title="rectanlge"
                  onClick={() => handleMenuClick("rectangle")}
                >
                  <MdOutlineRectangle />
                </Nav.Link>
                <Nav.Link
                  title="circle"
                  onClick={() => handleMenuClick("circle")}
                >
                  <FaRegCircle />
                </Nav.Link>
                <Nav.Link
                  title="clear board"
                  onClick={() => handleMenuClick("clear")}
                >
                  <MdOutlineClear />
                </Nav.Link>
                <input
                  type="color"
                  className="mt-2"
                  title="pick color"
                  onChange={(e) => setColor(`${e.target.value}`)}
                ></input>
                <Nav.Link title="save board as image" onClick={handleDownload}>
                  <FaDownload />
                </Nav.Link>
                <Nav.Link title="exit Board" onClick={handleSignOut}>
                  <FaSignOutAlt />
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </div>
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
      >
        <Layer>
          <Circle x={clientX} y={clientY} radius={5} fill="green" />
          {arrow.map((a) => {
            return (
              <Arrow
                x={a.x}
                y={a.y}
                points={a.points}
                pointerLength={6}
                fill={a.color}
                stroke={a.color}
                strokeWidth={1.6}
              />
            );
          })}
          {circle.map((c) => {
            return (
              <Circle
                key={c.id}
                x={c.x}
                y={c.y}
                radius={c.radius}
                stroke={c.color}
                strokeWidth={1.2}
              />
            );
          })}
          {rectangle.map((r, i) => {
            return (
              <Rect
                key={i}
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
                stroke={r.color}
                strokeWidth={1.2}
              />
            );
          })}
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={2}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === "eraser" ? "destination-out" : "source-over"
              }
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

/*{rectangle.map((r) => {
            console.log("renderREct");
            return (
              <Rect
            x={20}
            y={50}
            width={100}
            height={100}
            fill="red"
            shadowBlur={10}
          />
            );
          })}*/
