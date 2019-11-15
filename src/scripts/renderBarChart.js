import * as d3 from "d3";
import { wrap, capitalize } from "./helpers";

export default function renderBarChart(categories, width, height) {
  const barheight = 15;
  const barSpacing = 50;
  const labelWidth = 100;

  const svg = addGlobalSVGBarChart(width, height);
  const xScale = addXScaleBarChart(width, barSpacing, categories);
  addLabelsToBarChart(svg, categories, labelWidth, barSpacing);
  addXAxisToBarChart(svg, height, barSpacing, xScale);
  addGridlinesToBarChart(svg, width, height, xScale)
  addBarsToBarChart(xScale, svg, categories, barheight, barSpacing);
}

const addGlobalSVGBarChart = (width, height) => {
  return d3
    .select(".bar-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
}

const addBarsToBarChart = (xScale, svg, categories, barheight, barSpacing) => {
  svg
    .selectAll("rect")
    .data(categories)
    .enter()
    .append("rect")
    .attr("x", (d, i) => 100)
    .attr("y", (d, i) => i * barSpacing)
    .attr("width", d => xScale(d.value))
    .attr("height", barheight)
    .attr("class", "bar")
}

const addLabelsToBarChart = (svg, categories, labelWidth, barSpacing) => {
  svg
    .selectAll("text")
    .data(categories)
    .enter()
    .append("text")
    .text(d => capitalize(d.name))
    .attr("x", (d, i) => 0)
    .attr("y", (d, i) => (i * barSpacing) + 10)
    .attr("class", "label")
    .attr("dy", 0)
    .attr("text-anchor", "end")
    .attr("transform", "translate(90," + 0 + ")")
    .call(wrap, labelWidth);
}

const addXScaleBarChart = (width, barSpacing, categories) => {
  return d3
    .scaleLinear()
    .domain([0, d3.max(categories, d => d.value)])
    .range([barSpacing, width - barSpacing]);
}

const addXAxisToBarChart = (svg, height, barSpacing, xScale) => {
  const xAxis = d3.axisBottom(xScale).ticks(4);
  svg.append("g")
    .attr("transform", "translate(50," + (height - barSpacing) + ")")
    .attr("color", '#9AA1A9')
    .attr("class", "x-axis")
    .call(xAxis)
    .call(g => g.select(".domain").remove())
}

const addGridlinesToBarChart = (svg, width, height, xScale) => {
  const x = xScale;

  svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(50," + (height - 45) + ")")
    .attr("stroke", "#E9EBF1")
    .call(makeXGridlines(x)
      .tickSize(-height)
      .tickFormat("")
    )
}

// https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
const makeXGridlines = x => d3.axisBottom(x).ticks(4)

