const Player = require("winplayer-node");
var mqtt = require('mqtt');
const audio = require('win-audio');


const MQTT_SERVER = "api.easyfarming.net";
const MQTT_PORT = "1883";
//if your server don't have username and password let blank.
const MQTT_USER = "";
const MQTT_PASSWORD = "";

const speaker = audio.speaker;

// Connect MQTT
var client = mqtt.connect({
    host: MQTT_SERVER,
    port: MQTT_PORT,
    username: MQTT_USER,
    password: MQTT_PASSWORD
});

client.on('connect', function () {
    // Subscribe any topic
    console.log("MQTT Connect");
    client.subscribe('/mediaControl/mediaControl/volume', function (err) {
        if (err) {
            console.log(err);
        }
    });
    client.subscribe('/mediaControl/mediaControl/play', function (err) {
        if (err) {
            console.log(err);
        }
    });
});



let player;
// player = Player.Play()
let lastState
function onUpdate() {
    const update = player.getUpdate();
    update.then((mediaStatus) => {
        // mediaStatus
        try {
            // console.log(mediaStatus['status']) 
            // console.log(mediaStatus['metadata']['title'])
            // console.log(`{
            //     'status':${mediaStatus['status']},
            //     'title':${mediaStatus['metadata']['title']}
            // }`)
            // console.log(mediaStatus['status'])
            // if (lastState != mediaStatus['status']){
            // console.log("Media Status Updated")
            // console.log(mediaStatus['status'])
            lastState = mediaStatus['status'];
            client.publish('/mediaControl/mediaStatus/status', lastState, { retain: true, qos: 2 })
            // client.publish('/mediaControl/mediaStatus/status', mediaStatus['status'], { retain: true, qos: 2 })
            // client.publish('/mediaControl/mediaStatus/status', mediaStatus['status'], { retain: true, qos: 2 })
            // "title":"${mediaStatus['metadata']['title']}"
            // }
            // else{
            //     console.log("Just repeated media Status")
            // }
            // client.publish('/mediaControl/mediaControl/volume',mediaStatus['status'],{qos:2}) 

            // client.publish('/mediaControl/mediaStatus/status',mediaStatus['status'])
            // client.publish('/mediaControl/mediaStatus/title',mediaStatus['metadata']['title'])

        }
        catch {
            console.log("Media get update Error")
        }

    });
    // player.Play()
}

player = new Player(onUpdate);
var currentVol

// Receive Message and print on terminal
client.on('message', function (topic, message) {
    // message is Buffer
    // console.log(topic)
    // console.log(message.toString());
    if (message.toString() == "Toggle") {
        console.log(lastState)
        player.PlayPause()
        // if (lastState == "Playing"){
        //         // setTimeout(()=>{})
        //         player.Pause()
        // }
        // if (lastState == "Paused"){
        //         player.Play()
        // }
    }

    if (message.toString() == "Next") {
        player.Next()
    }
    if (message.toString() == "Previous") {
        player.Previous()
    }
    if (topic == "/mediaControl/mediaControl/volume") {
        currentVol = speaker.get()
        // console.log(currentVol)
        if (message.toString() == "Up") {
            speaker.set(currentVol + 2)
        }
        if (message.toString() == "Down") {
            speaker.set(currentVol - 2)
        }
        if (message.toString() == "Off") {

            if (speaker.isMuted()) {
                speaker.unmute()
            }
            else {
                speaker.mute()
            }
            // client.publish('/mediaControl/mediaStatus/volume',``,{qos:2}) 
        }
        client.publish('/mediaControl/mediaStatus/volume', `${speaker.get().toString()},${speaker.isMuted().toString()}`, { qos: 2, retain: true })
        // client.publish('/mediaControl/mediaStatus/volume', `${speaker.get().toString()},${speaker.isMuted().toString()}`, { qos: 2, retain: true })
        // client.publish('/mediaControl/mediaStatus/volume', `${speaker.get().toString()},${speaker.isMuted().toString()}`, { qos: 2, retain: true })
    }
    // if (message.toString() == "Play"){
    //     player.Play()
    // }
    // if (message.toString() == "Pause"){
    // }
});