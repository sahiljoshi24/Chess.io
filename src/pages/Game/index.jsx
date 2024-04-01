import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import qs from "query-string";
import { Chess } from "chess.js";
import { createBoard, getGameOverState } from "../../functions";
import Board from "../../components/board";
import "./game-styles.css";
import { GameContext } from "../../context/GameContext";
import {
  types,
  setMessage,
  setOpponent,
  setOpponentMoves,
  setPlayer,
  setPlayerColor,
} from "../../context/actions";
import GameOver from "../../components/gameover";
import io from "socket.io-client";
import Player from "../../components/player";
const socket = io("localhost:5000");

const FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const Game = () => {
  const [fen, setFen] = useState(FEN);
  const { current: chess } = useRef(new Chess(fen));
  const [board, setBoard] = useState(createBoard(fen));
  const location = useLocation();
  const navigate = useNavigate();
  const playerName = useRef();
  const gameID = useRef();
  const {
    dispatch,
    gameOver,
    playerName: player,
    opponentName,
    playerColor,
  } = useContext(GameContext);

  useEffect(() => {
    const { id, name } = qs.parse(location.search);
    playerName.current = name;
    gameID.current = id;
  }, [location.search]);

  useEffect(() => {
    socket.emit(
      "join",
      { name: playerName.current, gameID: gameID.current },
      ({ error, color }) => {
        if (error) {
          navigate("/");
        }
        dispatch(setPlayer(playerName.current));
        dispatch(setPlayerColor(color));
      }
    );
    socket.on("welcome", ({ message, opponent }) => {
      dispatch(setMessage(message));
      dispatch(setOpponent(opponent));
    });
    socket.on("opponentJoin", ({ message, opponent }) => {
      dispatch(setMessage(message));
      dispatch(setOpponent(opponent));
    });

    socket.on("opponentMove", ({ from, to }) => {
      chess.move({ from, to });
      setFen(chess.fen());
      dispatch(setMessage("Your Turn"));
      dispatch(setOpponentMoves([from, to]));
    });
    socket.on("message", ({ message }) => {
      dispatch(setMessage(message));
    });
  }, [chess, navigate, dispatch]);

  useEffect(() => {
    setBoard(createBoard(fen));
  }, [fen]);

  const fromPos = useRef();

  const makeMove = (pos) => {
    const from = fromPos.current;
    const to = pos;
    chess.move({ from, to });
    dispatch({ type: types.CLEAR_POSSIBLE_MOVES });
    setFen(chess.fen());
    socket.emit("move", { gameID: gameID.current, from, to: pos });
  };

  const setFromPos = (pos) => {
    fromPos.current = pos;
    dispatch({
      type: types.SET_POSSIBLE_MOVES,
      moves: chess.moves({ square: pos }),
    });
  };

  useEffect(() => {
    const [gameOver, status] = getGameOverState(chess);
    if (gameOver) {
      dispatch({ type: types.GAME_OVER, status, player: chess.turn() });
      return;
    }
    dispatch({
      type: types.SET_TURN,
      player: chess.turn(),
      check: chess.inCheck(),
    });
  }, [fen, dispatch, chess]);

  if (gameOver) {
    return <GameOver />;
  }

  return (
    <div className="game">
      <Player name={player} color={playerColor} player />
      <Player name={opponentName} color={playerColor === "w" ? "b" : "w"} />
      <Board cells={board} makeMove={makeMove} setFromPos={setFromPos} />
    </div>
  );
};
export default Game;
