export default function renderDonutChart(categories, size, thickness) {
  // Setup
  const width = size, height = size;
  const radius = Math.min(width, height) / 2;
  const colorPalette = addColorPalette();

  // Create donut
  const svg = addGlobalSvg(width, height)
  const arc = addArc(thickness, radius);
  const g = rotateArc(svg, width, height);
  const pie = addPieRadius();
  let path = createArcPaths(g, pie, categories);

  // Interactions
  showDonutText(path);
  hideDonutText(path, colorPalette);
  path = addFillToDonut(path, arc, colorPalette);
  addArcHover(path, colorPalette);

  // addDefaultText(g, 'ab');
}

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
      .append("g")
      .attr("class", "text-group");

    g.append("text")
      .attr("class", "donut-title")
      .text(truncator(d.data.name, 1))
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em');

    g.append("text")
      .attr("class", "donut-sub-title")
      .text(d.data.value)
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em');
  })
}

const hideDonutText = (el, colorPalette) => {
  el.on("mouseout", function (d) {
    d3.select(this)
      .style("cursor", "none")
      .select(".text-group").remove();
  })
}

const addFillToDonut = (path, arc, colorPalette) => {
  return path.append('path')
    .attr('d', arc)
    .attr('fill', (d, i) => colorPalette(i))
}

const addArcHover = (path, colorPalette) => {
  path
    .on("mouseover", function (d) {
      d3.select(this)
        .style("cursor", "pointer")
        .style("fill", "black");
    })

  path
    .on("mouseout", function (d) {
      d3.select(this)
        .style("cursor", "none")
        .style("fill", colorPalette(this._current));
    })
    .each(function (d, i) { this._current = i; });
}

const createArcPaths = (g, pie, categories) => {
  return g.selectAll('path')
    .data(pie(categories[0].materials))
    .enter()
    .append("g")
}

const rotateArc = (svg, width, height) => {
  return svg.append('g')
    .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');
}

const addDefaultText = (g, text) => {
  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '.35em')
    .attr('class', 'donut-title')
    .text(text);
}

const truncator = (str, words) =>
  str
    .split(" ")
    .splice(0, words)
    .join(" ");


