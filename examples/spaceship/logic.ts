import { GameLoop } from "../../main";

const initialState = {
  fuel: 100,
  speed: 5,
  direction: 30, // Degrees
  position: {
    x: 0,
    y: 0
  }
};

export const gameLoop = new GameLoop(initialState, {
  msPerUpdate: 1000,
  maxFPS: 1
});

function perSecond(x: number, delta: number) {
  return (x * delta) / 1000;
}

// Reduce fuel
gameLoop.addCallback((delta, state) => {
  return {
    ...state,
    fuel: state.fuel - perSecond(0.3, delta)
  };
});

// Set positionn
gameLoop.addCallback((delta, state) => {
  return {
    ...state,
    position: {
      x: state.position.x + perSecond(state.speed, delta),
      y: state.position.y + perSecond(state.speed, delta)
    }
  };
});
