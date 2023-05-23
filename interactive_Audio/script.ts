namespace Prototyp {

  let showCurrentCoordinates: string = "";
  let iBaulat: number = 48.04994174315437;
  let iBauLong: number = 8.210831942378386;

  const currentCoordinates: HTMLParagraphElement = <HTMLParagraphElement>document.getElementById("currentCoordinates");

  const options = {
    enableHighAccuracy: true,
    maximumAge: 0,
  };

  if ("geolocation" in navigator) {
    /* geolocation is available */
    navigator.geolocation.getCurrentPosition(success, error, options);

  } else {
    /* geolocation IS NOT available */
    currentCoordinates.textContent = "coordinates not available";
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
    }
    if (d>0.05){
      stopSound("../interactive_Audio/audio/iBau.mp3");
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