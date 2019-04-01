import { perSecond } from "../utils";

export interface ShipState {
  fuel: number;
  speed: number;
  orientation: number; // Degrees
  position: {
    x: number;
    y: number;
  };
}

export const getInitialState = (): ShipState => ({
  fuel: 100,
  speed: 5,
  orientation: 30, // Degrees
  position: {
    x: 0,
    y: 0
  }
});

export const setSpeed = (state: ShipState, speed: number): ShipState => ({
  ...state,
  speed
});

export const setOrientation = (
  state: ShipState,
  orientation: number
): ShipState => ({
  ...state,
  orientation
});

/**
 * Adapted from https://www.linuxquestions.org/questions/programming-9/calculating-new-coordinates-based-on-current-position-bearing-and-speed-873045/
 *
 * Define bearing a in radians,
 * a = (angle in degrees) × Pi / 180
 * Normally we define zero angle as towards the positive x axis, increasing towards the positive y axis.
 * If at time t=0 you are at (x(0), y(0)), bearing a and velocity v, then you can calculate the position as a function of time t using
 * x(t) = x(0) + t v cos a
 * y(t) = y(0) + t v sin a
 */
export const move = (shipState: ShipState, delta: number) => {
  const a = (shipState.orientation * Math.PI) / 180;

  return {
    ...shipState,
    fuel: shipState.fuel - perSecond(0.3, delta),
    position: {
      x:
        shipState.position.x +
        perSecond(0.01, delta) * shipState.speed * Math.cos(a),
      y:
        shipState.position.y +
        perSecond(0.01, delta) * shipState.speed * Math.sin(a)
    }
  };
};

// 0 / 360(1, 0);
// 90(0, 1);
// 180(-1, 0);
// 270(0, -1);
