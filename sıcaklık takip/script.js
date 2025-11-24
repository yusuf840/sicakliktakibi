const FIREBASE_URL = "https://sicaklik-takibi-9faca-default-rtdb.firebaseio.com/veriler.json";

let chart;
let allData = [];
let filteredData = [];

// Tema butonu
const themeBtn = document.getElementById("themeToggle");
themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

// Tarih filtre
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
document.getElementById("filterBtn").addEventListener("click", filterData);
document.getElementById("downloadCSV").addEventListener("click", downloadCSV);

async function getLatestAndHistory() {
    try {
        let res = await fetch(FIREBASE_URL);
        let data = await res.json();
        if (!data) return;

        allData = Object.values(data);
        filteredData = [...allData];

        updateDashboard();
    } catch (err) {
        console.log("Firebase verisi alınamadı", err);
    }
}

function updateDashboard() {
    if(filteredData.length === 0) return;

    // Anlık değer
    const latest = filteredData[filteredData.length-1];
    document.getElementById("temp").innerText = latest.sicaklik;
    document.getElementById("hum").innerText = latest.nem;

    // Min / Max / Ort
    const temps = filteredData.map(d=>d.sicaklik);
    const min = Math.min(...temps).toFixed(1);
    const max = Math.max(...temps).toFixed(1);
    const avg = (temps.reduce((a,b)=>a+b)/temps.length).toFixed(1);

    document.getElementById("minVal").innerText = min;
    document.getElementById("maxVal").innerText = max;
    document.getElementById("avgVal").innerText = avg;

    drawChart();
}

function drawChart() {
    const labels = filteredData.map(d => d.tarih);
    const tempValues = filteredData.map(d => d.sicaklik);
    const humValues = filteredData.map(d => d.nem);

    if(chart) chart.destroy();

    let ctx = document.getElementById("chartCanvas");

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Sıcaklık °C',
                    data: tempValues,
                    borderColor: '#ff4d4d',
                    fill: false,
                    tension: 0.3
                },
                {
                    label: 'Nem %',
                    data: humValues,
                    borderColor: '#4c6ef5',
                    fill: false,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: { tooltip: { mode: 'index', intersect: false } },
            scales: {
                x: { ticks: { maxRotation: 60, minRotation: 60 } }
            }
        }
    });
}

function filterData() {
    const start = startDateInput.value ? new Date(startDateInput.value) : null;
    const end = endDateInput.value ? new Date(endDateInput.value) : null;

    filteredData = allData.filter(d=>{
        const date = new Date(d.tarih);
        if(start && date < start) return false;
        if(end && date > end) return false;
        return true;
    });

    updateDashboard();
}

function downloadCSV() {
    if(filteredData.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Tarih,Sıcaklık,Nem\n";
    filteredData.forEach(row=>{
        csvContent += `${row.tarih},${row.sicaklik},${row.nem}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "sicaklik_nem_verileri.csv");
}

// Her 5 saniyede bir Firebase'den veri çe

setInterval(getLatestAndHistory, 5000);
getLatestAndHistory();

