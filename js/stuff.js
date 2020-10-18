function CheckPassword() {
    document.getElementById('ResultHeadline').textContent = "";
    document.getElementById('ResultLabel').textContent = "";
    pw = document.getElementById('PW').value;

    if (!pw || pw == "")
        return;

    document.getElementById('ResultHeadline').textContent = "Results:";
    document.getElementById('ResultLabel').textContent = "Loading...";

    //SHA1 Hash vom Password kriegen
    let SHA1Hash = SHA_1_HASH(pw);

    SHA1Hash.then((LatestPWHash) => {
        //Take the first 5 
        let fiveChars = LatestPWHash.substring(0, 5);

        //Query to the API with the first 5 characters
        fetch('https://api.pwnedpasswords.com/range/' + fiveChars)
            .then(
                (responseBody) => {
                    //Fehler beim Request
                    if (responseBody.status != 200) {
                        document.getElementById('ResultHeadline').textContent = "Fehler.";
                        return;
                    }

                    //Wenn alles gut läuft, verarbeite den Response
                    responseBody.text().then((fetchedData) => {
                        //Standardmäßig in 0 Breaches vorhanden.
                        let splitData = fetchedData.split('\n');
                        document.getElementById('ResultLabel').textContent = `Password was found in 0 data breaches. Your Passwort is safe.`;

                        //Jedes Element durchsuchen und schauen ob der SHA1 HASH vom Passwort auch irgendwo vorkommt, wenn ja - Zeig die Anzahl von Vorkommnissen an und geh raus aus der Funktion.
                        splitData.forEach((element) => {
                            currElement = fiveChars.concat(element).toLowerCase();
                            if (currElement.includes(LatestPWHash)) {
                                document.getElementById('ResultLabel').textContent = `Password was found in ${currElement.split(':')[1]} data breaches. Please change your password for your own safety.`;
                                return;
                            }
                        })
                    });
                }
            )
            .catch((err) => {
                document.getElementById('ResultHeadline').textContent = "Fehler.";
            });
    });
}

//Credits: https://8gwifi.org/docs/window-crypto-digest.jsp
function SHA_1_HASH(pw) {
    let buffer = new TextEncoder("utf-8").encode(pw);
    return (crypto.subtle.digest("SHA-1", buffer).then((hash) => hex(hash)));
}
//Credits: https://8gwifi.org/docs/window-crypto-digest.jsp
function hex(buffer) {
    var hexCodes = [];
    var view = new DataView(buffer);
    for (var i = 0; i < view.byteLength; i += 4) {
        // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
        var value = view.getUint32(i)
        // toString(16) will give the hex representation of the number without padding
        var stringValue = value.toString(16)
        // We use concatenation and slice for padding
        var padding = '00000000'
        var paddedValue = (padding + stringValue).slice(-padding.length)
        hexCodes.push(paddedValue);
    }
    // Join all the hex strings into one

    return hexCodes.join("");
}
