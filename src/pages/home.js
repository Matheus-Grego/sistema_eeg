import { React, useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
import "../css/home.css";
import { Chart as ChartJS } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";

function Home() {
  ChartJS.register(zoomPlugin);
  const [isLoading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  const [xMin, setXMin] = useState(0);
  const [xMax, setXMax] = useState(70000);
  const [myChart, setMyChart] = useState(null);

  const updateChart = () => {
    if (canvasRef.current) {
      const chart = Chart.getChart(canvasRef.current);
      if (chart) {
        chart.options.scales.x.min = xMin;
        chart.options.scales.x.max = xMax;
        chart.update();
      }
    }
  };

  useEffect(() => {
    fetch("/dataset3.json")
      .then((response) => response.json())
      .then((jsonData) => {
        const labels = jsonData.Time;
        const channel1 = jsonData.Ch1;
        const channel2 = jsonData.Ch2;
        const channel3 = jsonData.Ch3;
        const channel4 = jsonData.Ch4;
        const channel5 = jsonData.Ch5;
        const channel6 = jsonData.Ch6;
        const channel7 = jsonData.Ch7;
        const channel8 = jsonData.Ch8;

        if (canvasRef.current) {
          const chart = new Chart(canvasRef.current, {
            type: "line",
            data: {
              labels: labels,
              datasets: [
                {
                  label: "Channel 1",
                  data: channel1,
                  borderColor: "rgba(255, 99, 132, 1)",
                  backgroundColor: "rgba(255, 99, 132, 0.2)",
                  fill: false,
                },
                {
                  label: "Channel 2",
                  data: channel2,
                  borderColor: "rgba(54, 162, 235, 1)",
                  backgroundColor: "rgba(54, 162, 235, 0.2)",
                  fill: false,
                },
                {
                  label: "Channel 3",
                  data: channel3,
                  borderColor: "rgba(75, 192, 192, 1)",
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  fill: false,
                },
                {
                  label: "Channel 4",
                  data: channel4,
                  borderColor: "rgba(153, 102, 255, 1)",
                  backgroundColor: "rgba(153, 102, 255, 0.2)",
                  fill: false,
                },
                {
                  label: "Channel 5",
                  data: channel5,
                  borderColor: "rgba(255, 159, 64, 1)",
                  backgroundColor: "rgba(255, 159, 64, 0.2)",
                  fill: false,
                },
                {
                  label: "Channel 6",
                  data: channel6,
                  borderColor: "rgba(255, 99, 132, 1)",
                  backgroundColor: "rgba(255, 99, 132, 0.2)",
                  fill: false,
                },
                {
                  label: "Channel 7",
                  data: channel7,
                  borderColor: "rgba(54, 162, 235, 1)",
                  backgroundColor: "rgba(54, 162, 235, 0.2)",
                  fill: false,
                },
                {
                  label: "Channel 8",
                  data: channel8,
                  borderColor: "rgba(75, 192, 192, 1)",
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  fill: false,
                },
              ],
            },
            options: {
              responsive: true,
              animation: false,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "Time",
                  },
                  min: xMin,
                  max: xMax,
                  grid: {
                    display: true,
                    color: "#e0e0e0",
                    borderColor: "#ccc",
                    borderWidth: 1,
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: "Value",
                  },
                  grid: {
                    display: true,
                    color: "#e0e0e0",
                    borderColor: "#ccc",
                    borderWidth: 1,
                  },
                },
              },
              plugins: {
                zoom: {
                  wheel: {
                    enabled: true, // Ativa o zoom com o scroll do mouse
                    speed: 0.1,
                    sensitivity: 3,
                  },
                  drag: {
                    enabled: true, // Ativa o zoom com o drag (arraste do mouse)
                    speed: 10,
                  },
                  pinch: {
                    enabled: true, // Ativa o zoom com o gesto de pinçar (mobile)
                    sensitivity: 3,
                  },
                },
              },
            },
            plugins: [zoomPlugin],
          });

          setMyChart(chart);

          canvasRef.current.addEventListener("wheel", (event) => {
            if (event.ctrlKey) {
              event.preventDefault();
            }
          });
        }

        setLoading(false);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [xMin, xMax]);

  function saveCanvas() {
    if (myChart) {
      const image = myChart.toBase64Image("image/jpeg", 1.0);
      const link = document.createElement("a");
      link.href = image;
      link.download = "grafico.jpg";
      link.click();
    } else {
      console.error("Chart instance is not available.");
    }
  }

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <div className="navbar">
            <h1 style={{ marginLeft: "70px" }}>Sistema Eeg</h1>
            <img
              style={{ marginRight: "70px" }}
              width="70px"
              src="/logo.jpeg"
            ></img>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <label>
              Min X:
              <input
                type="text"
                value={xMin}
                onChange={(e) => setXMin(Number(e.target.value))}
              />
            </label>
            <label>
              Max X:
              <input
                type="text"
                value={xMax}
                onChange={(e) => setXMax(Number(e.target.value))}
              />
            </label>

            <button onClick={updateChart}>Atualizar Gráfico</button>
            <button onClick={(e) => saveCanvas()}> Tirar foto</button>
          </div>

          <div style={{ marginTop: "20px" }}>
            <canvas ref={canvasRef} id="myChart"></canvas>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
