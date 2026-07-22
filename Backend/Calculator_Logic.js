/**
 * ==========================================
 * CALCULATOR LOGIC
 * ==========================================
 */
let calcExp = "";
function calcNum(n) { calcExp += n; document.getElementById('calc-input').value = calcExp; }
function calcOp(op) { if (calcExp === "") return; calcExp += op; document.getElementById('calc-input').value = calcExp; }
function calcClear() { calcExp = ""; document.getElementById('calc-input').value = "0"; document.getElementById('calc-history').innerText = ""; }
function calcEq() {
    try {
        // Uses eval for quick math parsing. Safe here as input is strictly controlled by physical UI buttons
        let res = eval(calcExp);
        document.getElementById('calc-history').innerText = calcExp + " =";
        document.getElementById('calc-input').value = res;
        calcExp = res.toString();
    }
    catch (e) { document.getElementById('calc-input').value = "Error"; calcExp = ""; }
}

// Toggles side panel in calculator tab for unit conversions
let conversionsVisible = false;
function toggleConversions() {
    conversionsVisible = !conversionsVisible; const container = document.querySelector('.toggle-container'); const panel = document.getElementById('calc-conversions');
    if (conversionsVisible) { container.classList.add('toggle-active'); panel.classList.add('show'); }
    else { container.classList.remove('toggle-active'); panel.classList.remove('show'); }
}

function calcBMI() {
    let w = parseFloat(document.getElementById('bmi-w').value); let h = parseFloat(document.getElementById('bmi-h').value) / 100;
    if (!w || !h) return; let bmi = (w / (h * h)).toFixed(1); let cat = "Normal";
    if (bmi < 18.5) cat = "Underweight"; else if (bmi >= 25 && bmi < 30) cat = "Overweight"; else if (bmi >= 30) cat = "Obese";
    document.getElementById('bmi-res').innerText = `BMI: ${bmi} (${cat})`;
}

function calcTemp(mode) {
    let v = parseFloat(document.getElementById('temp-val').value); if (isNaN(v)) return; let res = 0;
    if (mode === 'CtoF') res = (v * 9 / 5) + 32; else res = (v - 32) * 5 / 9;
    document.getElementById('temp-res').innerText = res.toFixed(1) + (mode === 'CtoF' ? " °F" : " °C");
}

function calcDist(mode) {
    let v = parseFloat(document.getElementById('dist-val').value); if (isNaN(v)) return;
    let res = mode === 'MtoCM' ? v * 100 : v / 100; document.getElementById('dist-res').innerText = res + (mode === 'MtoCM' ? " cm" : " m");
}