"use strict";
var Prototyp;
(function (Prototyp) {
    let showCurrentCoordinates = "";
    const currentCoordinates = document.getElementById("currentCoordinates");
    const options = {
        enableHighAccuracy: true,
        maximumAge: 0,
    };
    if ("geolocation" in navigator) {
        /* geolocation is available */
        navigator.geolocation.getCurrentPosition(success, error, options);
    }
    else {
        /* geolocation IS NOT available */
        currentCoordinates.textContent = "coordinates not available";
    }
    function success(pos) {
        showCurrentCoordinates = "Latitude: " + pos.coords.latitude + ", Longitude: " + pos.coords.longitude + ", genauigkeit :" + pos.coords.accuracy;
        currentCoordinates.textContent = showCurrentCoordinates;
    }
    function error() {
        alert("error");
    }
    /*function showCurrentLocation(_lat:number, _long:number): void {
        showCurrentCoordinates = "Latitude: " + _lat + ", Longitude: " + _long;
        currentCoordinates.textContent = showCurrentCoordinates;
    }*/
})(Prototyp || (Prototyp = {}));
//# sourceMappingURL=script.js.map