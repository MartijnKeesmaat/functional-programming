// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"helpers.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.truncator = truncator;
exports.capitalize = capitalize;
exports.wrap = wrap;
exports.shadeColor = shadeColor;

function truncator(str, words) {
  return str.split(/[, ]/).splice(0, words).join(" ");
}

function capitalize(str) {
  return str.slice(0, 1).toUpperCase() + str.substring(1);
} // https://bl.ocks.org/guypursey/f47d8cd11a8ff24854305505dbbd8c07


function wrap(text, width) {
  text.each(function () {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1,
        // ems
    y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));

      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", "".concat(++lineNumber * lineHeight + dy, "em")).text(word);
      }
    }
  });
} // https://stackoverflow.com/a/13532993


function shadeColor(color, percent) {
  var R = parseInt(color.substring(1, 3), 16);
  var G = parseInt(color.substring(3, 5), 16);
  var B = parseInt(color.substring(5, 7), 16);
  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);
  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;
  var RR = R.toString(16).length == 1 ? "0" + R.toString(16) : R.toString(16);
  var GG = G.toString(16).length == 1 ? "0" + G.toString(16) : G.toString(16);
  var BB = B.toString(16).length == 1 ? "0" + B.toString(16) : B.toString(16);
  return "#" + RR + GG + BB;
}
},{}],"renderBarChart.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = renderBarChart;

var _helpers = require("./helpers");

function renderBarChart(categories, width, height) {
  var padding = 50;
  var svg = addGlobalSVGBarChart(width, height);
  var xScale = addXScaleBarChart(width, padding, categories);
  addLabelsToBarChart(svg, categories);
  addXAxisToBarChart(svg, height, padding, xScale);
  addGridlinesToBarChart(svg, width, height, xScale);
  addBarsToBarChart(xScale, svg, categories);
}

var addGlobalSVGBarChart = function addGlobalSVGBarChart(width, height) {
  return d3.select(".bar-chart").append("svg").attr("width", width).attr("height", height);
};

var addBarsToBarChart = function addBarsToBarChart(xScale, svg, categories) {
  svg.selectAll("rect").data(categories).enter().append("rect").attr("x", function (d, i) {
    return 100;
  }).attr("y", function (d, i) {
    return i * 50;
  }).attr("width", function (d) {
    return xScale(d.value) - 50;
  }).attr("height", 15).attr("class", "bar"); // .attr("rx", 15 / 2) //height / 2
};

var addLabelsToBarChart = function addLabelsToBarChart(svg, categories) {
  svg.selectAll("text").data(categories).enter().append("text").text(function (d) {
    return (0, _helpers.capitalize)(d.name);
  }).attr("x", function (d, i) {
    return 0;
  }).attr("y", function (d, i) {
    return i * 50 + 10;
  }).attr("class", "label").attr("dy", 0) //set the dy here
  .attr("text-anchor", "end").attr("transform", "translate(90," + 0 + ")").call(_helpers.wrap, 100);
};

var addXScaleBarChart = function addXScaleBarChart(width, padding, categories) {
  return d3.scaleLinear().domain([0, d3.max(categories, function (d) {
    return d.value;
  })]).range([padding, width - padding]);
};

var addXAxisToBarChart = function addXAxisToBarChart(svg, height, padding, xScale) {
  var xAxis = d3.axisBottom(xScale).ticks(4);
  svg.append("g").attr("transform", "translate(50," + (height - padding) + ")").attr("color", '#9AA1A9').attr("class", "x-axis").call(xAxis).call(function (g) {
    return g.select(".domain").remove();
  });
};

var addGridlinesToBarChart = function addGridlinesToBarChart(svg, width, height, xScale) {
  var x = xScale;
  svg.append("g").attr("class", "grid").attr("transform", "translate(50," + (height - 45) + ")").attr("stroke", "#E9EBF1").call(makeXGridlines(x).tickSize(-height).tickFormat(""));
}; // https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218


var makeXGridlines = function makeXGridlines(x) {
  return d3.axisBottom(x).ticks(4);
};
},{"./helpers":"helpers.js"}],"renderDonutChart.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = renderDonutChart;

var _helpers = require("./helpers");

function renderDonutChart(categories, size, thickness) {
  // Setup
  var width = size,
      height = size;
  var radius = Math.min(width, height) / 2;
  var colorPalette = addColorPalette(); // Create donut

  var svg = addGlobalSvg(width + 180, height + 30);
  var arc = addArc(thickness, radius);
  var g = rotateArc(svg, width, height);
  var pie = addPieRadius();
  var path = createArcPaths(g, pie, categories);
  addLegend(categories, colorPalette); // Interactions

  showCategoryText(path);
  resetDonutText(path, categories);
  path = addFillToDonut(path, arc, colorPalette);
  addArcHover(path, colorPalette);
  addDefaultText(categories, width, height);
} // CREATE DONUT


var addColorPalette = function addColorPalette() {
  var colorArr = ['#B83B5E', '#995A3A', '#F08A5D', '#F9D769', '#6A2C70'];
  return d3.scaleOrdinal(colorArr);
};

var addGlobalSvg = function addGlobalSvg(width, height) {
  return d3.select(".donut-chart").append('svg').attr('class', 'pie').attr('width', width).attr('height', height);
};

var addArc = function addArc(thickness, radius) {
  return d3.arc().innerRadius(radius - thickness).outerRadius(radius);
};

var rotateArc = function rotateArc(svg, width, height) {
  return svg.append('g').attr('transform', 'translate(' + (width / 2 + 180) + ',' + height / 2 + ')');
};

var addPieRadius = function addPieRadius() {
  // transform the value of each group to a radius that will be displayed on the chart.
  return d3.pie().value(function (d) {
    return d.value;
  }).sort(null);
};

var createArcPaths = function createArcPaths(g, pie, categories) {
  return g.selectAll('path').data(pie(categories[1].materials)).enter().append("g");
};

function addDefaultText(categories, width, height) {
  var defaultText = d3.select('.pie').append("g").attr('class', 'default-text');
  defaultText.append("text").attr("class", "donut-title").text((0, _helpers.truncator)(categories[1].name, 1)).attr('text-anchor', 'middle').attr('dx', width / 2 + 180).attr('dy', height / 2);
  defaultText.append("text").attr("class", "donut-sub-title").text('Categorie').attr('text-anchor', 'middle').attr('dx', width / 2 + 180).attr('dy', height / 2 + 20);
}

var addLegend = function addLegend(categories, colorPalette) {
  var legend = d3.select('.pie').append("g").attr('class', 'legend');
  legend.selectAll("text").data(categories[1].materials).enter().append("text").text(function (d) {
    return (0, _helpers.capitalize)(d.name);
  }).attr("x", function (d, i) {
    return 14;
  }).attr("y", function (d, i) {
    return 140 + 50 * (i / 1.7);
  }).attr("class", "legend-label");
  legend.selectAll("circle").data(categories[1].materials).enter().append("circle").attr("r", 4).attr("cx", function (d, i) {
    return 4;
  }).attr("cy", function (d, i) {
    return 140 + 50 * (i / 1.7) - 4;
  }).attr("class", "legend-color").attr('fill', function (d, i) {
    return colorPalette(i);
  });
}; // INTERACTIONS


var showCategoryText = function showCategoryText(el) {
  el.on("mouseover", function (d) {
    d3.select('.donut-title').text((0, _helpers.truncator)(d.data.name, 1));
    d3.select('.donut-sub-title').text(d.data.value);
  });
};

var resetDonutText = function resetDonutText(el, categories) {
  el.on("mouseout", function () {
    d3.select('.donut-title').text((0, _helpers.truncator)(categories[1].name, 1));
    d3.select('.donut-sub-title').text('Categorie');
  });
};

var addFillToDonut = function addFillToDonut(path, arc, colorPalette) {
  return path.append('path').attr('d', arc).attr('fill', function (d, i) {
    return colorPalette(i);
  });
};

var addArcHover = function addArcHover(path, colorPalette) {
  path.on("mouseover", function (d) {
    d3.select(this).style("cursor", "pointer").style("fill", (0, _helpers.shadeColor)(colorPalette(this._current), -20));
  });
  path.on("mouseout", function (d) {
    d3.select(this).style("cursor", "none").style("fill", colorPalette(this._current));
  }).each(function (d, i) {
    this._current = i;
  });
};
},{"./helpers":"helpers.js"}],"index.js":[function(require,module,exports) {
"use strict";

var _renderBarChart = _interopRequireDefault(require("./renderBarChart.js"));

var _renderDonutChart = _interopRequireDefault(require("./renderDonutChart.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var categoryCounter = 0;
var nCategories = 19;
var categories = [];
var queryMainCategories = "\n  #+ summary: Get titles meestvoorkomende catogrieen\n  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n  PREFIX dc: <http://purl.org/dc/elements/1.1/>\n  PREFIX dct: <http://purl.org/dc/terms/>\n  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\n  PREFIX edm: <http://www.europeana.eu/schemas/edm/>\n  PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n  # tel aantallen per materiaal\n  SELECT ?categoryLabel ?category (COUNT(?allChos) AS ?objCount) WHERE {\n    ?cho edm:isRelatedTo <https://hdl.handle.net/20.500.11840/termmaster2802> .\n    <https://hdl.handle.net/20.500.11840/termmaster2802> skos:narrower ?category .\n    ?category skos:prefLabel ?categoryLabel .\n    ?category skos:narrower* ?allChos .\n  }\n    \n  GROUP BY ?categoryLabel ?category\n  ORDER BY DESC(?objCount)\n";

var fetchDataFromQuery = function fetchDataFromQuery(querySrc, query, outsideScope, responseFn) {
  fetch("".concat(querySrc, "?query=").concat(encodeURIComponent(query), "&format=json")).then(function (res) {
    return res.json();
  }).then(function (data) {
    return responseFn(data, outsideScope);
  });
};

var handleDataMaterialPerCategory = function handleDataMaterialPerCategory(data) {
  var categories = getCategoriesFromData(data);
  fetchMaterialPerCategoryEach(categories);
};

fetchDataFromQuery("https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-20/sparql", queryMainCategories, "", handleDataMaterialPerCategory);

var getCategoriesFromData = function getCategoriesFromData(data) {
  return data.results.bindings.map(function (i) {
    return {
      termmaster: "<".concat(i.category.value, ">"),
      name: i.categoryLabel.value,
      value: i.objCount.value
    };
  });
};

var fetchMaterialPerCategoryEach = function fetchMaterialPerCategoryEach(categoriesTermaster) {
  categoriesTermaster.forEach(function (category) {
    var queryCategories = "\n        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n        PREFIX dc: <http://purl.org/dc/elements/1.1/>\n        PREFIX dct: <http://purl.org/dc/terms/>\n        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\n        PREFIX edm: <http://www.europeana.eu/schemas/edm/>\n        PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n        # tel aantallen per materiaal\n        SELECT ?subcategorie ?materiaalLabel (COUNT(?cho) AS ?choCount) WHERE {\n        # haal van een term in de thesaurus de subcategorieen op\n        ".concat(category.termmaster, " skos:narrower* ?subcategorie .\n        # haal de objecten van deze subcategorieen en het materiaal\n        ?cho edm:isRelatedTo ?subcategorie .\n        ?cho dct:medium ?materiaal .\n        # haal het Label op van materiaal\n        ?materiaal skos:prefLabel ?materiaalLabel .\n        }\n        GROUP BY ?subcategorie ?materiaalLabel\n        ORDER BY DESC(?choCount)\n        LIMIT 5\n      ");
    fetchDataFromQuery("https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-20/sparql", queryCategories, category, handleFetchMaterialPerCategory);
  });
};

var handleFetchMaterialPerCategory = function handleFetchMaterialPerCategory(data, category) {
  categoryCounter++;
  categories.push(normalizeMaterialPerCategory(data, category));
  if (categoryCounter >= nCategories) renderCharts(categories);
};

var normalizeMaterialPerCategory = function normalizeMaterialPerCategory(data, category) {
  return {
    name: category.name,
    value: Number(category.value),
    materials: data.results.bindings.map(function (i) {
      return {
        name: i.materiaalLabel.value,
        value: Number(i.choCount.value)
      };
    })
  };
};

function renderCharts(categories) {
  var dataForFP = categories.slice(0, 5);
  (0, _renderBarChart.default)(dataForFP, 600, 300);
  (0, _renderDonutChart.default)(categories, 240, 35, 200);
}
},{"./renderBarChart.js":"renderBarChart.js","./renderDonutChart.js":"renderDonutChart.js"}],"../../../../../.config/yarn/global/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "64020" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../.config/yarn/global/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/src.e31bb0bc.js.map