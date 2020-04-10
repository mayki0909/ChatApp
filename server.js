const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
console.log('baje laufa')

app.set('views','./views')
app.set('view engine','ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))


const rooms = {}


app.get('/', (req,res)=>{
    res.render('index', {rooms: rooms})
})

app.get('/:room',(req,res)=>{
    if(rooms[req.params.room] == null){
        return res.redirect('/')
    }
    res.render('room',{roomName: req.params.room, users2: rooms[req.params.room]})
})

app.post('/room',(req, res)=>{
    //ce je je ze dodana je ne doda
    if(rooms[req.body.room] != null){
        return res.redirect('/')
    }
    //jo doda
    rooms[req.body.room] = { users: {} }
    //console.log("key: "+req.body.room+" vrednost: "+Object.values(rooms[req.body.room].users));
    //preusmer na site
    res.redirect(req.body.room)
    // ADD new room to index
    io.emit('room-created', req.body.room)

    
})


server.listen(3000)

io.on('connection', socket =>{
    socket.on('new-user',(room,name)=>{
        socket.join(room)
        rooms[room].users[socket.id] = name
        socket.to(room).broadcast.emit('user-connected',name)       
    })

    
    

    //pošlje vsem ostalim clientom
    socket.on('send-chat-message',(room,message) =>{
        socket.to(room).broadcast.emit('chat-message',{ 
            message: message,
            name: rooms[room].users[socket.id] })
    })

    socket.on('disconnect',()=>{
        getUserRooms(socket).forEach(room => {     

            socket.broadcast.emit('user-disconnected',rooms[room].users[socket.id])
            delete rooms[room].users[socket.id]

        });
    }
    )
    socket.on('users',(roomName) =>{
        io.in(roomName).emit('users-room',rooms[roomName].users)
    })

    

    
})

function getUserRooms(socket){
    return Object.entries(rooms).reduce((names, [name,room])=>{
        if(room.users[socket.id] != null ) names.push(name)
        return names
    }, [])
}

