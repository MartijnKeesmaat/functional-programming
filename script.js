const queryMainCategories = `
    #+ summary: Get titles meestvoorkomende catogrieen
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX edm: <http://www.europeana.eu/schemas/edm/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?category  ?categoryLabel (COUNT(?categoryLabel) AS ?objCount) WHERE {
      ?cho edm:isRelatedTo <https://hdl.handle.net/20.500.11840/termmaster2802> .
      <https://hdl.handle.net/20.500.11840/termmaster2802> skos:narrower ?category .
      ?category skos:prefLabel ?categoryLabel .
    } 

    GROUP BY ?categoryLabel ?category
    ORDER BY DESC(?objCount)
  `;

const fetchMaterialPerCategory = (
  querySrc,
  query,
  outsideScope,
  responseFn
) => {
  fetch(`${querySrc}?query=${encodeURIComponent(query)}&format=json`)
    .then(res => res.json())
    .then(data => responseFn(data, outsideScope));
};

const handleDataMaterialPerCategory = data => {
  const categories = getCategoriesFromData(data);
  fetchMaterialPerCategoryEach(categories);
};

fetchMaterialPerCategory(
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

    fetchMaterialPerCategory(
      'https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-20/sparql',
      queryCategories,
      category,
      cleanMaterialPerCategory
    );
  });
};

function cleanMaterialPerCategory(data, category) {
  const cleanData = {
    name: category.name,
    material: data.results.bindings.map(i => {
      return {
        name: i.materiaalLabel.value,
        value: Number(i.choCount.value)
      };
    })
  };
  console.log(cleanData);
}
