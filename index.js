const audio = require('win-audio');
const robot = require('robotjs')
// robot.keyTap("audio_play")
// speaker volume
const speaker = audio.speaker;
// get the current volume percentage
var currentVolume = speaker.get();

console.log(currentVolume)
console.log(speaker.isMuted())

const Player = require("winplayer-node");
let player;
// player = Player.Play()
function onUpdate() {
    const update = player.getUpdate();
    console.log(update.then((mediaStatus) => { 
        // mediaStatus
        console.log(mediaStatus['status']) 
        console.log(mediaStatus['metadata']['title']) 

    }));
    // player.Play()
}

player = new Player(onUpdate);

// const si = require('systeminformation');

// // promises style - new since version 3
// // si.cpu()
// //   .then(data => console.log(data))
// //   .catch(error => console.error(error));

// si.cpuTemperature().then(data=>
//     console.log(data))