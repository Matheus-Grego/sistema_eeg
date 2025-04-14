import { React , useState,useEffect, useRef } from "react";
import "../css/home.css";
import { Chart as ChartJS } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { Slider, Switch } from "@mui/material";
import Modal from '@mui/material/Modal';
import { FileUploader } from "react-drag-drop-files";
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Multichart from "./multichart";
import SingleChart from "./singlechart";


function Home() {
  ChartJS.register(zoomPlugin);

  const [range, setRange] = useState([0,1500]);
  const [isLoading, setLoading] = useState(false);
  const [LoadingBar, setLoadingBar] = useState(false);
  const [IsMultichart, setMultichart] = useState(true);
  const [xMin, setXMin] = useState(0);
  const [xMax, setXMax] = useState(1500);
  const [file, setFile] = useState(null);

  
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
   
  };
  const handleClose = () => {
    setOpen(false);
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
  }

  const handlenew = (event, newValue) => {
    setXMin(newValue)
    setXMax(newValue+1500)
    setRange([newValue,newValue+1500])
  };
  
  const handleChange = (event, newValue) => {
    setRange(newValue);
  };

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

  const handleSwitch = (event) => {
    setMultichart(!IsMultichart)
  }
  
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
          <Switch
            checked={IsMultichart}
            onChange={handleSwitch}
            inputProps={{ 'aria-label': 'controlled' }}
          />
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
                  {IsMultichart ? (<Multichart range={range}/>) :( <SingleChart range={range}/>)}
              </main>
            </div>

            {/* MODELO NO THREE.JS */}
            <div className="main-container" style={{flex:1, alignItems: "center"}}>
            <h2>modelo em three.js</h2>
             <img className="brain-moch" src={process.env.PUBLIC_URL + '/brain-moch.png'}></img>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
