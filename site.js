let graph = new TimeSeriesGraph("#line-graph");

async function getCovidData() {
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
getCovidData().then((data) => {
  let infected = data.map((e) => [e.date, e.brazil.infected]);
  let deceased = data.map((e) => [e.date, e.brazil.deceased]);
  console.log(infected);
  console.log(deceased);
  graph.addData(infected, "#ff7b00", "infected");
  graph.addData(deceased, "#962121", "deceased");
});
