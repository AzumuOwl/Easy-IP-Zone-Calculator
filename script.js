const deviceList = document.getElementById('deviceList');
const addDeviceBtn = document.getElementById('addDevice');
const calculateBtn = document.getElementById('calculateIPs');
const resultDiv = document.getElementById('result');
const showSubnetBtn = document.getElementById('showSubnet');
const subnetInfoDiv = document.getElementById('subnetInfo');

let deviceCount = 0;

// Add device input
addDeviceBtn.addEventListener('click', () => {
    deviceCount++;
    const div = document.createElement('div');
    div.classList.add('device');
    div.innerHTML = `
        <label>Device ${deviceCount} Name:</label>
        <input type="text" class="deviceName" placeholder="Router, PC">
        <label>Number of IPs:</label>
        <input type="number" class="deviceIPCount" placeholder="1" min="1">
        <button class="removeDevice">Remove</button>
    `;
    deviceList.appendChild(div);

    div.querySelector('.removeDevice').addEventListener('click', () => {
        div.remove();
    });
});

// Convert IP to number
function ipToNumber(ip) {
    return ip.split('.').reduce((acc, octet) => acc * 256 + parseInt(octet), 0);
}

// Convert number to IP
function numberToIp(num) {
    return [
        (num >> 24) & 255,
        (num >> 16) & 255,
        (num >> 8) & 255,
        num & 255
    ].join('.');
}

// Calculate subnet info
function calculateSubnet(baseIp, mask) {
    const baseNum = ipToNumber(baseIp);
    const maskNum = ipToNumber(mask);
    const network = baseNum & maskNum;
    const broadcast = network | (~maskNum >>> 0);
    const firstHost = network + 1;
    const lastHost = broadcast - 1;
    return { network: numberToIp(network), broadcast: numberToIp(broadcast), firstHost: numberToIp(firstHost), lastHost: numberToIp(lastHost) };
}

// Show subnet info
showSubnetBtn.addEventListener('click', () => {
    const baseIp = document.getElementById('baseIp').value;
    const mask = document.getElementById('subnetMask').value;
    const info = calculateSubnet(baseIp, mask);
    subnetInfoDiv.innerHTML = `
        <strong>Network:</strong> ${info.network} <br>
        <strong>Broadcast:</strong> ${info.broadcast} <br>
        <strong>Host Range:</strong> ${info.firstHost} - ${info.lastHost}
    `;
});

// Generate IPs for devices
calculateBtn.addEventListener('click', () => {
    const baseIp = document.getElementById('baseIp').value;
    const mask = document.getElementById('subnetMask').value;
    const deviceNames = document.querySelectorAll('.deviceName');
    const deviceCounts = document.querySelectorAll('.deviceIPCount');

    let currentIp = ipToNumber(calculateSubnet(baseIp, mask).firstHost);
    let output = '';

    deviceNames.forEach((nameInput, i) => {
        const name = nameInput.value || `Device${i+1}`;
        const count = parseInt(deviceCounts[i].value) || 1;
        let ips = [];
        for(let j=0;j<count;j++){
            ips.push(numberToIp(currentIp));
            currentIp++;
        }
        output += `<strong>${name}</strong>: ${ips.join(', ')}<br>`;
    });

    resultDiv.innerHTML = output;
});
