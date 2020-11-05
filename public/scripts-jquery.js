var script1 = document.createElement('script1');
script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js';
script1.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script1);

var script2 = document.createElement('script2');
script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.1/socket.io.j';
script2.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script2);

var socket = io('http://localhost:3000')

function renderMessage(message) {
  $('.messages').append(
    `<div class="message"><strong>${message.author}</strong>: ${message.msg}</div>`
  )
}

socket.on('receivedMessage', function (message) {
  renderMessage(message)
})

socket.on('previousMessages', function (messages) {
  for (message of messages) {
    renderMessage(message)
  }
})

$('#chat').submit(function (event) {
  event.preventDefault()
  var author = $('input[name=username]').val()
  var msg = $('input[name=message]').val()

  if (author.length && msg.length) {
    var msgObject = {
      author: author,
      msg: msg
    }

    renderMessage(msgObject)
    socket.emit('sendMessage', msgObject)
  }
})
