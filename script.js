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
  if (categoryCounter >= nCategories) doSomething(categories);
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

function doSomething(categories) {
  const categoriesV1 = categories.slice(0, 5);
  console.log(categoriesV1);

  const w = 600;
  const h = 280;
  const padding = 60;

  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(categoriesV1, d => d.value)])
    .range([padding, w - padding]);

  const blabla = d3.scaleBand().rangeRound([0, w])


  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(categoriesV1, d => d.value)])
    .range([h - padding, padding]);

  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  svg
    .selectAll("rect")
    .data(categoriesV1)
    .enter()
    .append("rect")
    .attr("x", (d, i) => 0)
    .attr("y", (d, i) => i * 50)
    .attr("width", d => xScale(d.value))
    .attr("height", 15)
    .attr("class", "bar")
    .attr("rx", 15 / 2) //height / 2

  var x = d3.scaleBand()
    .range([0, w])
    .paddingInner(.1)
    .paddingOuter(.3)

  svg
    .selectAll("text")
    .data(categoriesV1)
    .enter()
    .append("text")
    .text(d => d.name)
    .attr("x", (d, i) => 0)
    .attr("y", (d, i) => (i * 50) + 14)
    .attr("class", "label")

  const xAxis = d3.axisBottom(xScale);
  svg.append("g")
    .attr("transform", "translate(0," + (h - padding) + ")")
    .attr("color", '#9AA1A9')
    .call(xAxis)
    .call(g => g.select(".domain").remove())



}
