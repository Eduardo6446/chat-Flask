document.addEventListener('DOMContentLoaded', ()=> {

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    
    var storage = window.localStorage;

    if(storage.getItem("username")){  
        document.querySelector('#createchannel_button').style.display = "block";
        document.querySelector('#createchannel_button').innerHTML = "CREATE";
        document.querySelector('#welcome_user').innerHTML = storage.getItem("username");
        // document.querySelector("#logout").innerHTML = "Logout";
    }

    if(storage.getItem("current channel")){
        storage.removeItem("current channel");
    }

    socket.on('connect', () => {
        if(!storage.getItem("username")){
            document.querySelector("#chat_page").style.display = "none";
            document.querySelector('#createchannel_button').style.display = "none";
        }else{
            document.querySelector("#login_page").style.display = "none";
        }
    });

    socket.on('alert', message => {
        alert(message);
    });

    document.querySelector("#login_form").onsubmit = () => {
        
        const username = document.querySelector("#username");

        if(username.value.length < 3){
            alert("Username must be at least 3 characters long!");
            return false;
        }

        socket.emit("login", username.value);
        return false;
    };

    socket.on("login", username => {
        storage.setItem("username", username);
        document.querySelector("#login_page").style.display = "none";
        document.querySelector("#chat_page").style.display = "block";
        document.querySelector('#createchannel_button').style.display = "block";
        document.querySelector('#createchannel_button').innerHTML = "CREATE";
        document.querySelector('#welcome_user').innerHTML = storage.getItem("username");
        // document.querySelector("#logout").innerHTML = "Logout";
    });

    document.querySelector('#createchannel').onsubmit = () => {           
        const channelname = document.querySelector('#channelname').value;
        

        if(channelname.length < 3){
            alert("Channel name must be at least 3 characters long!");
            document.querySelector('#channelname').focus();
            return false;
        }
        socket.emit('create channel', channelname);
        document.querySelector('#channelname').value = "";
        $("#myModal").modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        
        return false;
    };

    socket.on('channel created', channelname => {
        const li = document.createElement('li');
        li.innerHTML = `<buttton class="btn btn-link" data-channel="${channelname}">${channelname}</button>`;
        document.querySelector('#channel_list').append(li);
        buttons = document.querySelectorAll('.btn-link');
        buttons.forEach(button => {
            button.onclick = () => {
                const channelname = button.dataset.channel;
                const username = storage.getItem("username");
                socket.emit('join channel', channelname, username);
            }            
        });
    });

    /*socket.on('remove channel', channelname =>{
        
        var content = document.querySelector('#messages');
        while (content.hasChildNodes()) {  
            content.removeChild(content.firstChild);
        }


    });*/

    document.querySelectorAll('.btn-link').forEach(button => {
        button.onclick = () => {
            const channelname = button.dataset.channel;
            const username = storage.getItem("username");
            socket.emit('join channel', channelname, username);
        }
    });

    socket.on('channel joined', data => {        
        storage.setItem("current channel", data.channelname);
        alert(`You have joined the channel: ${data.channelname}`);
        document.querySelector("#chat_msg_header").innerHTML = data.channelname;

        var content = document.querySelector('#messages');
        while (content.hasChildNodes()) {  
            content.removeChild(content.firstChild);
        }

        const messages = data.messages[data.channelname];
        //console.log(messages);
        if(typeof messages !== 'undefined'){
            for (var i=0; i<messages.length; i++){
                //let joined = data.channelname;
                let username = messages[i][0];
                let date = messages[i][1];
                let time = messages[i][2];
                let message = messages[i][3];

                //let div2 = document.createElement('div');
                //div2.innerHTML = `<div class="user-join"><p><b>${username}</b> se ha unido</p></div>`;
                //document.querySelector('#messages').append(div2);

                let div = document.createElement('div');
                if(username === storage.getItem("username")){
                    div.innerHTML = `<div class="message outgoing"><h5>${username}:</h5><p>${message}</p><small> ${date} ${time} </small></div>`;
                }else{
                    div.innerHTML = `<div class="message incoming"><h5>${username}:</h5><p>${message}</p><small> ${date} ${time} </small></div>`;
                }
                document.querySelector('#messages').append(div);
    
            }
        }

    });

    document.querySelector('#message_submit').onsubmit = () => {
        const channelname = storage.getItem("current channel");
        const username = storage.getItem("username");
        const message = document.querySelector('#message_input').value;

        const d = new Date();

        const time = d.toLocaleString('en-US',{ hour: 'numeric', minute: 'numeric', hour12: true })
        var date = d.toDateString();
        date = date.slice(4,date.length);

        if (message.length <= 0) {
            alert("Message cannot be empty!");
            return false;
        }
        
 
        if (channelname !== null){
            socket.emit('send message', channelname, username, message, date, time);
            document.querySelector('#message_input').value = "";            
        }else{
            alert("You need to join a channel before sending a message");
        }
        return false;
    };

    socket.on('receive message', received => {
        const channelname = received.channelname;
        const data = received.data;
        const username = data[0];
        const date = data[1];
        const time = data[2];
        const message = data[3];

        if(channelname === storage.getItem("current channel")){
            //const div2 = document.createElement('div');
            //div2.innerHTML = `<div class="user-join"><p><b>${username}</b> se ha unido</p></div>`;
            //document.querySelector('#messages').append(div2);

            const div = document.createElement('div');
            if(username === storage.getItem("username")){
                div.innerHTML = `<div class="message outgoing"><h5>${username}:</h5><p>${message}</p><small> ${date} ${time} </small></div>`;
            }else{
                div.innerHTML = `<div class="message incoming"><h5>${username}:</h5><p>${message}</p><small> ${date} ${time} </small></div>`;
            }
            document.querySelector('#messages').append(div);
        }
    });

});


//disabled <- pruebas xd