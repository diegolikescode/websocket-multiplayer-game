import http from 'http'
import {server}from 'websocket'
import crypto from 'crypto'
import {createGame, joinGame, open, playRound, updateConnection} from './handleEvents.js'

export const generateUUID = () => {
    const buffer = crypto.randomBytes(16)
    buffer[6] = (buffer[6] & 0x0f) | 0x40
    buffer[8] = (buffer[8] & 0x3f) | 0x80

    return buffer.toString('hex').toUpperCase()
}

const httpServer = http.createServer()
httpServer.listen(6969, () => console.log("listening on 6969"))

const wsServer = new server({
    httpServer: httpServer
})

export const matrixW = 6
export const matrixH = 7

export const clients = {}
export const games = {}

wsServer.on('request', req => {
    const conn = req.accept(null, req.origin)
    conn.on('open', () => {
        console.log('open', msg)
    })
    conn.on('close', () => console.log('closed'))

    conn.on('message', msg => {
        const result = JSON.parse(msg.utf8Data)
        updateConnection(result.clientID, conn)

        if(result.method === 'open') {
            open(result, conn)
        }

        if (result.method === 'create') {
            createGame(result, conn)
        }

        if (result.method === 'join') {
            joinGame(result, conn)

        }

        if (result.method === 'playRound') {
            playRound(result, conn)
        }
    })
})

