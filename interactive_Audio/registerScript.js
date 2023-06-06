"use strict";
var Prototyp;
(function (Prototyp) {
    let submitbuttonHTML = document.getElementById("submitUserData");
    submitbuttonHTML.addEventListener("click", function () { submit("UserData"); });
    let serverantwort = document.getElementById("serverantwort");
    async function submit(_parameter) {
        let formData = new FormData(document.forms[0]);
        let url = "https://softwaredesign-abgabe.herokuapp.com/";
        //let url: string = "http://localhost:8100/";
        let query = new URLSearchParams(formData);
        if (_parameter == "UserData") {
            url = url + "/UserData";
        }
        url = url + "?" + query.toString();
        let response = await fetch(url);
        let text = await response.text();
        serverantwort.innerHTML = text;
    }
})(Prototyp || (Prototyp = {}));
//# sourceMappingURL=registerScript.js.map