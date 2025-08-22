<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Easy IP Zone Calculator</title>
<style>
body {
    font-family: Arial, sans-serif;
    background: #f5f6fa;
    display: flex;
    justify-content: center;
    padding: 20px;
}
.container {
    background: #fff;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    width: 500px;
}
h1 { text-align: center; color: #2f3640; }
label { display: block; margin: 15px 0 5px; }
input { width: calc(100% - 20px); padding: 10px; border-radius: 6px; border: 1px solid #dcdde1; font-size: 16px; }
button { padding: 10px 15px; border-radius: 6px; border: none; background: #3498db; color: #fff; cursor: pointer; margin-top: 10px; }
button:hover { background: #2980b9; }
.zone-inputs { margin-top: 10px; }
.zone-item { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; }
.zone-item input { flex: 1; }
.zone-item button { flex: 0; }
.result { margin-top: 20px; background: #f1f2f6; padding: 15px; border-radius: 8px; }
.zone { margin-bottom: 15px; }
.zone p { margin: 5px 0; }
</style>
</head>
<body>
<div class="container">
    <h1>Easy IP Zone Calculator</h1>

    <label for="baseIp">Base IP (e.g., 192.168.1.0)</label>
    <input type="text" id="baseIp" placeholder="192.168.1.0">

    <label for="subnetMask">Subnet Mask (e.g., 255.255.255.0)</label>
    <input type="text" id="subnetMask" placeholder="255.255.255.0">

    <div class="zone-inputs" id="zonesContainer">
        <div class="zone-item">
            <input type="number" placeholder="Hosts for Zone 1" class="zone-host" min="1">
            <button type="button" onclick="removeZone(this)">-</button>
        </div>
    </div>

    <button type="button" onclick="addZone()">+ Add Zone</button>
    <button type="button" onclick="calculateZones()">Calculate Zones</button>

    <div class="result" id="result"></div>
</div>

<script>
function ipToInt(ip) {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}
function intToIp(int) {
    return [(int >>> 24), (int >> 16 & 255), (int >> 8 & 255), (int & 255)].join('.');
}

function addZone() {
    const container = document.getElementById('zonesContainer');
    const count = container.children.length + 1;
    const div = document.createElement('div');
    div.className = 'zone-item';
    div.innerHTML = `<input type="number" placeholder="Hosts for Zone ${count}" class="zone-host" min="1">
                     <button type="button" onclick="removeZone(this)">-</button>`;
    container.appendChild(div);
}

function removeZone(button) {
    const container = document.getElementById('zonesContainer');
    if(container.children.length > 1) {
        container.removeChild(button.parentElement);
        updateZonePlaceholders();
    } else {
        alert("ต้องมี Zone อย่างน้อย 1 Zone");
    }
}

function updateZonePlaceholders() {
    const inputs = document.querySelectorAll('.zone-host');
    inputs.forEach((input, index) => {
        input.placeholder = `Hosts for Zone ${index + 1}`;
    });
}

function calculateZones() {
    const baseIp = document.getElementById('baseIp').value;
    const subnetMask = document.getElementById('subnetMask').value;
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    if(!baseIp || !subnetMask) {
        resultDiv.innerHTML = "<p style='color:red'>กรุณากรอก Base IP และ Subnet Mask</p>";
        return;
    }

    const zoneInputs = document.querySelectorAll('.zone-host');
    const zoneHostsArr = Array.from(zoneInputs).map(input => parseInt(input.value));

    if(zoneHostsArr.some(isNaN) || zoneHostsArr.some(h => h <= 0)) {
        resultDiv.innerHTML = "<p style='color:red'>กรุณากรอกจำนวน Hosts ให้ถูกต้องทุก Zone</p>";
        return;
    }

    let currentNetwork = ipToInt(baseIp);

    zoneHostsArr.forEach((hosts, i) => {
        const totalHosts = hosts + 2; // network + broadcast
        const networkIP = intToIp(currentNetwork);
        const broadcastIP = intToIp(currentNetwork + totalHosts - 1);
        const firstHost = intToIp(currentNetwork + 1);
        const lastHost = intToIp(currentNetwork + totalHosts - 2);

        const zoneDiv = document.createElement('div');
        zoneDiv.className = 'zone';
        zoneDiv.innerHTML = `
            <h3>Zone ${i + 1}</h3>
            <p>Hosts: ${hosts}</p>
            <p>Network: ${networkIP}</p>
            <p>Broadcast: ${broadcastIP}</p>
            <p>Host Range: ${firstHost} - ${lastHost}</p>
        `;
        resultDiv.appendChild(zoneDiv);

        currentNetwork += totalHosts;
    });
}
</script>
</body>
</html>
