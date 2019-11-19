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
  donuts(categories, 0)
}

function donuts(categories, counter) {

  var donutContainer = d3.select(".donut-chart")
    .append("svg")
    .attr('width', 900)
    .attr('height', 500)
    .append("g")

  donutContainer.append("g")
    .attr("class", "slices");
  donutContainer.append("g")
    .attr("class", "labels");
  donutContainer.append("g")
    .attr("class", "lines");

  var width = 960,
    height = 450,
    radius = Math.min(width, height) / 2;

  var pie = d3.pie()
    .sort(null)
    .value(function (d) {
      return d.value;
    });

  var arc = d3.arc()
    .outerRadius(radius * 0.8)
    .innerRadius(radius * 0.4);

  var outerArc = d3.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

  donutContainer.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var key = function (d) { return d.data.label; };

  var color = d3.scaleOrdinal()
    .domain(["Lorem ipsum", "dolor sit", "amet", "consectetur", "adipisicing"])
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  function randomData(index) {
    var labels = color.domain();
    return labels.map(function (label, i) {
      return {
        label: label,
        value: categories[index].materials[i].value
      }
    });
  }


  console.log(donutContainer)
  change(randomData(0), donutContainer, pie, key, color, arc);
  change(randomData(0), donutContainer, pie, key, color, arc);

  setTimeout(() => {
    change(randomData(1), donutContainer, pie, key, color, arc);
  }, 1000)




  // let counter = 0;
  // d3.select(".randomize")
  //   .on("click", function () {
  //     // counter++
  //     console.log('categorie', categories[counter].name)
  //     console.log('material 0', categories[counter].materials[0].value)
  //     console.log('material 1', categories[counter].materials[1].value)
  //     console.log('material 2', categories[counter].materials[2].value)
  //     console.log('material 3', categories[counter].materials[3].value)
  //     console.log('material 4', categories[counter].materials[4].value)
  //     change(randomData(counter, donutContainer));
  //   });

}




function change(data, donutContainer, pie, key, color, arc) {
  // console.log('here', donutContainer)
  /* ------- PIE SLICES -------*/
  var slice = donutContainer.select(".slices").selectAll("path.slice")
    .data(pie(data), key);

  slice.enter()
    .insert("path")
    .style("fill", function (d) { return color(d.data.label); })
    .attr("class", "slice");

  slice
    .transition().duration(1000)
    .attrTween("d", function (d) {
      this._current = this._current || d;
      var interpolate = d3.interpolate(this._current, d);
      this._current = interpolate(0);
      return function (t) {
        return arc(interpolate(t));
      };
    })

  slice.exit()
    .remove();
};


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
    .on('click', function (d, i) {
      console.log('You clicked on bar ' + i)
    });
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

