/**
        * ==========================================
        * ENCRYPTION ALGORITHM (Demonstration)
        * ==========================================
        * Note: This is a visual/mock encryption algorithm meant for the project,
        * not actual cryptographically secure AES/RSA.
        */
const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const fake_messages = ["/@encrypt85ut", "#encsms15uyg", "#.security63ygf", "kjse000fd"];
const enum_tags = ["/A/", "/B/", "/C/", "/D/", "/E/", "/F/", "/G/", "/H/", "/I/", "/J/"];

function customEncryptLogic(msg) {
    if (!msg) return "";
    if (msg.length < 3) return msg.split("").reverse().join(""); // simple reverse for tiny strings

    // Rotates the first char to back, injects random letters, maps spaces/numbers to dummy tags
    let chars = msg.split(""); chars.push(chars.shift());
    let combined = [];
    for (let i = 0; i < 3; i++) combined.push(alphabet[Math.floor(Math.random() * 26)]);
    combined = combined.concat(chars);
    for (let i = 0; i < 3; i++) combined.push(alphabet[Math.floor(Math.random() * 26)]);
    combined.reverse();

    let res = "";
    for (let c of combined) {
        if (c === " ") res += fake_messages[Math.floor(Math.random() * fake_messages.length)];
        else if (/\d/.test(c)) res += enum_tags[parseInt(c)];
        else res += c;
    }
    return res;
}

function runEncryption() {
    let msg = document.getElementById("enc-input").value.trim();
    let outputBox = document.getElementById("enc-output");
    outputBox.value = customEncryptLogic(msg);
}
