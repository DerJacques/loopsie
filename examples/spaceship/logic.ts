import { GameLoop } from "../../main";
import { getInitialState, move } from "./models/ship";

const initialState = {
  player: getInitialState()
};

export const gameLoop = new GameLoop(initialState, {
  msPerUpdate: 1000,
  maxFPS: 1
});

// Move player
gameLoop.addCallback((delta, state) => {
  return { ...state, player: move(state.player, delta) };
});
