import { GameLoop } from "../main";

const initialState = {
  loops: 0
};

const gameLoop = new GameLoop(initialState);

let renders = 0;

gameLoop.subscribe(state => {
  renders += 1;
  console.log("SEND VIA WEBSOCKET", state.loops, renders);
});

gameLoop.subscribe(state => {
  console.log("RENDER TO SCREEN", state.loops);
});

gameLoop.addCallback((delta, state) => {
  console.log("CALLBACK", delta);
  if (state.loops === 12) {
    gameLoop.stop();
  }
  return {
    loops: state.loops + 1
  };
});

gameLoop.addRunOnce(() => ({
  loops: 10
}));

gameLoop.start();
