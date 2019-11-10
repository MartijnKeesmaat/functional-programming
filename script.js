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
  'https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-20/sparql',
  queryMainCategories,
  '',
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
      'https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-20/sparql',
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

function doSomething(categories) {
  console.log(categories);
  const w = 800;
  const h = 500;
  const padding = 60;

  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(categories, d => d.value)])
    .range([padding, w - padding]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(categories, d => d.value)])
    .range([h - padding, padding]);

  const svg = d3
    .select('body')
    .append('svg')
    .attr('width', w)
    .attr('height', h);

  svg
    .selectAll('rect')
    .data(categories)
    .enter()
    .append('rect')
    .attr('x', (d, i) => i * 30)
    .attr('y', (d, i) => h - yScale(d.value))
    .attr('width', 25)
    .attr('height', d => yScale(d.value))
    .attr('fill', 'pink')
    .attr('class', 'bar');

  svg
    .selectAll('text')
    .data(categories)
    .enter()
    .append('text')
    .text(d => d.value)
    .attr('x', (d, i) => i * 25)
    .attr('y', d => h);
  // .attr('transform', d => `rotate(-90) translate(-${h})`);
}
