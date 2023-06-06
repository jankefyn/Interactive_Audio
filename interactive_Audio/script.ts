import * as Http from "http";
import { ParsedUrlQuery } from "querystring";
import * as url from "url";
import * as Mongo from "mongodb";

namespace Prototyp {


  let locationCollection: Mongo.Collection;
  let showCurrentCoordinates: string = "";
  let iBaulat: number = 48.04994174315437;
  let iBauLong: number = 8.210831942378386;
  let musicPlaying: boolean = false;

  interface Input {
    [type: string]: string | string[];
  }

  interface locations {
    lat:number;
    long:number;
    sound:number;
}
  const currentCoordinates: HTMLParagraphElement = <HTMLParagraphElement>document.getElementById("currentCoordinates");

  const options = {
    enableHighAccuracy: true,
    maximumAge: 0,
  };

  const startButton = document.getElementById("startButton");
  startButton.addEventListener("click", buttonPressed);

  function buttonPressed(): void {
    startButton.classList.add("hidden");
    if ("geolocation" in navigator) {
      /* geolocation is available */
      navigator.geolocation.watchPosition(success, error, options);

    } else {
      /* geolocation IS NOT available */
      currentCoordinates.textContent = "coordinates not available";
    }
  }

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
  }
  async function saveLocation(_rückgabe: Input, _lat: string | string[], _long: string | string[]): Promise<string> {
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

  function success(_pos: GeolocationPosition): void {
    showCurrentCoordinates = "Latitude: " + _pos.coords.latitude + ", Longitude: " + _pos.coords.longitude + ", genauigkeit :" + _pos.coords.accuracy;
    currentCoordinates.textContent = showCurrentCoordinates;
    loadSound("../interactive_Audio/audio/iBau.mp3");
    checkForLocations(_pos);
  }

  function checkForLocations(_currentCoordinates: GeolocationPosition): void {
    let d: number = checkDistanceBetween(_currentCoordinates, iBaulat, iBauLong);
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
  function checkDistanceBetween(_pos: GeolocationPosition, _lat: number, _long: number) {
    let R: number = 6371; // Radius of the earth in km
    let dLat: number = deg2rad(_lat - _pos.coords.latitude);  // deg2rad below
    let dLon: number = deg2rad(_long - _pos.coords.longitude);
    let a: number = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(_pos.coords.latitude)) * Math.cos(deg2rad(_lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
  }

  function error(): void {
    alert("error");
  }

  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext: AudioContext = new AudioContext();
  let audioBufferMap: Map<string, AudioBuffer> = new Map();
  let audioSourceMap: Map<string, AudioBufferSourceNode> = new Map();


  async function loadSound(_url: string): Promise<void> {
    let response: Response = await fetch(_url);
    let arraybuffer: ArrayBuffer = await response.arrayBuffer();
    let audioBuffer: AudioBuffer = await audioContext.decodeAudioData(arraybuffer);
    audioBufferMap.set(_url, audioBuffer);
  }

  function playSound(_url: string, _loop: boolean = false, _duration: number = 0): void {
    let source: AudioBufferSourceNode = audioContext.createBufferSource();
    source.buffer = audioBufferMap.get(_url);
    source.connect(audioContext.destination);
    source.loop = _loop;
    source.start(_duration);
    audioSourceMap.set(_url, source);
  }

  function stopSound(_url: string): void {
    audioSourceMap.get(_url).stop();
    audioSourceMap.delete(_url);
  }
}