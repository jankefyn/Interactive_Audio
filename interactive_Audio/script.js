"use strict";
/*import * as Http from "http";
import { ParsedUrlQuery } from "querystring";
import * as url from "url";
import * as Mongo from "mongodb";*/
/*let locationCollection: Mongo.Collection;
 
 

interface Input {
  [type: string]: string | string[];
}
*/
/*
 let databaseUrl: string = "mongodb+srv://FynnJ:nicnjX5MjRSm4wtu@gis-ist-geil.wb5k5.mongodb.net/?retryWrites=true&w=majority";
 console.log("Starting server");
 let port: number = Number(process.env.PORT);
 if (!port)
   port = 8100;
 
 startServer(port);
 connectToDatabase(databaseUrl);
 
 
 
 function startServer(_port: number | string): void {
   let server: Http.Server = Http.createServer();
   server.addListener("request", handleRequest);
   server.addListener("listening", handleListen);
   server.listen(_port);
 }
 
 async function connectToDatabase(_url: string): Promise<void> {
   let options: Mongo.MongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };
   let mongoClient: Mongo.MongoClient = new Mongo.MongoClient(_url, options);
   await mongoClient.connect();
   locationCollection = mongoClient.db("Test").collection("Adventures");
   console.log("Database connection from adventures: ", locationCollection != undefined);
 
 }
 
 
 function handleListen(): void {
   console.log("Listening");
 }
 async function handleRequest(_request: Http.IncomingMessage, _response: Http.ServerResponse): Promise<void> {
   let q: url.UrlWithParsedQuery = url.parse(_request.url, true);
   let daten: ParsedUrlQuery = q.query;
   if (q.pathname == "//saveLocation") {
     _response.write(await saveLocation(q.query, daten.lat, daten.long));
   }
   _response.end();
 }*/
/*async function saveLocation(_rückgabe: Input, _lat: string | string[], _long: string | string[]): Promise<string> {
  let data: locations[] = await locationCollection.find().toArray();
  if (_lat.toString().match("[a-zA-Z]+")&& _long.toString().match("[a-zA-Z]+")) {
    return ("die location enthält buchstaben darf aber nur aus nummern bestehen");
  }
  
  if (data.length > 0) {
    for (let counter: number = 0; counter < data.length; counter++) {
      if (data[counter].lat == Number(_lat)&& data[counter].long == Number(_long)) {
        return "ein eintrag mit diesen Koordinaten besteht bereits";
      }
    }
  }
  locationCollection.insertOne(_rückgabe);
  return "Location erfolgreich gespeichert";
}
*/
var Prototyp;
(function (Prototyp) {
    const startButton = document.getElementById("startButton");
    startButton.addEventListener("click", startGame);
    let musicPlaying = false;
    let currentsound = "";
    let lastLocation = "";
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioContext;
    let audioBufferMap = new Map();
    let audioSourceMap = new Map();
    const currentCoordinates = document.getElementById("currentCoordinates");
    const options = {
        enableHighAccuracy: true,
        maximumAge: 0,
    };
    class Location {
        locationID;
        lat;
        long;
        sound;
        constructor(_locationID, _lat, _long, _sound) {
            this.locationID = _locationID;
            this.lat = +_lat;
            this.long = +_long;
            this.sound = _sound;
        }
    }
    let locationMap = new Map();
    async function startGame() {
        startButton.classList.add("hidden");
        locationMap = await loadLocationMap();
        console.log(locationMap);
        audioContext = new AudioContext();
        for (let [key, value] of locationMap) {
            loadSound(value.sound);
        }
        if ("geolocation" in navigator) {
            /* geolocation is available */
            navigator.geolocation.watchPosition(success, error, options);
        }
        else {
            /* geolocation IS NOT available */
            currentCoordinates.textContent = "coordinates not available";
        }
    }
    function success(_pos) {
        currentCoordinates.textContent = "" + _pos.coords.latitude + ", " + _pos.coords.longitude;
        currentCoordinates.textContent = currentCoordinates.textContent + "distanz zum ziel" + checkDistanceBetween(_pos, 47.579136, 7.6218368);
        checkForLocations(_pos);
    }
    function checkForLocations(_currentCoordinates) {
        for (let [key, value] of locationMap) {
            let d = checkDistanceBetween(_currentCoordinates, value.lat, value.long);
            if (!musicPlaying) {
                if (d < 1) {
                    playSound(value.sound);
                    musicPlaying = true;
                    currentsound = value.sound;
                    lastLocation = value.locationID;
                    currentCoordinates.textContent = " du befindest dich in der nähe von: " + value.locationID + " deshalb hörst du etwas.";
                    break;
                }
            }
            if (musicPlaying && value.locationID === lastLocation && d > 10) {
                console.log("ich brech ab");
                stopSound(currentsound);
                musicPlaying = false;
            }
        }
    }
    function checkDistanceBetween(_pos, _lat, _long) {
        let R = 6371; // Radius of the earth in km
        let dLat = deg2rad(_lat - _pos.coords.latitude); // deg2rad below
        let dLon = deg2rad(_long - _pos.coords.longitude);
        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(_pos.coords.latitude)) * Math.cos(deg2rad(_lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }
    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    function error() {
        alert("error");
    }
    async function loadSound(_url) {
        let response = await fetch(_url);
        let arraybuffer = await response.arrayBuffer();
        let audioBuffer = await audioContext.decodeAudioData(arraybuffer);
        audioBufferMap.set(_url, audioBuffer);
    }
    function playSound(_url, _loop = false, _duration = 0) {
        console.log(_url);
        console.log("ich spiele");
        console.log(audioContext);
        let source = audioContext.createBufferSource();
        source.buffer = audioBufferMap.get(_url);
        source.connect(audioContext.destination);
        source.loop = _loop;
        source.start(_duration);
        audioSourceMap.set(_url, source);
    }
    function stopSound(_url) {
        console.log("ich stooppe");
        audioSourceMap.get(_url).stop();
        audioSourceMap.delete(_url);
    }
    async function loadJson(_path) {
        let response = await fetch(_path);
        let json = await response.json();
        return json;
    }
    async function loadLocationMap() {
        let arrayObject = await loadJson("../interactive_Audio/data/locations.json");
        let tempLocationMap = new Map();
        for (let i = 0; i < arrayObject.length; i++) {
            let loc = new Location(arrayObject[i].locationID, arrayObject[i].lat, arrayObject[i].long, arrayObject[i].sound);
            tempLocationMap.set(loc.locationID, loc);
        }
        return tempLocationMap;
    }
})(Prototyp || (Prototyp = {}));
//# sourceMappingURL=script.js.map