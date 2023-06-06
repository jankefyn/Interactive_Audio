"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Http = require("http");
const url = require("url");
const Mongo = require("mongodb");
var Prototyp;
(function (Prototyp) {
    let locationCollection;
    let showCurrentCoordinates = "";
    let iBaulat = 48.04994174315437;
    let iBauLong = 8.210831942378386;
    let musicPlaying = false;
    const currentCoordinates = document.getElementById("currentCoordinates");
    const options = {
        enableHighAccuracy: true,
        maximumAge: 0,
    };
    const startButton = document.getElementById("startButton");
    startButton.addEventListener("click", buttonPressed);
    function buttonPressed() {
        startButton.classList.add("hidden");
        if ("geolocation" in navigator) {
            /* geolocation is available */
            navigator.geolocation.watchPosition(success, error, options);
        }
        else {
            /* geolocation IS NOT available */
            currentCoordinates.textContent = "coordinates not available";
        }
    }
    let databaseUrl = "mongodb+srv://FynnJ:nicnjX5MjRSm4wtu@gis-ist-geil.wb5k5.mongodb.net/?retryWrites=true&w=majority";
    console.log("Starting server");
    let port = Number(process.env.PORT);
    if (!port)
        port = 8100;
    startServer(port);
    connectToDatabase(databaseUrl);
    function startServer(_port) {
        let server = Http.createServer();
        server.addListener("request", handleRequest);
        server.addListener("listening", handleListen);
        server.listen(_port);
    }
    async function connectToDatabase(_url) {
        let options = { useNewUrlParser: true, useUnifiedTopology: true };
        let mongoClient = new Mongo.MongoClient(_url, options);
        await mongoClient.connect();
        locationCollection = mongoClient.db("Test").collection("Adventures");
        console.log("Database connection from adventures: ", locationCollection != undefined);
    }
    function handleListen() {
        console.log("Listening");
    }
    async function handleRequest(_request, _response) {
        let q = url.parse(_request.url, true);
        let daten = q.query;
        if (q.pathname == "//saveLocation") {
            _response.write(await saveLocation(q.query, daten.lat, daten.long));
        }
        _response.end();
    }
    async function saveLocation(_rückgabe, _lat, _long) {
        let data = await locationCollection.find().toArray();
        if (_lat.toString().match("[a-zA-Z]+") && _long.toString().match("[a-zA-Z]+")) {
            return ("die location enthält buchstaben darf aber nur aus nummern bestehen");
        }
        if (data.length > 0) {
            for (let counter = 0; counter < data.length; counter++) {
                if (data[counter].lat == Number(_lat) && data[counter].long == Number(_long)) {
                    return "ein eintrag mit diesen Koordinaten besteht bereits";
                }
            }
        }
        locationCollection.insertOne(_rückgabe);
        return "Location erfolgreich gespeichert";
    }
    function success(_pos) {
        showCurrentCoordinates = "Latitude: " + _pos.coords.latitude + ", Longitude: " + _pos.coords.longitude + ", genauigkeit :" + _pos.coords.accuracy;
        currentCoordinates.textContent = showCurrentCoordinates;
        loadSound("../interactive_Audio/audio/iBau.mp3");
        checkForLocations(_pos);
    }
    function checkForLocations(_currentCoordinates) {
        let d = checkDistanceBetween(_currentCoordinates, iBaulat, iBauLong);
        currentCoordinates.textContent = currentCoordinates.textContent + " distanz zum i bau =" + d;
        if (d < 0.05) {
            playSound("../interactive_Audio/audio/iBau.mp3", true, 1000);
            musicPlaying = true;
        }
        if (d > 0.05 && musicPlaying) {
            stopSound("../interactive_Audio/audio/iBau.mp3");
            musicPlaying = false;
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
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    let audioBufferMap = new Map();
    let audioSourceMap = new Map();
    async function loadSound(_url) {
        let response = await fetch(_url);
        let arraybuffer = await response.arrayBuffer();
        let audioBuffer = await audioContext.decodeAudioData(arraybuffer);
        audioBufferMap.set(_url, audioBuffer);
    }
    function playSound(_url, _loop = false, _duration = 0) {
        let source = audioContext.createBufferSource();
        source.buffer = audioBufferMap.get(_url);
        source.connect(audioContext.destination);
        source.loop = _loop;
        source.start(_duration);
        audioSourceMap.set(_url, source);
    }
    function stopSound(_url) {
        audioSourceMap.get(_url).stop();
        audioSourceMap.delete(_url);
    }
})(Prototyp || (Prototyp = {}));
//# sourceMappingURL=script.js.map