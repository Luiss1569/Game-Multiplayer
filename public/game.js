import { mod } from "./utils.js"

export default function createGame() {
    const state = {
        players: {},
        fruits: {},
        screen: {
            width: 55,
            height: 40
        },
        inteval: null,
        frequency: 4000,
        status: 0       
    }

    const observers = []

    function start() {
        state.inteval = setInterval(addFruit, state.frequency)
        notifyAll({type: 'start'})
    }

    function pause(){
        clearInterval(state.inteval)
        notifyAll({type: 'pause'})
    }

    function start_crazy(){
        clearInterval(state.inteval)
        state.inteval = setInterval(addFruit, 1000)
        notifyAll({type: 'crazy'})
    }

    function stop_crazy(){
        clearInterval(state.inteval)
        state.inteval = setInterval(addFruit, state.frequency)
        notifyAll({type: 'ncrazy'})
    }

    function subscribe(observerFunction) {
        observers.push(observerFunction)
    }

    function notifyAll(command) {
        for (const observerFunction of observers) {
            observerFunction(command)
        }
    }

    function setState(newState) {
        Object.assign(state, newState)
    }

    function updateScore(players){
        state.players = players
    }

    function addPlayer(command) {
        const playerId = command.playerId
        const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width)
        const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height)
        const score = 0
        const name = command.name

        state.players[playerId] = {
            x: playerX,
            y: playerY,
            score,
            name
        }
        
        notifyAll({
            type: 'add-player',
            playerId: playerId,
            playerX: playerX,
            playerY: playerY,
            score,
            name
        })
    }

    function removePlayer(command) {
        const playerId = command.playerId

        delete state.players[playerId]

        notifyAll({
            type: 'remove-player',
            playerId: playerId
        })
    }

    function addFruit(command) {
        const fruitId = command ? command.fruitId : Math.floor(Math.random() * 10000000)
        const fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width)
        const fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height)

        state.fruits[fruitId] = {
            x: fruitX,
            y: fruitY
        }

        notifyAll({
            type: 'add-fruit',
            fruitId: fruitId,
            fruitX: fruitX,
            fruitY: fruitY
        })
    }

    function removeFruit(command) {
        const fruitId = command.fruitId

        delete state.fruits[fruitId]

        notifyAll({
            type: 'remove-fruit',
            fruitId: fruitId,
        })
    }

    function movePlayer(command) {
        notifyAll(command)
        
        const acceptedMoves = {
            ArrowUp(player) {
                player.y = mod(state.screen.height, player.y - 1)
            },
            ArrowRight(player) {
                player.x = mod(state.screen.width, player.x + 1)
            },
            ArrowDown(player) {
                player.y = mod(state.screen.height, player.y + 1)
            },
            ArrowLeft(player) {
                player.x = mod(state.screen.width, player.x - 1)
            }
        }

        const keyPressed = command.keyPressed
        const playerId = command.playerId
        const player = state.players[playerId]
        const moveFunction = acceptedMoves[keyPressed]

        if (player && moveFunction) {
            moveFunction(player)
            checkForFruitCollision(playerId)
        }

    }

    function checkForFruitCollision(playerId) {
        const player = state.players[playerId]

        for (const fruitId in state.fruits) {
            const fruit = state.fruits[fruitId]
            // console.log(`Checking ${playerId} score ${player.score} and ${fruitId}`)

            if (player.x === fruit.x && player.y === fruit.y) {
                // console.log(`COLLISION between ${playerId} and ${fruitId}`)
                removeFruit({ fruitId: fruitId })
                player.score += 1
            }
        }
    }

    function resetPoints(){
        for(const playerId in state.players){
            const player = state.players[playerId]
            player.score = 0
        }

        notifyAll({
            type: 'reset',
            command: state.players
        })
    }

    return {
        addPlayer,
        removePlayer,
        movePlayer,
        addFruit,
        removeFruit,
        state,
        setState,
        subscribe,
        start,
        pause,
        resetPoints,
        start_crazy,
        stop_crazy,
        updateScore
    }
}
