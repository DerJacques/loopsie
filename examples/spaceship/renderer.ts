import blessed from "blessed";
import contrib from "blessed-contrib";
import { gameLoop } from "./logic";

const screen = blessed.screen({
  debug: true
});

const grid = new contrib.grid({ rows: 4, cols: 6, screen: screen });

const fuelIndicator = grid.set(0, 0, 1, 3, contrib.gauge, {
  label: "Fuel",
  stroke: "green",
  fill: "white"
});

const controls: any = grid.set(0, 3, 4, 3, contrib.tree, {
  label: "Commands",
  focusable: true
});
controls.focus();
controls.setData({
  extended: true,
  children: {
    Movement: {
      children: {
        Speed: {
          children: {
            "Full Speed": {},
            "Medium Speed": {},
            "Low Speed": {},
            Reverse: {}
          }
        }
      }
    }
  }
});

controls.on("select", function(node: any) {
  switch (node.name) {
    case "Full Speed":
      gameLoop.addRunOnce((_delta, state) => ({
        ...state,
        speed: 100
      }));
      break;
  }
});

const speedIndicator = grid.set(1, 2, 1, 1, contrib.donut, {
  label: "Engines",
  radius: 8,
  arcWidth: 3,
  remainColor: "black",
  yPadding: 2
});

const log = grid.set(1, 0, 3, 2, contrib.log, {
  fg: "green",
  selectedFg: "green",
  label: "Ship Log"
});

screen.key(["escape", "q", "C-c"], function(_ch, _key) {
  return process.exit(0);
});

gameLoop.subscribe(state => {
  fuelIndicator.setPercent(state.fuel);
  speedIndicator.setData([
    { percent: state.speed.toString(), label: "web1", color: "green" }
  ]);
  screen.render();
  log.log("Rendering");
});

gameLoop.start();
