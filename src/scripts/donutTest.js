import * as d3 from "d3";

export default function doStuff(categories) {

  var svg = d3.select(".donut-chart")
    .append("svg")
    .attr('width', 900)
    .attr('height', 500)
    .append("g")

  svg.append("g")
    .attr("class", "slices");
  svg.append("g")
    .attr("class", "labels");
  svg.append("g")
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

  svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

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

  change(randomData(0));

  let counter = 0;
  d3.select(".randomize")
    .on("click", function () {
      counter++
      console.log('categorie', categories[counter].name)
      console.log('material 0', categories[counter].materials[0].value)
      console.log('material 1', categories[counter].materials[1].value)
      console.log('material 2', categories[counter].materials[2].value)
      console.log('material 3', categories[counter].materials[3].value)
      console.log('material 4', categories[counter].materials[4].value)
      change(randomData(counter));
    });

  function change(data) {

    /* ------- PIE SLICES -------*/
    var slice = svg.select(".slices").selectAll("path.slice")
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

}
