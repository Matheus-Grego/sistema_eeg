import { React , useState,useEffect, useRef } from "react";
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
import Switch from '@mui/material/Switch';
import { pink } from '@mui/material/colors';
import { styled } from "@mui/material/styles";
import Modal from '@mui/material/Modal';
import { FileUploader } from "react-drag-drop-files";
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';


// import CloudUploadIcon from '@mui/icons-material/CloudUpload';


function Home() {
  ChartJS.register(zoomPlugin);

  const [range, setRange] = useState([0,1500]);
  const [chartData, setChartData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [LoadingBar, setLoadingBar] = useState(false);
  const canvasRef = useRef(null);
  const [channelSelected, setChannel] = useState(0);
  const [xMin, setXMin] = useState(0);
  const [xMax, setXMax] = useState(1500);
  const [file, setFile] = useState(null);

  const handleFile = (file) => {
    setFile(file);
  };

  const fileTypes = ["JSON"];
  
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
   
  };
  const handleClose = () => {
    setOpen(false);
  };

  const [myChart, setMyChart] = useState(null);

  const label = { inputProps: { 'aria-label': 'Color switch demo' } };

  const getValues = async () => {
   
    if (range !== [xMin,xMax]){
      var res = await fetch('http://200.236.3.148:877/channels/'+ (channelSelected+1) + "/" + range[0] + "/" + range[1]);
      const data = await res.json();
      return data;
    }
    else{
	   var res = await fetch('http://200.236.3.148:877/channels/'+ (channelSelected+1) + "/" + xMin + "/" + xMax);
     const data = await res.json();
    return data;}
    
	};


  const getTime = async () => {
    if (range !== [xMin,xMax]){
      let res = await fetch('http://200.236.3.148:877/time/' + Math.floor(Number(range[0])/4) + "/" + Math.floor(Number(range[1])/4));
      const data = await res.json();
      return data
    }
    else{
		let res = await fetch('http://200.236.3.148:877/time/' + Math.floor(Number(xMin)/4) + "/" + Math.floor(Number(xMax)/4));
		const data = await res.json();
    return data}
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
          pointRadius: 1, // Ajusta o tamanho dos pontos
          borderWidth: 2,

          tension: 0
        },
      ],
    });
  };
  const options = {
    responsive: true,
     animation: {
       duration: 600,  
     },
     plugins: {
      legend: {
        display: false,  // Remove a legenda
      },
    },
    // scales: {
    //   y: {
    //     min: -1300,  // Define o mínimo do eixo Y
    //     max: 1300,   // Define o máximo do eixo Y
    //     ticks: {
    //       callback: (value) => value.toFixed(5),
    //     },
    //   }}
  };

  
  function saveCanvas() {

    const chartCanvas = document.getElementById('myChart');
    if (chartCanvas) {
      const base64Image = chartCanvas.toDataURL("image/jpeg");
      const link = document.createElement("a");
      link.href = base64Image;
      link.download = "grafico.jpg";
      link.click();
  } else {
    console.error(`Canvas não encontrado.`);
  }
    
      // const image = myChart.toBase64Image("image/jpeg", 1.0);
      // const link = document.createElement("a");
      // link.href = image;
      // link.download = "grafico.jpg";
      // link.click();
   
  }

  const handlenew = (event, newValue) => {
    setXMin(newValue)
    setXMax(newValue+1500)
    setRange([newValue,newValue+1500])
  };
  
  const handleChange = (event, newValue) => {
    setRange(newValue);
  };
  const handleChannel = (event,newChannel) => {
    setChannel(newChannel)
  }

  // const CustomSlider = styled(Slider)(({ theme }) => ({
  //   "& .MuiSlider-thumb": {
  //     width: 50, 
  //     height: 15, 
  //     borderRadius: 2, 
  //     backgroundColor: theme.palette.primary.main, 
  //     border: `2px solid ${theme.palette.primary.dark}`, 
  //     "&:hover": {
  //       boxShadow: `0px 0px 0px 8px rgba(0, 0, 0, 0.1)`, 
  //     },
  //   },
  //   "& .MuiSlider-track": {
  //     display: "none",
  //   },
   
  //   "& .MuiSlider-thumb.Mui-active": {
  //     boxShadow: `0px 0px 0px 12px rgba(0, 0, 0, 0.2)`, 
  //   },
  // }));

  const handleFilePOST = (file) => {
     const formData = new FormData();
     formData.append("file", file);
     setLoadingBar(true)
  
     fetch("http://200.236.3.148:877/upload", {
       method: "POST",
       body: formData
     })
     .then((response) => {
          
          // response.json()
          window.location.reload();

    })
     .then(data => console.log("Arquivo enviado:", data))
     .catch(error => console.error("Erro ao enviar:", error));

     

  };
  

  useEffect(() => {
    loadChartData();
  }, [channelSelected,range]);
  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
            <nav className="navbar">
              <div style={{display:"flex", justifyContent: "center", alignItems: "center", gap: "30px"}}>
                <h1 className="navbar-title">EEG Graphic Viewer</h1>
                <a onClick={() => handleOpen()} className="bnt-photo">Upar novo arquivo <img style={{width: "20px"}}src={process.env.PUBLIC_URL + '/upload.png'}></img></a>
                <a className="bnt-photo">Buscar registros <img style={{width: "20px"}}src={process.env.PUBLIC_URL + '/search.png'}></img></a>
                
              </div>
             
              <img className="navbar-logo" src={process.env.PUBLIC_URL + '/logo2.png'} alt="Logo" />
            </nav>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="parent-modal-title"
                aria-describedby="parent-modal-description"
              >
                <div className="my-style" style={{width: "400" }}>
                  <h1 id="parent-modal-title">Enviar um novo relatório</h1>
                  <p id="parent-modal-description">
                    Arraste e solte aqui o arquivo .JSON com os dados do EEG
                    <FileUploader 
                      style={{ width: "40vw", height: "40vh" }} 
                      handleChange={handleFilePOST} 
                      name="file" 
                      types={["CSV"]} 
                    />
                  </p>
                  {LoadingBar ? (
                      <div style={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Stack direction="row" spacing={2}>
                          <CircularProgress />
                        </Stack>
                      </div>
                    ) : (
                      <div></div>
                    )}
                </div>
              </Modal>
        
          <menu className="toolbar">
          <div className="toolbar-container">
      
            <div style={{width: "600px"}}>
            <Slider
              aria-label="Temperature"
              value={xMin}
              onChange={handlenew}
              valueLabelDisplay="auto"
              defaultValue={0}
              shiftStep={30}
              step={1500}
              marks
              min={0}
              max={19999}
            />
            </div>
            {/* <Switch {...label} defaultChecked color="default" /> */}
            <div style={{width: "300px"}}>
              <Slider
                  getAriaLabel={() => 'EEG Range'}
                  value={range}
                  onChange={handleChange}
                  valueLabelDisplay="auto"
                  min={xMin}
                  max={xMax}
                />
            </div>

            <a className="bnt-photo" onClick={() => saveCanvas()}>Tirar Foto <img style={{width: "20px"}}src={process.env.PUBLIC_URL + '/photo-camera.png'}></img></a>
         
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

            {/* MODELO NO THREE.JS */}
            <div className="main-container" style={{flex:1, alignItems: "center"}}>
            <h2>modelo em three.js</h2>
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
