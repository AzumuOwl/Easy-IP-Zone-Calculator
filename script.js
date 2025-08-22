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

// ฟังก์ชันคำนวณ Subnet Mask จากจำนวน Host
function getSubnetMask(hosts) {
    let hostBits = 1;
    while ((2 ** hostBits - 2) < hosts) {
        hostBits++;
    }
    const cidr = 32 - hostBits;
    let mask = 0xffffffff << hostBits;
    mask = mask >>> 0;
    const subnetMask = [
        (mask >>> 24) & 255,
        (mask >>> 16) & 255,
        (mask >>> 8) & 255,
        mask & 255
    ].join('.');
    return {subnetMask, cidr};
}

function calculateZones() {
    const baseIp = document.getElementById('baseIp').value;
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    if(!baseIp) {
        resultDiv.innerHTML = "<p style='color:red'>กรุณากรอก Base IP</p>";
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
        const {subnetMask, cidr} = getSubnetMask(hosts);
        const totalHosts = 2 ** (32 - cidr);
        const networkIP = intToIp(currentNetwork);
        const broadcastIP = intToIp(currentNetwork + totalHosts - 1);
        const firstHost = intToIp(currentNetwork + 1);
        const lastHost = intToIp(currentNetwork + totalHosts - 2);

        const zoneDiv = document.createElement('div');
        zoneDiv.className = 'zone';
        zoneDiv.innerHTML = `
            <h3>Zone ${i + 1}</h3>
            <p>Hosts: ${hosts}</p>
            <p>Subnet Mask: ${subnetMask} (/ ${cidr})</p>
            <p>Network: ${networkIP}</p>
            <p>Broadcast: ${broadcastIP}</p>
            <p>Host Range: ${firstHost} - ${lastHost}</p>
        `;
        resultDiv.appendChild(zoneDiv);

        currentNetwork += totalHosts;
    });
}
