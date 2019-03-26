import { GameLoop } from "../main";
import blessed from "blessed";
import contrib from "blessed-contrib";

const initialState = {
  fuel: 100
};

const screen = blessed.screen();
const grid = new contrib.grid({ rows: 4, cols: 2, screen: screen });

const fuelIndicator = grid.set(0, 0, 1, 1, contrib.gauge, {
  label: "Fuel",
  stroke: "green",
  fill: "white"
});

const map: any = grid.set(0, 1, 4, 1, contrib.map, { label: "World Map" });
map.addMarker({ lon: "-79.0000", lat: "37.5000", color: "red", char: "X" });

const log = grid.set(1, 0, 3, 1, contrib.log, {
  fg: "green",
  selectedFg: "green",
  label: "Ship Log"
});

screen.key(["escape", "q", "C-c"], function(_ch, _key) {
  return process.exit(0);
});

const gameLoop = new GameLoop(initialState, {
  msPerUpdate: 1000,
  maxFPS: 1
});

gameLoop.subscribe(state => {
  fuelIndicator.setPercent(state.fuel);
  screen.render();
  log.log("Rendering");
});

gameLoop.addCallback((delta, state) => {
  return {
    ...state,
    fuel: Math.round(state.fuel - delta / 1000)
  };
});

gameLoop.start();
