import express from 'express'
import server from 'http'
import io from 'socket.io'
import path from 'path'
import ejs from 'ejs'

const app = express()
const serv = server.createServer(app)
const servIO = io.serv

io(serv)

app.use(express.static(path.join(process.cwd(), 'public')))
app.set('views', path.join(process.cwd(), 'public'))
app.engine('html', ejs.renderFile)
app.set('view engine', 'html')

app.use('/', (request, response) => {
  response.render('index.html')
})

serv.listen(3000)
