# Loopsie
Loopsie allows you to quickly build and prototype simple games, by providing both a game loop and a simple state management system.

It does not have any opinion in regards to the visual output. Instead, clients can subscribe to state changes and handle them however they see fit.

Loopsie can be used in both node and the browser.
It also is fully TypeScript typed.

## Getting started

### Installation
To install Loopsie, simply add it using your package manager of choice:
```
npm install loopsie
```
or
```
yarn add loopsie
```

### Your first game loop

```javascript
import { GameLoop, perSecond } from "loopsie";

const initialState = {
    score: 0,
    height: 100
}

const gameLoop = new GameLoop(intialState, {
    msPerUdate: 10 // How often new state should be calculated
    maxFPS: 30     // How often subscribers are notifified of latest state
})

// Reduces height by 10 and increases the score by 1, spread over 1 second.
// Called continously until loop is stopped.
// `delta` indicates how many ms have passed since last call
gameLoop.addCallback((delta, state) => {
    return {
        height: state.height - perSecond(10, delta),
        score: state.score + perSecond(1, delta)
    }
})

gameLoop.addCallback((delta, state) => {
    if(state.height >= 0) {
        gameLoop.stop();
    }
})

// On every click, we want to increase the height by 3.
// `addRunOnce` is executed during the next loop
window.addEventListener("click", () => {
    gameLoop.addRunOnce((delta, state) => {
        return {
            ...state,
            height: state.height + 3
        }
    })
})

// Start the loop
gameLoop.start();
```
