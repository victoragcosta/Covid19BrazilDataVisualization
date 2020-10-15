class CardsManager {
  constructor(selector) {
    this.element = d3.select(selector);
    this.data = {};
    let locale = d3.formatLocale({
      decimal: ",",
      thousands: ".",
      grouping: [3],
      currency: ["R$", ""],
    });
    this.dateFormat = d3.timeFormat("%d/%m/%Y");
    this.valueFormat = locale.format(",");
  }

  renderData() {
    let data = this.getTreatedData();
    this.element
      .selectAll(".card")
      .data(data, (d) => d.id)
      .join(
        (enter) =>
          enter
            .append("div")
            .classed("card", true)
            .call((card) => card.append("div").classed("card-title", true))
            .call((card) => card.append("div").classed("card-spacer", true))
            .call((card) => card.append("div").classed("card-value", true))
            .call((card) => card.append("div").classed("card-date", true)),
        (update) => update,
        (exit) => exit.remove()
      )
      .call((card) => card.select(".card-title").text((d) => d.name))
      .call((card) =>
        card.select(".card-value").text((d) => this.valueFormat(d.value))
      )
      .call((card) =>
        card
          .select(".card-date")
          .text((d) => "Atualizado em: " + this.dateFormat(d.date))
      );
  }

  getTreatedData() {
    let data = [];
    for (const id in this.data) {
      if (this.data.hasOwnProperty(id)) {
        const info = this.data[id];
        let datum = { id: id };
        datum = Object.assign(datum, info);
        data.push(datum);
      }
    }
    return data;
  }

  addData(id, name, date, value) {
    this.data[id] = { name, date, value };
    this.renderData();
  }
  removeData(id) {
    delete this.data[id];
    this.renderData();
  }
}
