const queryUrl =
  'https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-20/sparql';

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

(function getMainCategories() {
  fetch(
    queryUrl +
      '?query=' +
      encodeURIComponent(queryMainCategories) +
      '&format=json'
  )
    .then(res => res.json())
    .then(data => data.results.bindings)
    .then(data => {
      return data.map(i => {
        return {
          termmaster: `<${i.category.value}>`,
          name: i.categoryLabel.value,
          value: i.objCount.value
        };
      });
    })
    .then(iets => getMaterialPerCategory(iets));
})();

function getMaterialPerCategory(categoriesTermaster) {
  categoriesTermaster.forEach((item, i) => {
    const query = `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX dc: <http://purl.org/dc/elements/1.1/>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX edm: <http://www.europeana.eu/schemas/edm/>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      # tel aantallen per materiaal
      SELECT ?subcategorie ?materiaalLabel (COUNT(?cho) AS ?choCount) WHERE {
      # haal van een term in de thesaurus de subcategorieen op
      ${categoriesTermaster[i].termmaster} skos:narrower* ?subcategorie .
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

    (function runQuery() {
      fetch(queryUrl + '?query=' + encodeURIComponent(query) + '&format=json')
        .then(res => res.json())
        .then(data =>
          createArray({
            name: categoriesTermaster[i].name,
            material: data.results.bindings
          })
        );
    })();
  });
}

let dataArr = [];
const createArray = data => {
  dataArr.push(data);
  if (dataArr.length >= 19) renderDOM();
};

const renderDOM = () => {
  const list = document.querySelector('ul');
  dataArr.forEach(i => {
    const item = document.createElement('li');
    item.textContent = i.name;
    list.appendChild(item);
  });
};
