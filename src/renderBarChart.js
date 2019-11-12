export default function renderBarChart(categories, width, height) {
  const padding = 50;
  const svg = addGlobalSVGBarChart(width, height);
  const xScale = addXScaleBarChart(width, padding, categories);
  addBarsToBarChart(xScale, svg, categories);
  addLabelsToBarChart(svg, categories);
  addXAxisToBarChart(svg, height, padding, xScale);
  addGridlinesToBarChart(svg, width, height)
}

const addGlobalSVGBarChart = (width, height) => {
  return d3
    .select(".bar-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
}

const addXScaleBarChart = (width, padding, categories) => {
  return d3
    .scaleLinear()
    .domain([0, d3.max(categories, d => d.value)])
    .range([padding, width - padding]);
}

const addBarsToBarChart = (xScale, svg, categories) => {
  svg
    .selectAll("rect")
    .data(categories)
    .enter()
    .append("rect")
    .attr("x", (d, i) => 100)
    .attr("y", (d, i) => i * 50)
    .attr("width", d => xScale(d.value) - 50)
    .attr("height", 15)
    .attr("class", "bar")
    .attr("rx", 15 / 2) //height / 2
}

const addLabelsToBarChart = (svg, categories) => {
  svg
    .selectAll("text")
    .data(categories)
    .enter()
    .append("text")
    .text(d => d.name)
    .attr("x", (d, i) => 0)
    .attr("y", (d, i) => (i * 50) + 10)
    .attr("class", "label")
    .attr("dy", 0)//set the dy here
    .attr("text-anchor", "end")
    .attr("transform", "translate(90," + 0 + ")")
    .call(wrap, 100);
}

const addXAxisToBarChart = (svg, height, padding, xScale, categories) => {
  const xAxis = d3.axisBottom(xScale).ticks(3);
  svg.append("g")
    .attr("transform", "translate(55," + (height - padding) + ")")
    .attr("color", '#9AA1A9')
    .call(xAxis)
    .call(g => g.select(".domain").remove())
}

const addGridlinesToBarChart = (svg, width, height) => {
  const x = d3.scaleTime().range([0, width]);

  svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(100," + height + ")")
    .call(makeXGridlines(x)
      .tickSize(-height)
      .tickFormat("")
    )
}

// https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
const makeXGridlines = x => d3.axisBottom(x).ticks(5)

// https://bl.ocks.org/guypursey/f47d8cd11a8ff24854305505dbbd8c07
function wrap(text, width) {
  text.each(function () {
    let text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy")),
      tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em")
    while (word = words.pop()) {
      line.push(word)
      tspan.text(line.join(" "))
      if (tspan.node().getComputedTextLength() > width) {
        line.pop()
        tspan.text(line.join(" "))
        line = [word]
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", `${++lineNumber * lineHeight + dy}em`).text(word)
      }
    }
  })
}