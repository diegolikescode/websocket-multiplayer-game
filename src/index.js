import { randomUUID} from 'crypto'
const server = require('http').createServer()
const WebsocketServer = require('websocket').server

import http from 'http'

server.listen(6969, () => console.log("listening on 6969"))

const wsServer = new WebsocketServer({
    'httpServer': server
})

const clients = {}

wsServer.on('request', req => {
    const conn = req.accept(null, request.origin)
    conn.on('open', () => console.log('open'))
    conn.on('close', () => console.log('closed'))
    conn.on('message', msg => {
        // (msg, conn)
        console.log(JSON.parse(msg.utf8Data))
    })

    handleRequest(conn)
})

function handleRequest(connection) {
    const newClientId = randomUUID()
    clients[newClientId] = {
        connection
    }

    const payload = {
        method: 'connect',
        clientId: newClientId,
    }

    conn.send(JSON.stringify(payload))
}
