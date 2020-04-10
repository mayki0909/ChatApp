//const socket = io('http://localhost:3000')
const socket = io('https://coolestchat.azurewebsites.net:3000')

const messageSend = document.getElementById('send-button')
const messageForm = document.getElementById('messageForm')
const chatContaienr = document.getElementById('chatContainer')
const peopleContainer = document.getElementById('people2')
const roomContainer = document.getElementById('room-created')

const contacts = document.getElementById('contacts')
const roomUsers = {}

if(chatContaienr != null){
    const name = prompt('What is your name?')
    socket.emit('new-user', roomName, name)
    appendMessage("Pozdravljen v serverju: "+roomName+"!!!",'normalMsg')
    //ce prtisnes enter poslje
    chatContaienr.addEventListener('keyup',e =>{
        if (e.keyCode == 13){
            messageSend.click()
        }
    })
    
}

if(messageSend != null){
//ce kliknes gumb poslje
    messageSend.addEventListener('click',e => {  
        sendMessage(e)   
    })
}

if(document.getElementById('action_menu_btn') != null){
    document.getElementById('action_menu_btn').addEventListener('click',e=>{
        if(peopleContainer.style.display == 'none'){
            peopleContainer.style.display = 'block';
            socket.emit("users",roomName)
        }else{
            peopleContainer.style.display = 'none';
        }
    
    })
}

socket.on('user-connected',name =>{
    appendMessage(name+' joined!','joinedMsg')
})

socket.on('user-disconnected',name=>{
    appendMessage(name+' disconected!','joinedMsg')//uporabljam joinedMsg da enako pobarva
})

//posluša server in čaka na event chat-message
socket.on('chat-message', data =>{
    appendMessage(data.message,'normalMsg',data.name)
})

socket.on('room-created', room => {
    console.log("baje je bla nova narjena");
    const roomElement = document.createElement('li')
    const roomLink = document.createElement('a')
    roomLink.href = `/${room}`
    roomLink.innerText = `${room}`
    roomElement.appendChild(roomLink)
    document.getElementById('room-created-ul').append(roomElement)
    
})

socket.on('users-room', users=>{
        console.log("aktiviral")
        
        if (contacts != null){
            contacts.innerHTML =""
            Object.keys(users).forEach(key=>{
                           
                    const user = document.createElement('li')
                    user.id = key
                    user.innerHTML = `<div class="d-flex bd-highlight">
                                        <div class="img_cont">
                                            <img src="" class="rounded-circle user_img">
                                            <span class="online_icon"></span>
                                        </div>
                                        <div class="user_info">	
                                            <span>${users[key]} </span> 
                                            <p> ${users[key]} is online</p> 
                                        </div>
                                    </div>	`
                    contacts.appendChild(user)    
                
                         
            })
        }
        peopleContainer.display = "block"
        
    
})






//fukcija pošlje na server podatke
function sendMessage(e){
    e.preventDefault() //da se ne osveži
    const message =  messageForm.value//dobi sms
    socket.emit('send-chat-message', roomName, message) //poslje sms
    messageForm.value = '' //pobrise sms iz tekst boxa
    appendMessage(message,'clientMsg')
}

//funkcija ki izrise text na zaslonu,
//poda se ji tekst(string), in myMessage(boolean),mojtekst , ali pridobljen iz serverja zriše levo ali desno
// bolje da se funkcija razdeli na več manjših
function appendMessage(message,myMessage,username){
    const newMessage = document.createElement('div')
    const imgDiv = document.createElement('div')
    const msgDiv = document.createElement('div')
    const span = document.createElement('span')
    
    span.className = 'msg_time_send'

    var date = new Date()
    if (!(typeof username !== "undefined" && (typeof username !== "object" || !username))){
        username =""
    }
    span.innerText = username +" "+ date.getHours()+":"+date.getMinutes()+"  "+date.getDate()+"."+date.getMonth()

    if(myMessage == 'clientMsg'){ //client text
        newMessage.className = 'd-flex justify-content-end mb-4'
        imgDiv.className = 'img_cont_msg'
        msgDiv.className = 'msg_cotainer_send'
        newMessage.appendChild(msgDiv)
        newMessage.appendChild(imgDiv)

    } 
    if(myMessage == 'normalMsg'){//broadcast
        newMessage.className = 'd-flex justify-content-start mb-4'
        imgDiv.className = 'img_cont_msg'
        msgDiv.className = 'msg_cotainer'
        span.className='msg_time'
        newMessage.appendChild(imgDiv)
        newMessage.appendChild(msgDiv)
    }
    if(myMessage == 'joinedMsg'){
        newMessage.className = 'd-flex justify-content-start mb-4'
        imgDiv.className = 'img_cont_msg'
        msgDiv.className = 'msg_cotainer_joined'
        span.className='msg_time'
        newMessage.appendChild(imgDiv)
        newMessage.appendChild(msgDiv)
    }
   
    msgDiv.innerText = message
    msgDiv.appendChild(span)
    if(chatContaienr != null){
        chatContaienr.appendChild(newMessage)

    }
}