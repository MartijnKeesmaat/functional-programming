import { truncator, shadeColor } from './helpers';

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
  showCategoryText(path);
  resetDonutText(path, categories);
  path = addFillToDonut(path, arc, colorPalette);
  addArcHover(path, colorPalette);
  addDefaultText(categories);

  // d3
  //   .selectAll('text')
  //   .data(categories[1].materials)
  //   .enter()
  //   .text(d => d)


  const legend = d3
    .select('.pie')
    .append("g")
    .attr('class', 'legend');

  legend
    .selectAll("text")
    .data(categories[1].materials)
    .enter()
    .append("text")
    .text(d => d.name)
    .attr("x", (d, i) => 50)
    .attr("y", (d, i) => 50 * i)
    .attr("class", "legend-label")
}


// CREATE DONUT
const addColorPalette = () => {
  const colorArr = ['#B83B5E', '#995A3A', '#F08A5D', '#F9D769', '#6A2C70'];
  return d3.scaleOrdinal(colorArr);
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

const rotateArc = (svg, width, height) => {
  return svg.append('g')
    .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');
}

const addPieRadius = () => {
  // transform the value of each group to a radius that will be displayed on the chart.
  return d3.pie()
    .value(function (d) { return d.value; })
    .sort(null);
}

const createArcPaths = (g, pie, categories) => {
  return g.selectAll('path')
    .data(pie(categories[1].materials))
    .enter()
    .append("g")
}

function addDefaultText(categories) {
  const defaultText = d3
    .select('.pie')
    .append("g")
    .attr('class', 'default-text');

  defaultText.append("text")
    .attr("class", "donut-title")
    .text(truncator(categories[1].name, 1))
    .attr('text-anchor', 'middle')
    .attr('dy', '50%')
    .attr('dx', '50%')

  defaultText.append("text")
    .attr("class", "donut-sub-title")
    .text('Categorie')
    .attr('text-anchor', 'middle')
    .attr('dy', '60%')
    .attr('dx', '50%')
}

// INTERACTIONS
const showCategoryText = el => {
  el.on("mouseover", function (d) {
    d3.select('.donut-title').text(truncator(d.data.name, 1));
    d3.select('.donut-sub-title').text(d.data.value);
  })
}

const resetDonutText = (el, categories) => {
  el.on("mouseout", function () {
    d3.select('.donut-title').text(truncator(categories[1].name, 1));
    d3.select('.donut-sub-title').text('Categorie');
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
        .style("fill", shadeColor(colorPalette(this._current), -20));
    })

  path
    .on("mouseout", function (d) {
      d3.select(this)
        .style("cursor", "none")
        .style("fill", colorPalette(this._current));
    })
    .each(function (d, i) { this._current = i; });
}
