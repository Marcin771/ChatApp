'use strict';
const registrationPage = document.querySelector('#registration-page');
const loginPage = document.querySelector('#login-page');
const chatPage = document.querySelector('#chat-page');
const registrationForm = document.querySelector('#registrationForm');
const loginForm = document.querySelector('#loginForm');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const connectingElement = document.querySelector('.connecting');
const chatArea = document.querySelector('#chat-messages');
const logout = document.querySelector('#logout');

let stompClient = null;
let nickname = null;
// let fullname = null;
let password = null;
let selectedUserId = null;

function connect(event) {
    nickname = document.querySelector('#login-nickname').value.trim();
    password = document.querySelector('#login-password').value.trim();

    if (nickname && password) {
        loginPage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        const socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}

//function register(event){
//    nickname = document.querySelector('#registration-nickname').value.trim();
//    password = document.querySelector('#registration-password').value.trim();
//
//    if(nickname && password){
//    fetch('/app/registerUser',{
//        method: 'POST',
//        headers: {
////            "Connect-Type": 'application/json'
////        },
////        body: JSON.stringyfy({nickName: nickname, password: password})
//            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'  // Zmieniony typ zawartości
//            },
//            body: `nickname=${encodeURIComponent(nickname)}&password=${encodeURIComponent(password)}`  // Kodowanie parametrów jako formularz URL-encoded
//        })
//        .then(response => {
//            if(response.ok) {
//                registrationPage.classList.add('hidden');
//                loginPage.classList.remove('hidden');
//            }else {
//                alert('Registration failed. Please try again.');
//            }
//        })
//        .catch(error => {
//        console.error('Error during registration:', error);
//        alert('An error occured during registration.');
//        });
//    }
//    event.preventDefault();
//}

 function register() {
            document.getElementById('registrationForm').addEventListener('submit', function(event) {
                event.preventDefault(); // Zapobiegamy domyślnej akcji wysłania formularza

                nickname = document.getElementById('registration-nickname').value.trim();
                password = document.getElementById('registration-password').value.trim();

                const formData = {
                    nickName: nickname,
                    password: password
                };

                fetch('/app/registerUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Registration failed.'); // Rzuca błąd w przypadku niepowodzenia żądania
                    }
                    return response.json(); // Parsuje odpowiedź jako JSON
                })
                .then(data => {
                    alert('Registration successful.'); // Wyświetla alert o udanej rejestracji
                    console.log('Registration response:', data); // Loguje odpowiedź z serwera w konsoli
                    // Możesz dodać dalszą logikę tutaj, np. przekierowanie do innej strony
                })
                .catch(error => {
                    alert(`Registration failed: ${error.message}`); // Wyświetla alert o niepowodzeniu z komunikatem błędu
                    console.error('Registration error:', error); // Loguje szczegóły błędu w konsoli
                });
            });



  /*  if (nickname && password) {
       fetch('/app/registerUser', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
           },
           body: JSON.stringify({
               nickname: 'example',
               password: 'examplePassword',
               // inne dane do zarejestrowania
           }),
       })
       .then(response => response.json())
       .then(data => {
           // obsługa odpowiedzi z serwera
           console.log(data);
       })
       .catch(error => {
           console.error('Error:', error);
       });

    }*/

    event.preventDefault();
}



function onConnected() {
    stompClient.subscribe(`/user/${nickname}/queue/messages`, onMessageReceived);
    stompClient.subscribe(`/user/public`, onMessageReceived);

    // register the connected user
    stompClient.send("/app/user.addUser",
        {},
        JSON.stringify({ nickName: nickname, password: password, status: 'ONLINE' })
    );
    document.querySelector('#connected-user-fullname').textContent = password;
    findAndDisplayConnectedUsers().then();
}

async function findAndDisplayConnectedUsers() {
    const connectedUsersResponse = await fetch('/users');
    let connectedUsers = await connectedUsersResponse.json();
    connectedUsers = connectedUsers.filter(user => user.nickName !== nickname);
    const connectedUsersList = document.getElementById('connectedUsers');
    connectedUsersList.innerHTML = '';

    connectedUsers.forEach(user => {
        appendUserElement(user, connectedUsersList);
        if (connectedUsers.indexOf(user) < connectedUsers.length - 1) {
            const separator = document.createElement('li');
            separator.classList.add('separator');
            connectedUsersList.appendChild(separator);
        }
    });
}

function appendUserElement(user, connectedUsersList) {
    const listItem = document.createElement('li');
    listItem.classList.add('user-item');
    listItem.id = user.nickName;

    const userImage = document.createElement('img');
    userImage.src = '../img/user_icon.png';
    userImage.alt = user.password;

    const usernameSpan = document.createElement('span');
    usernameSpan.textContent = user.password;

    const receivedMsgs = document.createElement('span');
    receivedMsgs.textContent = '0';
    receivedMsgs.classList.add('nbr-msg', 'hidden');

    listItem.appendChild(userImage);
    listItem.appendChild(usernameSpan);
    listItem.appendChild(receivedMsgs);

    listItem.addEventListener('click', userItemClick);

    connectedUsersList.appendChild(listItem);
}

function userItemClick(event) {
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });
    messageForm.classList.remove('hidden');

    const clickedUser = event.currentTarget;
    clickedUser.classList.add('active');

    selectedUserId = clickedUser.getAttribute('id');
    fetchAndDisplayUserChat().then();

    const nbrMsg = clickedUser.querySelector('.nbr-msg');
    nbrMsg.classList.add('hidden');
    nbrMsg.textContent = '0';

}

function displayMessage(senderId, content) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');
    if (senderId === nickname) {
        messageContainer.classList.add('sender');
    } else {
        messageContainer.classList.add('receiver');
    }
    const message = document.createElement('p');
    message.textContent = content;
    messageContainer.appendChild(message);
    chatArea.appendChild(messageContainer);
}

async function fetchAndDisplayUserChat() {
    const userChatResponse = await fetch(`/messages/${nickname}/${selectedUserId}`);
    const userChat = await userChatResponse.json();
    chatArea.innerHTML = '';
    userChat.forEach(chat => {
        displayMessage(chat.senderId, chat.content);
    });
    chatArea.scrollTop = chatArea.scrollHeight;
}


function onError() {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function sendMessage(event) {
    const messageContent = messageInput.value.trim();
    if (messageContent && stompClient) {
        const chatMessage = {
            senderId: nickname,
            recipientId: selectedUserId,
            content: messageInput.value.trim(),
            timestamp: new Date()
        };
        stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
        displayMessage(nickname, messageInput.value.trim());
        messageInput.value = '';
    }
    chatArea.scrollTop = chatArea.scrollHeight;
    event.preventDefault();
}


async function onMessageReceived(payload) {
    await findAndDisplayConnectedUsers();
    console.log('Message received', payload);
    const message = JSON.parse(payload.body);
    if (selectedUserId && selectedUserId === message.senderId) {
        displayMessage(message.senderId, message.content);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    if (selectedUserId) {
        document.querySelector(`#${selectedUserId}`).classList.add('active');
    } else {
        messageForm.classList.add('hidden');
    }

    const notifiedUser = document.querySelector(`#${message.senderId}`);
    if (notifiedUser && !notifiedUser.classList.contains('active')) {
        const nbrMsg = notifiedUser.querySelector('.nbr-msg');
        nbrMsg.classList.remove('hidden');
        nbrMsg.textContent = '';
    }
}

function onLogout() {
    stompClient.send("/app/user.disconnectUser",
        {},
        JSON.stringify({ nickName: nickname, password: password, status: 'OFFLINE' })
    );
    window.location.reload();
}
registrationForm.addEventListener('submit', register, true);
loginForm.addEventListener('submit', connect, true); // step 1
messageForm.addEventListener('submit', sendMessage, true);
window.onbeforeunload = () => onLogout();
//dodany kod do obsługi zdarzenia logout,
//aby zachować funkcjonalność wylogowania użytkownika i rozłączenia z serwerem WebSocket.
//logout.addEventListener('click', onLogout, true);
logout.addEventListener('click', () => {
    if (stompClient) {
        stompClient.send("/app/user.disconnectUser",
            {},
            JSON.stringify({ nickName: nickname, password: password, status: 'OFFLINE' })
        );
        stompClient.disconnect();
    }
    loginPage.classList.remove('hidden');
    chatPage.classList.add('hidden');
});