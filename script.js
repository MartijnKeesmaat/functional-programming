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

(function fetchCategoriesFromSPARQL() {
  fetch(
    `https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-20/sparql?query=${encodeURIComponent(
      queryMainCategories
    )}&format=json`
  )
    .then(res => res.json())
    .then(data => getCategoriesFromData(data))
    .then(categories => fetchMaterialPerCategoryFromSPARQL(categories));
})();

const getCategoriesFromData = data => {
  return data.results.bindings.map(i => {
    return {
      termmaster: `<${i.category.value}>`,
      name: i.categoryLabel.value,
      value: i.objCount.value
    };
  });
};

function fetchMaterialPerCategoryFromSPARQL(categoriesTermaster) {
  categoriesTermaster.forEach(category => {
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
    queryMaterialPerCategory(
      'https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-20/sparql',
      query,
      category,
      cleanMaterialPerCategory
    );
  });
}

const queryMaterialPerCategory = (querySrc, query, category, responseFn) => {
  fetch(`${querySrc}?query=${encodeURIComponent(query)}&format=json`)
    .then(res => res.json())
    .then(data => responseFn(data, category));
};

function cleanMaterialPerCategory(data, category) {
  console.log(data.results.bindings);
  console.log(category);
}

// let dataArr = [];
// const createArray = data => {
//   dataArr.push(data);
//   if (dataArr.length >= 19) renderDOM();
// };

// const renderDOM = () => {
//   console.log(dataArr);

//   const list = document.querySelector('ul');
//   dataArr.forEach(i => {
//     const item = document.createElement('h3');
//     item.textContent = i.name;
//     list.appendChild(item);
//     i.material.forEach(j => {
//       const item2 = document.createElement('li');
//       item2.textContent = `${j.materiaalLabel.value}, ${j.choCount.value}`;
//       list.appendChild(item2);
//     });
//   });
// };
