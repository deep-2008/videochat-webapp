const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;
var currentuser = prompt()


var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: portForPeer
});

let myVideoStream;

 //If the the metadata is loaded completely after that our video starts to play i.e. our camera becomes on
const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
};

const connectToNewUser = (userId, stream) => {
  console.log("Connecting to new user");
  //This function will call a user with userId passed and it will pass the stream to that user
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    
    //THis events does that when we call this user we're gonna send them 
    //our video stream and when they send us back their video 
    //stream we are gonna get this event here called the 
    //stream which is going to take their video stream so 
    call.on('stream', userVideoStream => {
      console.log("Adding video stream")
       //We are taking stream from the other user that we are calling and adding it to out own custom video element on our page
        addVideoStream(video, userVideoStream);
    })

    //Whenever someone leaves the video call we want to remove their video so we use the following code
    call.on('close',function(){
        console.log("removing User at",new Date())
        video.remove();
    })

    
    peer[userId]=call;
}

//coneecting our video
//stream is out audio and video
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    // console.log("Tik TIk")
    //When someone tries to call us we will send our stream through it
    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
        call.on('close',function(){
            console.log("removing User 1")
            video.remove();
        })
    })

    socket.on('user-connected', (userId) => {
      console.log("User connected with userId",userId)
        connectToNewUser(userId, stream);
    })

    socket.on('user-disconnected', (userId) => {
        console.log("User disconnected with userId",userId,"at",new Date());    
        connectToNewUser(userId, stream); 
      })
})

peer.on('open', id => {
    console.log("Opening peer")
    socket.emit('join-room', ROOM_ID, id);
});






let text = $('input');
    $('html').keydown(e => {
        if (e.which == 13 && text.val().length !== 0) {
            socket.emit('message', {text:text.val(), user:currentuser});
            console.log(text.val());
            text.val('')
        }
    });

    socket.on('createMessage', message => {
        $('ul').append(`<li class="message"><b>${message.user}</b><br />${message.text}</li>`)
        scrollToBottom();
    })

const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>PlayVideo</span>`
    $('.main_video_button').html(html);
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>`
    $('.main_video_button').html(html);
}


const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if(enabled){
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    }
    else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}


const scrollToBottom = () => {
    let d = $('main_chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}
const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>`
    $('.main_mute_button').html(html);
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Ummte</span>`
    $('.main_mute_button').html(html);
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }
    else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }

    
}