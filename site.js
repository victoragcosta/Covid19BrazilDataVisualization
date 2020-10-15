let graph = new TimeSeriesGraph("#line-graph");

// Gets data from Apify
async function getCovidDataApify() {
  const apiUrl =
    "https://api.apify.com/v2/datasets/3S2T1ZBxB9zhRJTBB/items?format=json&clean=1";
  const response = await fetch(apiUrl);
  const covidRawData = await response.json();
  const filteredData = covidRawData.map((e) => {
    let filtered = {
      date: new Date(Date.parse(e.lastUpdatedAtSource)),
      brazil: {
        infected: e.infected,
        deceased: e.deceased,
      },
    };
    e.infectedByRegion.forEach((region) => {
      if (region.state.length <= 2) {
        filtered[region.state] = {
          infected: region.count,
          deceased: 0,
        };
      }
    });
    if (e.deceasedByRegion) {
      e.deceasedByRegion.forEach((region) => {
        if (region.state.length <= 2) {
          filtered[region.state].deceased = region.count;
        }
      });
    }
    return filtered;
  });
  return filteredData;
}

// Gets data from an automatically generated csv from the official Brazil data
// Fields:
// regiao;estado;municipio;coduf;codmun;codRegiaoSaude;nomeRegiaoSaude;
// data; semanaEpi; populacaoTCU2019;
// casosAcumulado; casosNovos; obitosAcumulado; obitosNovos; Recuperadosnovos; emAcompanhamentoNovos; interior/metropolitana
async function getCovidDataOfficial() {
  // Extract rows from the CSV
  let data = await d3.dsv(";", "HIST_PAINEL_COVIDBR.csv", function (d) {
    let processed = {};
    for (const param in d) {
      if (d.hasOwnProperty(param)) {
        const value = d[param];
        if (!(isNaN(value) || value === "")) {
          // A number!
          processed[param] = +value;
        } else if (param === "data") {
          // A date
          processed[param] = new Date(value + " 00:00");
        } else {
          // Probably a string
          processed[param] = value;
        }
      }
    }
    return processed;
  });
  return data;
}

// getCovidDataApify().then((data) => {
//   let infected = data.map((e) => [e.date, e.brazil.infected]);
//   let deceased = data.map((e) => [e.date, e.brazil.deceased]);
//   // console.log(infected);
//   // console.log(deceased);
//   graph.addData(infected, "#ff7b00", "infected");
//   graph.addData(deceased, "#962121", "deceased");
// });

let filter = d3.select("#region").node().value;
let graphs = [
  {
    id: "deceased",
    name: "Total de óbitos",
    column: "obitosAcumulado",
    color: "#962121",
  },
  {
    id: "infected",
    name: "Total de casos",
    column: "casosAcumulado",
    color: "#ff7b00",
  },
  {
    id: "current",
    name: "Total de casos correntes",
    column: "emAcompanhamentoNovos",
    color: "#dede00",
  },
  {
    id: "healed",
    name: "Total de casos recuperados",
    column: "Recuperadosnovos",
    color: "#007b00",
  },
];

let extractedData;
function setGraph() {
  d3.select(d3.select("#region").node().parentNode)
    // .insert("p", ":first-child")
    .append("p")
    .attr("class", "delete-me")
    .text("Carregando...");

  let filteredData;
  if (filter === "BR") {
    filteredData = extractedData.filter((e) => e.regiao === "Brasil");
  } else if (filter.split(" ")[0] === "UF") {
    let uf = filter.split(" ")[1];
    filteredData = extractedData.filter(
      (e) => e.estado === uf && e.municipio === "" && e.codmun === ""
    );
  }
  filteredData = filteredData.sort((a, b) => a.data - b.data);

  graphs.forEach((graphInfo) => {
    let treatedData = filteredData
      .map((e) => [e.data, e[graphInfo.column]])
      .filter((e) => e[1] > 0);

    graph.addData(treatedData, graphInfo.color, graphInfo.id, graphInfo.name);
  });

  d3.selectAll(".delete-me").remove();
}

getCovidDataOfficial()
  .then((data) => {
    extractedData = data;
  })
  .then(setGraph);

document.getElementById("region").onchange = function (ev) {
  filter = this.value;
  setGraph();
};
