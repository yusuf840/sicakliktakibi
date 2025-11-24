// ESP32 API URL
const ESP32_URL = "http://192.168.1.50/api";

const tempEl = document.getElementById("temp");
const humEl = document.getElementById("hum");

const ctx = document.getElementById("liveChart");

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Sıcaklık (°C)",
        data: [],
        borderWidth: 2
      },
      {
        label: "Nem (%)",
        data: [],
        borderWidth: 2
      }
    ]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: false
      }
    }
  }
});

function fetchData() {
  fetch(ESP32_URL)
    .then((res) => res.json())
    .then((data) => {
      tempEl.innerText = data.temperature + " °C";
      humEl.innerText = data.humidity + " %";

      chart.data.labels.push(new Date().toLocaleTimeString());
      chart.data.datasets[0].data.push(data.temperature);
      chart.data.datasets[1].data.push(data.humidity);
      chart.update();
    })
    .catch((err) => {
      console.log("ESP32'ye ulaşılamadı!");
    });
}

setInterval(fetchData, 3000);
fetchData();
