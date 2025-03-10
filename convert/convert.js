
const path = require("path");
const fs = require('fs');
const csv = require('csv-parser');
const dsp = require('dsp.js');


const filePath = path.join(__dirname, "dadosteste.csv");



// Frequência de amostragem
const fsample = 250;  // Frequência de amostragem

// Função para calcular os coeficientes de um filtro Bandpass
function bandpassCoefficients(frequencyLow, frequencyHigh, fsample) {
    const omegaLow = 2 * Math.PI * frequencyLow / fsample;
    const omegaHigh = 2 * Math.PI * frequencyHigh / fsample;
    const bandwidth = omegaHigh - omegaLow;
    const centerFreq = Math.sqrt(omegaLow * omegaHigh);

    const Q = centerFreq / bandwidth;

    // Calculando os coeficientes do filtro Biquad para Bandpass
    const alpha = Math.sin(omegaLow) / (2 * Q);

    const a0 = 1 + alpha;
    const a1 = -2 * Math.cos(centerFreq);
    const a2 = 1 - alpha;
    const b0 = alpha;
    const b1 = 0;
    const b2 = -alpha;

    return { a0, a1, a2, b0, b1, b2 };
}

// Função para calcular os coeficientes de um filtro Bandstop
function bandstopCoefficients(frequencyLow, frequencyHigh, fsample) {
    const omegaLow = 2 * Math.PI * frequencyLow / fsample;
    const omegaHigh = 2 * Math.PI * frequencyHigh / fsample;
    const bandwidth = omegaHigh - omegaLow;
    const centerFreq = Math.sqrt(omegaLow * omegaHigh);

    const Q = centerFreq / bandwidth;

    // Calculando os coeficientes do filtro Biquad para Bandstop
    const alpha = Math.sin(omegaLow) / (2 * Q);

    const a0 = 1 + alpha;
    const a1 = -2 * Math.cos(centerFreq);
    const a2 = 1 - alpha;
    const b0 = 1;
    const b1 = -2 * Math.cos(centerFreq);
    const b2 = 1;

    return { a0, a1, a2, b0, b1, b2 };
}

// Função para aplicar o filtro no dado utilizando os coeficientes
function applyFilter(data, coeffs) {
    const output = [];
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;

    for (let i = 0; i < data.length; i++) {
        const x0 = data[i];
        const y0 = (coeffs.b0 * x0 + coeffs.b1 * x1 + coeffs.b2 * x2 - coeffs.a1 * y1 - coeffs.a2 * y2) / coeffs.a0;

        output.push(y0);

        // Atualiza os valores para o próximo ciclo
        x2 = x1;
        x1 = x0;
        y2 = y1;
        y1 = y0;
    }

    return output;
}

// Função para aplicar os filtros na sequência correta
function processData(data) {
    let markers = [];

    // Encontrar os marcadores (valores não nulos na 10ª coluna)
    data.forEach((row, i) => {
        if (row.Ch10 !== null && row.Ch10 !== "") {
            markers.push(i);
        }
    });

    // Filtra os dados começando do segundo marcador
    data = data.slice(markers[1]);

    // Ajuste de tempo
    const timeShift = data[0].Time;
    data.forEach(row => row.Time -= timeShift);

    // Coeficientes de filtro
    const bandstopCoeffs = bandstopCoefficients(1 / fsample, 5 / fsample, fsample);  // Filtro Bandstop
    const bandpassCoeffs = bandpassCoefficients(4 / fsample, 32 / fsample, fsample);  // Filtro Bandpass

    // Aplicação dos filtros em cada canal
    for (let i = 1; i <= 8; i++) {
        let channelData = data.map(row => row[`Ch${i}`]);

        // Aplica os filtros sequenciais
        channelData = applyFilter(channelData, bandstopCoeffs);  // Filtro Bandstop
        channelData = applyFilter(channelData, notch_60Coeffs);  // Filtro notch de 60 Hz
        channelData = applyFilter(channelData, bandpassCoeffs);  // Filtro Bandpass

        // Substitui valores que excedem 60 por 0
        channelData = channelData.map(x => Math.abs(x) > 60 ? 0 : x);

        // Aplica os filtros novamente
        channelData = applyFilter(channelData, bandstopCoeffs);  // Filtro Bandstop
        channelData = applyFilter(channelData, notch_0Coeffs);  // Filtro notch de 4 Hz

        // Atualiza os dados
        for (let j = 0; j < data.length; j++) {
            data[j][`Ch${i}`] = channelData[j];
        }
    }

    return data;
}

// Leitura do CSV
const data = [];
fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
        data.push({
            Time: parseFloat(row.Time),
            Ch1: parseFloat(row.Ch1),
            Ch2: parseFloat(row.Ch2),
            Ch3: parseFloat(row.Ch3),
            Ch4: parseFloat(row.Ch4),
            Ch5: parseFloat(row.Ch5),
            Ch6: parseFloat(row.Ch6),
            Ch7: parseFloat(row.Ch7),
            Ch8: parseFloat(row.Ch8),
            Ch10: row.Ch10  // Usado para marcar os dados
        });
    })
    .on('end', () => {
        const processedData = processData(data);

        // Converte os dados para o formato de arrays como string
        const formattedData = {
            Time: `[${processedData.map(row => row.Time).join(', ')}]`,
            Ch1: `[${processedData.map(row => row.Ch1).join(', ')}]`,
            Ch2: `[${processedData.map(row => row.Ch2).join(', ')}]`,
            Ch3: `[${processedData.map(row => row.Ch3).join(', ')}]`,
            Ch4: `[${processedData.map(row => row.Ch4).join(', ')}]`,
            Ch5: `[${processedData.map(row => row.Ch5).join(', ')}]`,
            Ch6: `[${processedData.map(row => row.Ch6).join(', ')}]`,
            Ch7: `[${processedData.map(row => row.Ch7).join(', ')}]`,
            Ch8: `[${processedData.map(row => row.Ch8).join(', ')}]`
        };

        // Converte para CSV
        const header = ['Time', 'Ch1', 'Ch2', 'Ch3', 'Ch4', 'Ch5', 'Ch6', 'Ch7', 'Ch8'];
        const csvData = [header.join(',')];
        csvData.push(Object.values(formattedData).join(','));

        // Escreve o arquivo CSV
        fs.writeFileSync('dataset.csv', csvData.join('\n'));

        console.log('Arquivo CSV gerado com sucesso!');
    });
