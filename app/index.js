import clock from "clock";
import document from "document";
import * as util from "../common/utils";
import * as fs from "fs";
import { display } from "display";
import { vibration } from "haptics";
import { preferences } from "user-settings";
import { listDirSync } from "fs";


/*********************************************************
Initialization
**********************************************************/


// Make sure device goes standby
display.autoOff = true;

// Update the clock every minute
clock.granularity = "minutes";

// Get a handle on the <text> elements
const shortDay = document.getElementById("shortDay");
const normalDay = document.getElementById("normalDay");
const longDay = document.getElementById("longDay");

// Calculate Start time
let today = new Date()
let hoursStart = today.getHours();
if (preferences.clockDisplay === "12h") {
    // 12h format
    hoursStart = hoursStart % 12 || 12;
  } else {
    // 24h format
    hoursStart = hoursStart;
  }
let minStart = today.getMinutes();

// Calculate Finish time for each work sets
let shortDayFinishHr = hoursStart + 6;
shortDayFinishHr = shortDayFinishHr
let shortDayFinishMin = minStart;

let normalDayFinishHr = hoursStart + 8;
normalDayFinishHr = normalDayFinishHr
let normalDayFinishMin = minStart + 45;
if (normalDayFinishMin > 59){
  normalDayFinishMin = normalDayFinishMin % 60;
  normalDayFinishHr += 1;
}
normalDayFinishMin = normalDayFinishMin

let longDayFinishHr = hoursStart + 10
longDayFinishHr = longDayFinishHr
let longDayFinishMin = minStart + 45
if (longDayFinishMin > 59){
  longDayFinishMin = longDayFinishMin % 60;
  longDayFinishHr += 1;
}
longDayFinishMin = longDayFinishMin


/*********************************************************
Functios
**********************************************************/


function isSnapshotObsolete(snapshotDate) {  
       var currDate = new Date().getDay();  
       return (currDate > snapshotDate);
}  

// Return delta minutes for dirty hackish time conversion
function deltaTime(finishHr, finishMin, currentHr, currentMin){
  let finishHr = finishHr % 24;
  let currentHr = currentHr % 24; 
  // Day time
  if(finishHr >= currentHr){
    let diffHr = finishHr - currentHr;
    let diffMin = finishMin - currentMin;
    let absDiffMin = diffHr * 60 + diffMin;
  }
  // Night time
  else{
    let diffHr = Math.abs(currentHr - 24) + finishHr;
    let diffMin = finishMin - currentMin;
    let absDiffMin = diffHr * 60 + diffMin;
  }
  return absDiffMin;
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function printOutside(){
  console.log("Snap:: shortDayFinishHr  ::  " + snapshot.shortDayFinishHr + ":" + snapshot.shortDayFinishMin);
  console.log("Snap:: normalDayFinishHr  ::  " + snapshot.normalDayFinishHr + ":" + snapshot.normalDayFinishMin);
  console.log("Snap: longtDayFinishHr  ::  " + snapshot.longDayFinishHr + ":" + snapshot.longDayFinishMin);
  console.log("cur: shortDayFinishHr  ::  " + shortDayFinishHr + ":" + shortDayFinishMin);
  console.log("cur: normalDayFinishHr  ::  " + normalDayFinishHr + ":" + normalDayFinishMin);
  console.log("cur: longDayFinishHr  ::  " + longDayFinishHr + ":" + longDayFinishMin);
};


/*********************************************************
Create/Restore snapshot
**********************************************************/


let day = new Date().getDay()

try{
  let snapshot = fs.readFileSync("snapshot.txt", "cbor");
  console.log("I have found something");
  if(isSnapshotObsolete(snapshot.day)){
   let snapshot = {
    "day": day,
    "shortDayFinishHr": shortDayFinishHr,
    "shortDayFinishMin": shortDayFinishMin,
    "normalDayFinishHr": normalDayFinishHr,
    "normalDayFinishMin": normalDayFinishMin,
    "longDayFinishHr": longDayFinishHr,
    "longDayFinishMin": longDayFinishMin,
   };
   fs.writeFileSync("snapshot.txt", snapshot, "cbor");
   console.log("I have found something obsolete");
  };
}
catch(err){ 
  console.log("I have not found something");
  let snapshot = {
  "day": day,
  "shortDayFinishHr": shortDayFinishHr,
  "shortDayFinishMin": shortDayFinishMin,
  "normalDayFinishHr": normalDayFinishHr,
  "normalDayFinishMin": normalDayFinishMin,
  "longDayFinishHr": longDayFinishHr,
  "longDayFinishMin": longDayFinishMin,
  };
  fs.writeFileSync("snapshot.txt", snapshot, "cbor");
}

let shortDayFinishHr = snapshot.shortDayFinishHr
shortDayFinishHr = shortDayFinishHr
let shortDayFinishMin = snapshot.shortDayFinishMin
shortDayFinishMin = shortDayFinishMin
let normalDayFinishHr = snapshot.normalDayFinishHr
normalDayFinishHr = normalDayFinishHr
let normalDayFinishMin = snapshot.normalDayFinishMin
normalDayFinishMin = normalDayFinishMin
let longDayFinishHr = snapshot.longDayFinishHr
longDayFinishHr = longDayFinishHr
let longDayFinishMin = snapshot.longDayFinishMin
longDayFinishMin = longDayFinishMin

// Have i warned about outrunning timer yet? 
let shortDayWarned = 0
let normalDayWarned = 0
let longDayWarned = 0


/*********************************************************
Periodic clock event
**********************************************************/


// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  function printInside(){
   console.log("real: shortDayEnd ::  " + shortDayFinishHr + ":" + shortDayFinishMin);
   console.log("real: normalDayEnd ::  " + normalDayFinishHr + ":" + normalDayFinishMin);
   console.log("real: longDayEnd  ::  " + longDayFinishHr + ":" + longDayFinishMin);
   console.log("real: shortDayHrLeft  ::  " + shortDayHrLeft + ":" + shortDayMinLeft);
   console.log("real: normalDayHrLeft  ::  " + normalDayHrLeft + ":" + normalDayMinLeft);
   console.log("real: longDayHrLeft  ::  " + longDayHrLeft + ":" + longDayMinLeft);
  };
  
  let today = evt.date;
  let hours = today.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = hours;
  }
  let mins = today.getMinutes();
  
  // Warn about outrunning timer
  let shortDayMinLeft = deltaTime(shortDayFinishHr, shortDayFinishMin, hours, mins) % 60;
  let shortDayHrLeft = Math.floor(deltaTime(shortDayFinishHr, shortDayFinishMin, hours, mins) / 60);
  if((shortDayWarned == 0) && (deltaTime(shortDayFinishHr, shortDayFinishMin, hours, mins) < 10)){
    vibration.start("ring");
    shortDayWarned = 1;
    sleep(250);
    vibration.stop();
  }
  
  let normalDayMinLeft = deltaTime(normalDayFinishHr, normalDayFinishMin, hours, mins) % 60;
  let normalDayHrLeft = Math.floor(deltaTime(normalDayFinishHr, normalDayFinishMin, hours, mins) / 60);
  if((normalDayWarned == 0) && (deltaTime(normalDayFinishHr, normalDayFinishMin, hours, mins) < 10)){
    vibration.start("ring");
    normalDayWarned = 1;
    sleep(250);
    vibration.stop();
  }
  
  let longDayMinLeft = deltaTime(longDayFinishHr, longDayFinishMin, hours, mins) % 60;
  let longDayHrLeft = Math.floor(deltaTime(longDayFinishHr, longDayFinishMin, hours, mins) / 60);
  if((longDayWarned == 0) && (deltaTime(longDayFinishHr, longDayFinishMin, hours, mins) < 10)){
    vibration.start("ring");
    longDayWarned = 1;
    sleep(250);
    vibration.stop();
  }

  // output the time to go on the left, finish time on the right
  shortDayFinishHr = shortDayFinishHr % 24
  normalDayFinishHr = normalDayFinishHr % 24
  longDayFinishHr = longDayFinishHr % 24
  shortDay.text = `${shortDayHrLeft}:${shortDayMinLeft}  End ${shortDayFinishHr}:${shortDayFinishMin}`;
  normalDay.text = `${normalDayHrLeft}:${normalDayMinLeft}  End ${normalDayFinishHr}:${normalDayFinishMin}`;
  longDay.text = `${longDayHrLeft}:${longDayMinLeft}  End ${longDayFinishHr}:${longDayFinishMin}`;
 
  if((longDayHrLeft == 0) && (longDayMinLeft<5)){
      fs.unlinkSync("filename.txt");
  }
}
