import { useLocation, useNavigate } from "react-router-dom";
import qs from "query-string";
import "./home-styles.css";
import React, { useState, useRef, useEffect, useContext } from "react";
import ShareButtons from "../../components/share-buttons";
import Button from "../../components/button";
import Layout from "../../components/layout";

const Form = () => {
  const [name, setName] = useState("");
  const [gameID, setGameID] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { id: inviteID } = qs.parse(location.search);

  useEffect(() => {
    if (inviteID) return setGameID(inviteID);
    const id = Math.random().toString().replace("0.", "");
    setGameID(id);
  }, [inviteID]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!(name && gameID)) {
      return;
    }
    navigate(`/game?name=${name}&id=${gameID}`);
  };

  return (
    <div>
      <h2>Play Chess with your friends online</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="input"
          value={name}
          onChange={({ target }) => setName(target.value)}
          placeholder="Display Name"
        />
        <div className="gameId">Game ID: {gameID}</div>
        <hr />
        <p className="invite">Invite your friend over</p>
        <ShareButtons
          shareText={`https://stack-chess.netlify.app?id=${gameID}`}
          subject="Join me for a game of Chess on Stack Chess"
        />

        <Button onClick={handleSubmit}>Create</Button>
      </form>
    </div>
  );
};
const Home = () => {
  const Image = () => (
    <img src={require("../../assets/home.jpg")} alt="home" className="bg-img" />
  );
  return <Layout Content={Form} Image={Image} />;
};

export default Home;
