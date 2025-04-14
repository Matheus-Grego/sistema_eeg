import { Chart as ChartJS } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { React , useState,useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Line } from 'react-chartjs-2';

const Multichart = ({range}) => {
  ChartJS.register(zoomPlugin);
  const [xMin, setXMin] = useState(0);
  const [xMax, setXMax] = useState(1500);
  const [channel1, setChannel1] = useState(null);
  const [channel2, setChannel2] = useState(null);
  const [channel3, setChannel3] = useState(null);
  const [channel4, setChannel4] = useState(null);
  const [channel5, setChannel5] = useState(null);
  const [channel6, setChannel6] = useState(null);
  const [channel7, setChannel7] = useState(null);
  const [channel8, setChannel8] = useState(null);

  useEffect(() => {
    loadChartData();
  }, [range]);
  
  const getValues = async (channel) => {
      if (range !== [xMin,xMax]){
        var res = await fetch('http://200.236.3.148:877/channels/'+ (channel) + "/" + range[0] + "/" + range[1]);
        const data = await res.json();
        return data;
      }
      else{
          var res = await fetch('http://200.236.3.148:877/channels/'+ (channel) + "/" + xMin + "/" + xMax);
        const data = await res.json();
      return data;}
      
      };
        
  const createChartData = (data,times) => ({
      labels: times,
      datasets: [
        {
          data,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          pointRadius: 1,
          borderWidth: 2,
          tension: 0,
        },
      ],
    });
    
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
    const ch1 = await getValues(1);
    const ch2 = await getValues(2);
    const ch3 = await getValues(3);
    const ch4 = await getValues(4);
    const ch5 = await getValues(5);
    const ch6 = await getValues(6);
    const ch7 = await getValues(7);
    const ch8 = await getValues(8);
    
    const times = await getTime();
    
    setChannel1(createChartData(ch1, times));
    setChannel2(createChartData(ch2, times));
    setChannel3(createChartData(ch3, times));
    setChannel4(createChartData(ch4, times));
    setChannel5(createChartData(ch5, times));
    setChannel6(createChartData(ch6, times));
    setChannel7(createChartData(ch7, times));
    setChannel8(createChartData(ch8, times));
    };
  
  const options = {
      responsive: true,
      maintainAspectRatio: false,
        animation: {
          duration: 600,  
        },
        plugins: {
        legend: {
          display: false,  
        },
      },
      scales:{
        x: {
            display: false 
        }
    }}

    const options2 = {
      responsive: true,
      maintainAspectRatio: false,
        animation: {
          duration: 600,  
        },
        plugins: {
        legend: {
          display: false,  
        },
      },
      scales:{
        x: {
            display: true 
        }
    }}

  return(
    <div style={{width:"100%"}}>
        {channel8 !== null ? (<div style={{maxWidth:"95%"}}>
        <div className="multiline" style={{width: "100%", margin: "0 20px"}}>
            <Line data={channel1} options={options} id="myChart" />
        </div>
        <div className="multiline" style={{width: "100%", margin: "0 20px"}}>
            <Line data={channel2} options={options} id="myChart" />
        </div>
        <div className="multiline" style={{width: "100%", margin: "0 20px"}}>
            <Line data={channel3} options={options} id="myChart" />
        </div>
        <div className="multiline" style={{width: "100%", margin: "0 20px"}}>
            <Line data={channel4} options={options} id="myChart" />
        </div>
        <div className="multiline" style={{width: "100%", margin: "0 20px"}}>
            <Line data={channel5} options={options} id="myChart" />
        </div>
        <div className="multiline" style={{width: "100%", margin: "0 20px"}}>
            <Line data={channel6} options={options} id="myChart" />
        </div>
        <div className="multiline" style={{width: "100%", margin: "0 20px"}}>
            <Line data={channel7} options={options} id="myChart" />
        </div>
        <div className="multiline" style={{width: "100%", margin: "0 20px"}}>
            <Line data={channel8} options={options} id="myChart" />
        </div></div>) : (<div>carregando gráfico</div>)}
    </div>
    )
     

}

export default Multichart