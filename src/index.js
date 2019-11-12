import renderBarChart from './renderBarChart.js'

let categoryCounter = 0;
const nCategories = 19;
const categories = [];

const queryMainCategories = `
  #+ summary: Get titles meestvoorkomende catogrieen
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX dc: <http://purl.org/dc/elements/1.1/>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX edm: <http://www.europeana.eu/schemas/edm/>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  # tel aantallen per materiaal
  SELECT ?categoryLabel ?category (COUNT(?allChos) AS ?objCount) WHERE {
    ?cho edm:isRelatedTo <https://hdl.handle.net/20.500.11840/termmaster2802> .
    <https://hdl.handle.net/20.500.11840/termmaster2802> skos:narrower ?category .
    ?category skos:prefLabel ?categoryLabel .
    ?category skos:narrower* ?allChos .
  }
    
  GROUP BY ?categoryLabel ?category
  ORDER BY DESC(?objCount)
`;

const fetchDataFromQuery = (querySrc, query, outsideScope, responseFn) => {
  fetch(`${querySrc}?query=${encodeURIComponent(query)}&format=json`)
    .then(res => res.json())
    .then(data => responseFn(data, outsideScope));
};

const handleDataMaterialPerCategory = data => {
  const categories = getCategoriesFromData(data);
  fetchMaterialPerCategoryEach(categories);
};

fetchDataFromQuery(
  "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-20/sparql",
  queryMainCategories,
  "",
  handleDataMaterialPerCategory
);

const getCategoriesFromData = data => {
  return data.results.bindings.map(i => {
    return {
      termmaster: `<${i.category.value}>`,
      name: i.categoryLabel.value,
      value: i.objCount.value
    };
  });
};

const fetchMaterialPerCategoryEach = categoriesTermaster => {
  categoriesTermaster.forEach(category => {
    const queryCategories = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX dc: <http://purl.org/dc/elements/1.1/>
        PREFIX dct: <http://purl.org/dc/terms/>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX edm: <http://www.europeana.eu/schemas/edm/>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        # tel aantallen per materiaal
        SELECT ?subcategorie ?materiaalLabel (COUNT(?cho) AS ?choCount) WHERE {
        # haal van een term in de thesaurus de subcategorieen op
        ${category.termmaster} skos:narrower* ?subcategorie .
        # haal de objecten van deze subcategorieen en het materiaal
        ?cho edm:isRelatedTo ?subcategorie .
        ?cho dct:medium ?materiaal .
        # haal het Label op van materiaal
        ?materiaal skos:prefLabel ?materiaalLabel .
        }
        GROUP BY ?subcategorie ?materiaalLabel
        ORDER BY DESC(?choCount)
        LIMIT 5
      `;

    fetchDataFromQuery(
      "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-20/sparql",
      queryCategories,
      category,
      handleFetchMaterialPerCategory
    );
  });
};

const handleFetchMaterialPerCategory = (data, category) => {
  categoryCounter++;
  categories.push(normalizeMaterialPerCategory(data, category));
  if (categoryCounter >= nCategories) renderCharts(categories);
};

const normalizeMaterialPerCategory = (data, category) => {
  return {
    name: category.name,
    value: Number(category.value),
    materials: data.results.bindings.map(i => {
      return {
        name: i.materiaalLabel.value,
        value: Number(i.choCount.value)
      };
    })
  };
};

const colors = {
  grey: "#EDF0F4",
  purple: "#6A2C70"
};

function renderCharts(categories) {
  const dataForFP = categories.slice(0, 5);
  renderBarChart(dataForFP, 600, 300);
  renderDonutChart(categories);
}





function renderDonutChart(categories) {
  const text = "";

  const width = 234;
  const height = 234;
  const thickness = 35;

  const radius = Math.min(width, height) / 2;
  const colorArr = ['#B83B5E', '#995A3A', '#F08A5D', '#F9D769', '#6A2C70'];
  const color = d3.scaleOrdinal(colorArr);

  const svg = d3.select(".donut-chart")
    .append('svg')
    .attr('class', 'pie')
    .attr('width', width)
    .attr('height', height);

  const g = svg.append('g')
    .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

  const arc = d3.arc()
    .innerRadius(radius - thickness)
    .outerRadius(radius);

  const pie = d3.pie()
    .value(function (d) { return d.value; })
    .sort(null);

  const path = g.selectAll('path')
    .data(pie(categories[0].materials))
    .enter()
    .append("g")
    .on("mouseover", function (d) {
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
    .on("mouseout", function (d) {
      d3.select(this)
        .style("cursor", "none")
        .style("fill", color(this._current))
        .select(".text-group").remove();
    })
    .append('path')
    .attr('d', arc)
    .attr('fill', (d, i) => color(i))
    .on("mouseover", function (d) {
      d3.select(this)
        .style("cursor", "pointer")
        .style("fill", "black");
    })
    .on("mouseout", function (d) {
      d3.select(this)
        .style("cursor", "none")
        .style("fill", color(this._current));
    })
    .each(function (d, i) { this._current = i; });


  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '.35em')
    .text(text);
}


