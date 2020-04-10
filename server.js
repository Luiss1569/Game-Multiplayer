import express from 'express'
import http from 'http'
import createGame from './public/game.js'
import socketio from 'socket.io'

const app = express()
const server = http.createServer(app)
const sockets = socketio(server)

app.use(express.static('public'))

const game = createGame()

game.subscribe((command) => {
    console.log(`> Emitting ${command.type}`)
    sockets.emit(command.type, command)
})

sockets.on('connection', (socket) => {
    const playerId = socket.id
    const {name,admin} = socket.handshake.query
    console.log(`> Player connected: ${playerId}`)

    if(!admin){
        game.addPlayer({ playerId: playerId, name })
    }

    socket.emit('setup', game.state)

    socket.on('disconnect', () => {
        game.removePlayer({ playerId: playerId })
        console.log(`> Player disconnected: ${playerId}`)
    })

    socket.on('move-player', (command) => {
        command.playerId = playerId
        command.type = 'move-player'
        
        game.movePlayer(command)
    })

    socket.on('game-start', () => {
        game.start()
    })

    socket.on('game-pause', () => {
        game.pause()
    })

    socket.on('game-reset', () => {
        game.resetPoints()
    })

})

server.listen(3000, () => {
    console.log(`> Server listening on port: 3000`)
})