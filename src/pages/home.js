import { React, useEffect, useState, useRef, Suspense } from "react";

import { useQuery } from "react-query";
import Chart from "chart.js/auto";
import "../css/home.css";
import { Chart as ChartJS } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { Slider } from "@mui/material";
import { Line } from 'react-chartjs-2';
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Brain from '../brain/Brain'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// import CloudUploadIcon from '@mui/icons-material/CloudUpload';


function Home() {
  ChartJS.register(zoomPlugin);
  const [range, setRange] = useState([0, 70000]);
  const [chartData, setChartData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const [channelSelected, setChannel] = useState(1);
  const [channelChanged, setChanged] = useState(false)
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

  const getValues = async () => {
		const res = await fetch('http://localhost:1000/channels/'+ (channelSelected+1));
    const data = await res.json();
    return data;
	};
  const getTime = async () => {
		const res = await fetch('http://localhost:1000/time');
		const data = await res.json();
    return data;
	};
  const loadChartData = async () => {
    const values = await getValues();
    const times = await getTime();

    setChartData({
      labels: times,
      datasets: [
        {
          label: 'Meu Gráfico',
          data: values,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
        },
      ],
    });
  };
  const options = {
    responsive: true,
     animation: {
       duration: 300,  
     },
     plugins: {
      legend: {
        display: false,  // Remove a legenda
      },
    },
  };

  // useEffect(() => {
  //   loadChartData();
  //   setChanged(false)
  //   }, [channelChanged]);
   
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
  const handleChange = (event, newValue) => {
    setRange(newValue);
  };
  const handleChannel = (event,newChannel) => {
    setChanged(true)
    setChannel(newChannel)
  }
  loadChartData()
  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
            <nav className="navbar">
              <div style={{display:"flex", justifyContent: "center", alignItems: "center", gap: "30px"}}>
                <h1 className="navbar-title">EEG Graphic Viewer</h1>
                <a className="bnt-photo">Upar novo arquivo <img style={{width: "20px"}}src={process.env.PUBLIC_URL + '/upload.png'}></img></a>
                <a className="bnt-photo">Buscar registros <img style={{width: "20px"}}src={process.env.PUBLIC_URL + '/search.png'}></img></a>
              </div>
             
              <img className="navbar-logo" src={process.env.PUBLIC_URL + '/logo2.png'} alt="Logo" />
            </nav>
        
          <menu className="toolbar">
          <div className="toolbar-container">
            <div style={{width: "300px"}}>
              <Slider
                  getAriaLabel={() => 'EEG Range'}
                  value={range}
                  onChange={handleChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={70000}
                />
            </div>

            <a className="bnt-photo">Tirar Foto <img style={{width: "20px"}}src={process.env.PUBLIC_URL + '/photo-camera.png'}></img></a>
         
          </div>  
          </menu> 
          <div style={{display:"flex", margin: "0 30px", gap: "15px"}}>
            <div style={{display:"flex", justifyContent:"center", flex:2}}>
              <main className="main-container">
              <Tabs value={channelSelected} onChange={handleChannel} centered sx={{'& .MuiTab-root': {color: 'white'}, '& .Mui-selected': {color: 'primary.main'}}}>
                <Tab label="Canal 1" />
                <Tab label="Canal 2" />
                <Tab label="Canal 3" />
                <Tab label="Canal 4" />
                <Tab label="Canal 5" />
                <Tab label="Canal 6" />
                <Tab label="Canal 7" />
                <Tab label="Canal 8" />
              </Tabs>
                {chartData ? (
                    <div style={{width: "100%", margin: "0 20px"}}>
                      <Line data={chartData} options={options} id="myChart" />
                    </div>
                    
                  ) : (
                    <p>Carregando gráfico...</p>
                  )}
              </main>
            </div>
            <div className="main-container" style={{flex:1}}>
             <img className="brain-moch" src={process.env.PUBLIC_URL + '/brain-moch.png'}></img>
              {/* <Canvas>
                <Suspense fallback={null}>
                  <Brain/>
                </Suspense>
              </Canvas> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
