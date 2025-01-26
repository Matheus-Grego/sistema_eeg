const express = require("express");
const fs = require("fs");
const path = require("path");
var cors = require('cors')

const app = express();

let channels = {};
const filePath = path.join(__dirname, "dataset3.json");

app.use(cors())

async function loadData() {
  try {
    const data = await fs.promises.readFile(filePath, { encoding: "utf-8" });
    const jsonData = JSON.parse(data); // Parse do JSON completo

    channels.labels = jsonData.Time.slice(0, 1500)|| [];
    channels.channel1 = jsonData.Ch1.slice(0, 1500) || [];
    channels.channel2 = jsonData.Ch2.slice(0, 1500) || [];
    channels.channel3 = jsonData.Ch3.slice(0, 1500) || [];
    channels.channel4 = jsonData.Ch4.slice(0, 1500) || [];
    channels.channel5 = jsonData.Ch5.slice(0, 1500) || [];
    channels.channel6 = jsonData.Ch6.slice(0, 1500) || [];
    channels.channel7 = jsonData.Ch7.slice(0, 1500) || [];
    channels.channel8 = jsonData.Ch8.slice(0, 1500) || [];

    console.log("Dados carregados (primeiros 10 itens):");
  } catch (err) {
    console.error("Erro ao ler o arquivo:", err);
  }
}

loadData().then(() => {
    app.get("/channels/:channelId", (req, res) => {
      const { channelId } = req.params;
  
      if (Object.keys(channels).length === 0) {
        return res.status(500).send("Dados ainda não carregados");
      }
    
      const channelKey = `channel${channelId}`; 
      const channel = channels[channelKey];

      if (!channel) {
        return res.status(404).send(`Channel '${channelId}' não encontrado.`);
      }
      res.json(channel);
    })
    app.get("/time", (req,res) => {
      if (Object.keys(channels).length === 0) {
        return res.status(500).send("Dados ainda não carregados");
      }
      const time = channels.labels
      res.json(time)
    });
  
    console.log("CARREGOU");
  }).catch((err) => {
    console.error("Erro ao carregar os dados:", err);
  });


app.listen(1000, () => {
  console.log("Servidor rodando na porta 1000");
});
