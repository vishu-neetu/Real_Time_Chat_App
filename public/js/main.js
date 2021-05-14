const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and Room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});


const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get Room and uSers
socket.on('roomUsers', ({ room, users })=>{
    outputRoomName(room);
    outputUsers(users);
});

// Message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    // Scroll Down the page
    chatMessages.scrollTop = chatMessages.scrollHeight;

});

// Message submit
chatForm.addEventListener('submit', (e)=>{
    e.preventDefault();

    // get the text message
    const msg = e.target.elements.msg.value;

    // Emit a message to server
    socket.emit('chatMessage', msg);

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output Messagr to Dom
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to Dom 
function outputRoomName(room) {
    roomName.innerText = room;
}

// Add users to DOM

function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}