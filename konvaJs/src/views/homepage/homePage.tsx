import { Button } from "react-bootstrap";
import { NavigationBar } from "../../components/NavigationBar";
import { useNavigate } from "react-router-dom";
import "./homepage.css";
import { useContext } from "react";

export default function HomePage() {
  const navigate = useNavigate();

  const newBoard = () => {
    navigate("/newBoard");
  };
  return (
    <>
      <NavigationBar />
      <div
        id="board"
        className="shadow-lg d-flex flex-column justify-content-center align-items-center mt-5 p-5 rounded"
      >
        <h1 className="text-centermb-2">Draw with Friends!</h1>
        <h1 className="h4 text-center mb-1">
          The perfect tool for Virtual Meetings, <br /> for Remote Teams, <br />{" "}
          Friends and Peers
        </h1>
        <p className="blockquote-footer text-center mt-2">
          Collaborate in real-time with your team, <br /> click the button
          below.
        </p>
        <Button onClick={newBoard}>Start Drawing</Button>
      </div>
    </>
  );
}
