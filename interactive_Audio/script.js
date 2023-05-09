"use strict";
var Prototyp;
(function (Prototyp) {
    let showCurrentCoordinates = "";
    const currentCoordinates = document.getElementById("currentCoordinates");
    if ("geolocation" in navigator) {
        /* geolocation is available */
        /* navigator.geolocation.getCurrentPosition((position) => {
             showCurrentLocation(position.coords.latitude, position.coords.longitude);
         });*/
        const watchID = navigator.geolocation.watchPosition((position) => {
            showCurrentLocation(position.coords.latitude, position.coords.longitude);
        });
    }
    else {
        /* geolocation IS NOT available */
        currentCoordinates.textContent = "coordinates not available";
    }
    function showCurrentLocation(_lat, _long) {
        showCurrentCoordinates = "Latitude: " + _lat + ", Longitude: " + _long;
        currentCoordinates.textContent = showCurrentCoordinates;
    }
})(Prototyp || (Prototyp = {}));
//# sourceMappingURL=script.js.map