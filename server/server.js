const express = require("express");
const fs = require("fs");
const path = require("path");
var cors = require('cors');
const multer = require('multer');
const csv = require("csv-parser");
const { exec } = require('node:child_process');

const app = express();

let channels = {};
var filePath = path.join(__dirname, 'uploads', 'saida3.csv');

app.use(cors())

const uploadDirectory = path.join(__dirname, 'raw');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    cb(null, 'teste.csv');
  }
});

const upload = multer({ storage: storage });



app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado." });
  }

  const command = `julia main.jl "C:\\Users\\User\\sistema_eeg\\server\\raw\\teste.csv"`;

  exec(command, {
    cwd: '/Users/User/Sinapsense'
  }, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao processar o arquivo." });
    }
    console.log(123)
    console.log(stdout);
    
    const filePath = path.join('/Users/User/Sinapsense', 'saida2.csv');
    const uploadPath = path.join(__dirname, 'uploads', 'saida3.csv'); // Salvar em 'uploads/saida3.csv'

    fs.rename(filePath, uploadPath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao mover o arquivo." });
      }

      res.json({ message: "Arquivo processado com sucesso", filePath: uploadPath });
      loadData()
    });
  });
});

function safeParseArray(data, columnName) {
  if (!data || data.trim() === "") {
    console.warn(`Aviso: Coluna "${columnName}" está vazia. Definindo como array vazio.`);
    return []; 
  }

  try {
    return JSON.parse(data);
  } catch (err) {
    console.error(`Erro ao converter JSON na coluna "${columnName}": ${err.message}`);
    return [];
  }
}

async function loadData() {
  try {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        try {
          channels.labels = safeParseArray(row.Time, "Time");
          channels.channel1 = safeParseArray(row.Ch1, "Ch1");
          channels.channel2 = safeParseArray(row.Ch2, "Ch2");
          channels.channel3 = safeParseArray(row.Ch3, "Ch3");
          channels.channel4 = safeParseArray(row.Ch4, "Ch4");
          channels.channel5 = safeParseArray(row.Ch5, "Ch5");
          channels.channel6 = safeParseArray(row.Ch6, "Ch6");
          channels.channel7 = safeParseArray(row.Ch7, "Ch7");
          channels.channel8 = safeParseArray(row.Ch8, "Ch8");
        } catch (err) {
          console.error("Erro ao processar linha:", err.message);
        }
      })
      .on("end", () => {
        console.log("Dados carregados com sucesso!");
      })
      .on("error", (error) => {
        console.error("Erro ao carregar os dados:", error);
      });
   
  } catch (err) {
    console.error("Erro ao ler o arquivo:", err);
  }
}

loadData().then(() => {
    app.get("/teste", (req, res) => {
      const channel = channels.labels
      res.json(channel);
    })
    app.get("/channels/:channelId/:min/:max", (req, res) => {
      const { channelId ,min, max} = req.params;

      if (Object.keys(channels).length === 0) {
        return res.status(500).send("Dados ainda não carregados");
      }
    
      const channelKey = `channel${channelId}`; 
      const channel = channels[channelKey]?.slice(Number(min), Number(max));

      if (!channel) {
        return res.status(404).send(`Channel '${channelId}' não encontrado.`);
      }
      res.json(channel);
    })
    app.get("/time/:min/:max", (req,res) => {
      const {min, max} = req.params;
      if (Object.keys(channels).length === 0) {
        return res.status(500).send("Dados ainda não carregados");
      }
      const time = channels.labels?.slice(Number(min),Number(max))
      res.json(time)
    });
  
    console.log("CARREGOU");
  }).catch((err) => {
    console.error("Erro ao carregar os dados:", err);
  });


app.listen(877, () => {
  console.log("Servidor rodando na porta 877");
});
