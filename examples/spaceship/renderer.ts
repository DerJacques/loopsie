import blessed from "blessed";
import contrib from "blessed-contrib";
import { gameLoop } from "./logic";
import { setSpeed, setOrientation, setSolarPanels } from "./models/ship";

const screen = blessed.screen({
  debug: true,
  smartCSR: true
});

const grid = new contrib.grid({ rows: 4, cols: 6, screen: screen });

const fuelIndicator = grid.set(0, 0, 1, 3, contrib.gauge, {
  label: "Fuel",
  stroke: "green",
  fill: "white"
});

enum ControlType {
  Speed,
  Heading,
  ExpandSolarPanels
}

const prompt = blessed.prompt({
  top: "center",
  left: "center",
  width: "50%",
  height: "50%",
  tags: true,
  shadow: true,
  border: {
    type: "line"
  },
  style: {
    fg: "white",
    bg: "black"
  }
});

const log = grid.set(3, 0, 1, 2, contrib.log, {
  fg: "green",
  selectedFg: "green",
  label: "Ship Log"
});

const stats: any = grid.set(1, 0, 2, 2, contrib.markdown, {
  label: "Stats"
});

const controls: any = grid.set(0, 3, 4, 3, contrib.tree, {
  label: "Commands",
  focusable: true,
  vi: true
});

controls.setData({
  extended: true,
  children: {
    Movement: {
      children: {
        Speed: {
          children: {
            "Full Speed": {
              type: ControlType.Speed,
              speed: 100
            },
            "Medium Speed": {
              type: ControlType.Speed,
              speed: 50
            },
            "Low Speed": {
              type: ControlType.Speed,
              speed: 10
            },
            Reverse: {
              type: ControlType.Speed,
              speed: -10
            }
          }
        },
        Heading: {
          children: {
            "Set Heading": {
              type: ControlType.Heading
            }
          }
        }
      }
    },
    Energy: {
      children: {
        "Close Solar Panels": {
          type: ControlType.ExpandSolarPanels,
          expand: false
        },
        "Expand Solar Panels": {
          type: ControlType.ExpandSolarPanels,
          expand: true
        }
      }
    }
  }
});

controls.focus();

controls.on("select", function(node: any) {
  switch (node.type) {
    case ControlType.Speed:
      gameLoop.addRunOnce((_delta, state) => ({
        ...state,
        player: setSpeed(state.player, node.speed)
      }));
      log.log(`New speed: ${node.speed}`);
      break;

    case ControlType.Heading:
      prompt.input("Set Heading", "", (_err, value: unknown) => {
        if (!isNaN(value as number)) {
          log.log(`New heading: ${value}`);
          gameLoop.addRunOnce((_delta, state) => ({
            ...state,
            player: setOrientation(state.player, Number(value))
          }));
        }
      });
      break;

    case ControlType.ExpandSolarPanels:
      gameLoop.addRunOnce((_delta, state) => ({
        ...state,
        player: setSolarPanels(state.player, node.expand)
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

screen.append(prompt);

screen.key(["escape", "q", "C-c"], function(_ch, _key) {
  return process.exit(0);
});

gameLoop.subscribe(state => {
  fuelIndicator.setPercent(state.player.fuel);
  speedIndicator.setData([
    {
      percent: Math.abs(state.player.speed).toString(),
      label: "Speed",
      color: state.player.speed >= 0 ? "green" : "red"
    }
  ]);
  stats.setMarkdown(
    `
Position:
- X: ${state.player.position.x.toFixed(2)}
- Y: ${state.player.position.y.toFixed(2)}
- Orientation: ${state.player.orientation}
    `
  );

  screen.render();
});

gameLoop.start();
