// Firebase Realtime Database URL
const FIREBASE_URL = "https://sicaklik-takibi-9faca-default-rtdb.firebaseio.com/veriler.json";

let chart;
let labels = [];
let values = [];

async function getLatestAndHistory() {
    try {
        let res = await fetch(FIREBASE_URL);
        let data = await res.json();
        if (!data) return;

        let latestKey = Object.keys(data).sort().pop();
        let latest = data[latestKey];

        // Anlık değerler
        document.getElementById("temp").innerText = latest.sicaklik;
        document.getElementById("hum").innerText = latest.nem;

        // Grafik ve analiz için tüm geçmiş veriler
        labels = [];
        values = [];

        for (let k in data) {
            labels.push(data[k].tarih);
            values.push(data[k].sicaklik);
        }

        updateAnalysis();
        drawChart();

    } catch (err) {
        console.log("Firebase verisi alınamadı", err);
    }
}

function updateAnalysis() {
    if (values.length === 0) return;

    let min = Math.min(...values).toFixed(1);
    let max = Math.max(...values).toFixed(1);
    let avg = (values.reduce((a,b)=>a+b)/values.length).toFixed(1);

    document.getElementById("minVal").innerText = min;
    document.getElementById("maxVal").innerText = max;
    document.getElementById("avgVal").innerText = avg;
}

function drawChart() {
    if (chart) chart.destroy();

    let ctx = document.getElementById("chartCanvas");

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Sıcaklık °C",
                data: values,
                borderColor: "#4c6ef5",
                borderWidth: 3,
                pointRadius: 2,
                fill: false,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { ticks: { maxRotation: 60, minRotation: 60 } }
            }
        }
    });
}

// Her 5 saniyede bir Firebase'den veri çek
setInterval(getLatestAndHistory, 5000);
getLatestAndHistory();
