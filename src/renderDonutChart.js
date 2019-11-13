const addGlobalSvg = (width, height) => {
  return d3.select(".donut-chart")
    .append('svg')
    .attr('class', 'pie')
    .attr('width', width)
    .attr('height', height);
}

const addArc = (thickness, radius) => {
  return d3.arc()
    .innerRadius(radius - thickness)
    .outerRadius(radius);
}

const addColorPalette = () => {
  const colorArr = ['#B83B5E', '#995A3A', '#F08A5D', '#F9D769', '#6A2C70'];
  return d3.scaleOrdinal(colorArr);
}

const addPieRadius = () => {
  // transform the value of each group to a radius that will be displayed on the chart.
  return d3.pie()
    .value(function (d) { return d.value; })
    .sort(null);
}

const showDonutText = el => {
  el.on("mouseover", function (d) {
    let g = d3.select(this)
      .style("cursor", "pointer")
      .style("fill", "black")
      .append("g")
      .attr("class", "text-group");

    g.append("text")
      .attr("class", "name-text")
      .text(`${d.data.name}`)
      .attr('text-anchor', 'middle')
      .attr('dy', '-1.2em');

    g.append("text")
      .attr("class", "value-text")
      .text(`${d.data.value}`)
      .attr('text-anchor', 'middle')
      .attr('dy', '.6em');
  })
}

const hideDonutText = (el, colorPalette) => {
  el.on("mouseout", function (d) {
    d3.select(this)
      .style("cursor", "none")
      .style("fill", colorPalette(this._current))
      .select(".text-group").remove();
  })
}

export default function renderDonutChart(categories) {
  const text = "";

  const width = 234;
  const height = 234;

  const thickness = 35;
  const radius = Math.min(width, height) / 2;
  const colorPalette = addColorPalette();

  const svg = addGlobalSvg(width, height)
  const arc = addArc(thickness, radius);

  // Why?
  const g = svg.append('g')
    .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

  const pie = addPieRadius();

  const path = g.selectAll('path')
    .data(pie(categories[0].materials))
    .enter()
    .append("g")

  showDonutText(path);
  hideDonutText(path, colorPalette);

  path.append('path')
    .attr('d', arc)
    .attr('fill', (d, i) => colorPalette(i))
    .on("mouseover", function (d) {
      d3.select(this)
        .style("cursor", "pointer")
        .style("fill", "black");
    })
    .on("mouseout", function (d) {
      d3.select(this)
        .style("cursor", "none")
        .style("fill", colorPalette(this._current));
    })
    .each(function (d, i) { this._current = i; });


  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '.35em')
    .text(text);
}


