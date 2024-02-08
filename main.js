const Player = require("winplayer-node");
var mqtt = require('mqtt');
const audio = require('win-audio');
var robot = require('robotjs')

require('dotenv').config()

const MQTT_SERVER = process.env.MQTT_SERVER;
const MQTT_PORT = process.env.MQTT_PORT;
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
    client.subscribe('/presentControl/presentControl/#', function (err) {
        if (err) {
            console.log(err);
        }
    });
});



let player;
// player = Player.Play()
let lastState
function onUpdate() {
    try {
        const update = player.getUpdate();
        update.then((mediaStatus) => {
            lastState = mediaStatus['status'];
            client.publish('/mediaControl/mediaStatus/status', lastState, { retain: true, qos: 2 })
        });
    }
    catch {
        console.log("Media get update Error")
    }
}

player = new Player(onUpdate);
var currentVol

// Receive Message and print on terminal
client.on('message', function (topic, message) {
    // message is Buffer
    // console.log(topic)
    // console.log(message.toString());
    var baseTopic = topic.split("/")[1]
    try {
        if (baseTopic == "mediaControl") {
            if (message.toString() == "Toggle") {
                console.log(lastState)
                player.PlayPause()
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
            }
        }
        else if (baseTopic == "presentControl"){
            if (message.toString() === "Next"){
                console.log('right')
                robot.keyTap('right')
            }
            if (message.toString() === "Previous"){
                console.log('left')
                robot.keyTap('left')
            }
            if (message.toString() === "Exit"){
                console.log('escape')
                robot.keyTap('escape')
            }
            if (message.toString() === "Show"){
                console.log('f5')
                robot.keyTap('f5')
            }
        }
    }
    catch {

    }
    // if (message.toString() == "Play"){
    //     player.Play()
    // }
    // if (message.toString() == "Pause"){
    // }
});