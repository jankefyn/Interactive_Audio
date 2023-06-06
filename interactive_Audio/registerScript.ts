namespace Prototyp{
    let submitbuttonHTML: HTMLButtonElement = <HTMLButtonElement>document.getElementById("submitUserData");
    submitbuttonHTML.addEventListener("click", function (): void { submit("UserData"); });
    let serverantwort: HTMLElement = document.getElementById("serverantwort");

    async function submit(_parameter: string): Promise<void> {
        let formData: FormData = new FormData(document.forms[0]);
        let url: string = "https://softwaredesign-abgabe.herokuapp.com/";
        //let url: string = "http://localhost:8100/";
        let query: URLSearchParams = new URLSearchParams(<any>formData);

        if (_parameter == "UserData") {
            url = url + "/UserData";
        }

        url = url + "?" + query.toString();


        let response: Response = await fetch(url);
        let text: string = await response.text();
        serverantwort.innerHTML = text;
    }
}