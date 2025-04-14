import { Chart as ChartJS } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { React , useState,useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Line } from 'react-chartjs-2';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const SingleChart = ({range}) =>{
const [channelSelected, setChannel] = useState(0);
const [xMin, setXMin] = useState(0);
const [xMax, setXMax] = useState(1500);
const [chartData, setChartData] = useState(null);
useEffect(() => {
    loadChartData();
  }, [range,channelSelected]);

const getValues = async () => {

    
    if (range !== [xMin,xMax]){
      var res = await fetch('http://localhost:877/channels/'+ (channelSelected+1) + "/" + range[0] + "/" + range[1]);
      const data = await res.json();
      return data;
    }
    else{
	   var res = await fetch('http://localhost:877/channels/'+ (channelSelected+1) + "/" + xMin + "/" + xMax);
     const data = await res.json();
    return data;}
    
	};


  const getTime = async () => {
    if (range !== [xMin,xMax]){
      let res = await fetch('http://localhost:877/time/' + Math.floor(Number(range[0])/4) + "/" + Math.floor(Number(range[1])/4));
      const data = await res.json();
      return data
    }
    else{
		let res = await fetch('http://localhost:877/time/' + Math.floor(Number(xMin)/4) + "/" + Math.floor(Number(xMax)/4));
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
  };

  const handleChannel = (event,newChannel) => {
    setChannel(newChannel)
  }
  
  return(
    <div>
         {chartData ? (
            <div>
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
        <div style={{width: "100%", margin: "0 20px"}}>
            <Line data={chartData} options={options} id="myChart" />
        </div>
        </div>) : (<p>carregando</p>)}
    </div>
    
 )
}

export default SingleChart