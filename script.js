// Specify which data is retrieved
const queryUrl =
  'https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-20/sparql';

const categoriesTermaster = [
  {
    name: 'popular culture',
    termmaster: '<https://hdl.handle.net/20.500.11840/termmaster10045782>'
  }
];

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
  ${categoriesTermaster[0].termmaster} skos:narrower* ?subcategorie .
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

const runQuery = (queryUrl, query) => {
  fetch(queryUrl + '?query=' + encodeURIComponent(query) + '&format=json')
    .then(res => res.json())
    .then(data =>
      handleData({
        name: categoriesTermaster[0].name,
        material: data.results.bindings
      })
    );
};

runQuery(queryUrl, query);

function handleData(data) {
  console.log(data);
}
