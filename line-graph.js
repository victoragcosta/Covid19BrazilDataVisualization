class LineGraph {
  constructor(selector) {
    this.element = d3.select(selector);
    this.data = {};

    this.width = 1920;
    this.height = 1080;
    this.margin = {
      top: 50,
      right: 50,
      bottom: 150,
      left: 150,
    };

    // Guarantee graph styling
    this.element.classed("graph", true);

    // Create key element
    this.key = this.element.append("div").attr("class", "key");

    this.svg = this.element
      .append("svg")
      .style("width", "100%")
      .style("height", "100%")
      .style("overflow", "hidden")
      .attr("transform", "scale(1,-1)")
      .attr("viewBox", `0 0 ${this.width} ${this.height}`);
    // .attr("preserveAspectRatio", "none");

    this.chart = this.svg
      .append("g")
      .attr(
        "transform",
        `translate(${this.margin.left},${this.margin.bottom})`
      );

    this.x = d3
      .scaleLinear()
      .rangeRound([0, this.width - this.margin.left - this.margin.right]);
    this.y = d3
      .scaleLinear()
      .rangeRound([0, this.height - this.margin.top - this.margin.bottom]);

    this.xAxis = this.svg
      .append("g")
      .attr(
        "transform",
        `translate(${this.margin.left},${this.margin.bottom})`
      );

    this.yAxis = this.svg
      .append("g")
      .attr(
        "transform",
        `translate(${this.margin.left},${this.margin.bottom})`
      );
  }

  renderData() {
    let transitionDuration = 3000;
    let transitionEase = d3.easeExpOut;
    let transition = this.svg
      .transition()
      .duration(transitionDuration)
      .ease(transitionEase);

    let { data, maxX, minX, maxY, minY } = this.getTreatedData();

    this.x.domain([minX, maxX]);
    this.y.domain([minY, maxY]);
    let x = this.x;
    let y = this.y;
    let line = d3
      .line()
      .x((d) => x(d[0]))
      .y((d) => y(d[1]));

    this.insertXAxis(transition);
    this.insertYAxis(transition);

    this.chart
      .selectAll("path.line")
      .data(data, (d) => d.id)
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("class", (d) => "line" + (d.id === null ? "" : " " + d.id))
            .attr("stroke", (d) => d.color)
            .attr("d", (d) => line(d.data))
            .attr("stroke-dasharray", function () {
              let totalLength = this.getTotalLength();
              return totalLength + " " + totalLength;
            })
            .attr("stroke-dashoffset", function () {
              let totalLength = this.getTotalLength();
              return totalLength;
            }),
        (update) => update,
        (exit) => exit.transition(transition).remove()
      )
      .transition(transition)
      .attr("d", (d) => line(d.data))
      .attr("stroke", (d) => d.color)
      .attr("stroke-dashoffset", 0);
    this.renderKey();
  }

  insertYAxis(transition) {
    return this.yAxis
      .transition(transition)
      .call(this.getYAxisGenerator())
      .selectAll("text")
      .attr("x", -20)
      .style("text-anchor", "end")
      .style("font-size", 30 + "px")
      .attr("transform", "scale(1,-1)");
  }

  insertXAxis(transition) {
    return this.xAxis
      .transition(transition)
      .call(this.getXAxisGenerator())
      .selectAll("text")
      .attr("y", 40)
      .style("font-size", 30 + "px")
      .attr("transform", "scale(1,-1)");
  }

  getYAxisGenerator() {
    return d3.axisLeft(this.y).ticks(10);
  }

  getXAxisGenerator() {
    return d3.axisTop(this.x).ticks(10);
  }

  getTreatedData() {
    let data = [];
    let maxX, minX, maxY, minY;
    for (const lineId in this.data) {
      if (this.data.hasOwnProperty(lineId)) {
        const info = this.data[lineId];

        let [localMinX, localMaxX] = d3.extent(info.data.map((d) => d[0]));
        let [localMinY, localMaxY] = d3.extent(info.data.map((d) => d[1]));
        if (minX === undefined || localMinX < minX) minX = localMinX;
        if (maxX === undefined || localMaxX > maxX) maxX = localMaxX;
        if (minY === undefined || localMinY < minY) minY = localMinY;
        if (maxY === undefined || localMaxY > maxY) maxY = localMaxY;

        let datum = { id: lineId };
        datum = Object.assign(datum, info);
        data.push(datum);
      }
    }
    return { data, minX, maxX, minY, maxY };
  }

  addData(data, color = "steelblue", id = null, name = undefined) {
    this.data[id] = { data, color, name };
    this.renderData();
  }

  renderKey() {
    // Extract key data
    let key = [];
    for (const id in this.data) {
      if (this.data.hasOwnProperty(id)) {
        const { data, color, name } = this.data[id];
        if (data.length > 0) key.push({ id, name: name ? name : id, color });
      }
    }

    // Update key
    this.key
      .selectAll("div.key-element")
      .data(key, (d) => d.id)
      .join(
        (enter) =>
          enter
            .append("div")
            .attr("class", "key-element")
            .call((element) =>
              element
                .append("div")
                .attr("class", "key-element-name")
                .text((d) => d.name)
            )
            .call((element) =>
              element
                .append("div")
                .attr("class", "key-element-color")
                .style("background-color", (d) => d.color)
            ),
        (update) => update,
        (exit) => exit.remove()
      );
  }
}

class TimeSeriesGraph extends LineGraph {
  constructor(selector) {
    super(selector);
    this.x = d3
      .scaleTime()
      .rangeRound([0, this.width - this.margin.left - this.margin.right]);
  }

  insertXAxis(transition) {
    let ticksText = LineGraph.prototype.insertXAxis.call(this, transition);
    ticksText
      .attr("transform", "scale(1,-1) rotate(45)")
      .attr("y", 30)
      .attr("x", 80);
  }

  getXAxisGenerator() {
    return d3.axisTop(this.x).tickFormat(this.x.tickFormat(10, "%d/%m/%Y"));
  }
}
