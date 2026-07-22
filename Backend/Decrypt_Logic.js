function runDecryption() {
    let msg = document.getElementById("dec-input").value.trim();
    let outputBox = document.getElementById("dec-output");
    if (!msg) { outputBox.value = ""; return; }

    if (msg.length >= 3) {
        // Reverses the logic applied in customEncryptLogic
        for (let fm of fake_messages) msg = msg.split(fm).join(" ");
        for (let i = 0; i < enum_tags.length; i++) msg = msg.split(enum_tags[i]).join(i.toString());
        let chars = msg.split("");
        try {
            chars.splice(0, 3); chars.reverse(); chars.splice(0, 3);
            if (chars.length > 0) chars.unshift(chars.pop());
            outputBox.value = chars.join("");
        } catch (e) { outputBox.value = "Error: Invalid Ciphertext."; }
    } else {
        outputBox.value = msg.split("").reverse().join("");
    }
}
