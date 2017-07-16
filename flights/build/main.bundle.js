/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// document.write(require("./geo_math.js"))
// module.exports = "shite"

(function () {

  var xhr = new XMLHttpRequest();
  var url = "https://koutst:AIzaSyCEHgWuIYyTXOzKriLZZgrW8I7DBBZptr8@opensky-network.org/api/states/all";
  // xhr.open("GET", url, false);
  // xhr.send();

  fetch(url).then(function (data) {
    debugger;
    return null;
  }).catch(function (error) {
    // If there is any error you will catch them here
  });

  xmlDocument = xhr.responseXML;
  console.log(xmlDocument);

  var margin = { top: 0, left: 0, right: 0, down: 0 },
      height = 750 - margin.top - margin.down,
      width = 2000 - margin.left - margin.right;

  var zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);

  // var drag = d3.drag()
  //               .on("start", startDrag)
  //               .on("drag", dragged)
  //               .on("end", endDrag)

  var svg = d3.select("#map").append("svg").attr("height", height + margin.top + margin.down).attr("width", width + margin.left + margin.right);

  var rectSVG = svg.append("pattern").attr("class", "rect-svg").attr("height", height + margin.top + margin.down).attr("width", width + margin.left + margin.right);

  var gMap = svg.append("g").attr("class", "g-map").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  //               .call(drag)
  //
  // function startDrag(d){
  //   d3.select(this).
  // }

  var rectGMap = gMap.append("rect").attr("class", "rect-g-map").attr("height", 1250).attr("width", width + margin.left + margin.right).attr("transform", "translate(" + margin.left + "," + -400 + ")");

  var projection = d3.geoOrthographic().translate([width / 2, height / 2]).rotate([100, 350, 7]).scale(250);

  var rectZoom = svg.append("rect").data([projection]).attr("class", "rect-zoom").attr("height", height + margin.top + margin.down).attr("width", width + margin.left + margin.right).style("fill", "none").style("pointer-events", "all").call(zoom).on("mousedown.zoom", function (d) {
    // debugger
    // d.rotate([50, 0, 0])
  }).on("touchstart.zoom", null).on("touchmove.zoom", null).on("touchend.zoom", null);

  function zoomed() {
    gMap.attr("transform", d3.event.transform);
  }

  d3.queue().defer(d3.json, "countries.topojson").defer(d3.json, "airports.topojson").defer(d3.csv, "flights.csv").await(ready);

  var path = d3.geoPath().projection(projection);

  var intSpeed = 100;

  function ready(error, countriesData, airportsData, flightData) {
    // console.log(flightData)
    var countriesParsed = topojson.feature(countriesData, countriesData.objects.countries).features;

    gMap.selectAll(".country").data(countriesParsed).enter().append("path").attr("class", "country").attr("d", path).on("mouseover", function (d) {
      d3.select(this).attr("class", "activeCountry").attr("fill", "black");

      d3.select(".map").append("text").attr("class", "countrydetails").text("Country: " + d.properties.NAME);
      d3.select(".map").append("text").attr("class", "countrydetails").text("Continent: " + d.properties.CONTINENT);
      d3.select(".map").append("text").attr("class", "countrydetails").text("GDP (in millions): " + d.properties.GDP_MD_EST);
    }).on("mouseout", function (d) {
      d3.selectAll("text.countrydetails").remove();
      d3.selectAll(".activeCountry").attr("class", "country");
    });

    var airports = topojson.feature(airportsData, airportsData.objects.airports).features;

    var airportsNameCoord = {};

    for (var i = 0; i < airports.length; i++) {
      var iata = airports[i].properties.iata_code;
      var coord = airports[i].geometry.coordinates;
      airportsNameCoord[iata] = { coord: coord };
    }

    var flights = [];
    for (var i = 0; i < flightData.length; i++) {
      orgAir = flightData[i]["ORIGIN"];
      destAir = flightData[i]["DEST"];
      depTime = flightData[i]["DEP_TIME"];
      if (airportsNameCoord[orgAir] && airportsNameCoord[destAir] && depTime) {
        flightData[i]["type"] = "Point";
        flightData[i]["coordinates"] = airportsNameCoord[orgAir]["coord"];
        flightData[i]["DESTCOORD"] = airportsNameCoord[destAir]["coord"];
        flights.push(flightData[i]);
      }
    }

    function transition(plane, route) {
      var l = route.node().getTotalLength();
      plane.attr('opacity', 1).transition().duration(10 * route.node().getTotalLength()).attrTween("transform", translateAttr(route.node())).attr("d", path).remove();
    }

    function translateAttr(path) {
      var l = path.getTotalLength();
      return function (d, i, a) {
        return function (t) {
          var p = path.getPointAtLength(t * l);
          var po = path.getPointAtLength(0);
          return "translate(" + (p.x - po.x) + "," + (p.y - po.y) + ")";
        };
      };
    }

    var timer = 0;

    var interval = function interval() {
      //
      gMap.selectAll(".clock").remove();
      var minutes = timer % 100;
      var hours = (timer - minutes) / 100;
      if (hours < 10 && minutes < 10) {
        gMap.append("text").attr("class", "clock").text("Time (hh/mm): 0" + hours + ":0" + minutes);
      } else if (hours < 10) {
        gMap.append("text").attr("class", "clock").text("Time (hh/mm): 0" + hours + ":" + minutes);
      } else if (minutes < 10) {
        gMap.append("text").attr("class", "clock").text("Time (hh/mm): " + hours + ":0" + minutes);
      } else {
        gMap.append("text").attr("class", "clock").text("Time (hh/mm): " + hours + ":" + minutes);
      }
      gMap.selectAll(".clock").attr("height", 0).attr("width", 10);

      for (var i = 0; i < flights.length - 1; i++) {
        // let currFlight = {coordinates: flights[i]["coordinates"]}
        var currFlight = Object.assign({}, flights[i]);
        // delete currFlight["DESTCOORD"]
        if (parseInt(flights[i].DEP_TIME) === timer) {
          transition(gMap.datum(currFlight).append("path").attr("class", "plane").attr("fill", "red").attr("d", path).attr("stroke-width", 0.5), gMap.datum({ type: "LineString", coordinates: [flights[i].coordinates, flights[i].DESTCOORD] }).append("path").attr("class", "route").attr("d", path).attr('opacity', 0.5).attr('fill', "none").attr('stroke-width', 0.01).attr('stroke', '	#00FF00').transition().duration(1000).remove());
        }
      }
      timer += 1;
      if (timer % 100 >= 60) {
        timer += 100 - timer % 100;
      }
      if (timer >= 2400) {
        timer = 0;
      }
    };

    var time = setInterval(interval, intSpeed);

    gMap.selectAll(".airport").data(airports).enter().append("path").attr("class", "airport").attr("d", path.pointRadius(1.5))
    // .attr("scale", 100)
    .on("mouseover", function (d) {
      //
      d3.select(this).attr("class", "activeAirport").attr("stroke", "blue").attr("stroke-width", 0.5).attr("fill", "red").attr("d", path.pointRadius(5));

      d3.select(".map").append("text").attr("class", "countrydetails").text("Airport: " + d.properties.name);
      d3.select(".map").append("text").attr("class", "countrydetails").text("IATA: " + d.properties.iata_code);
      //
    })
    // .on("click", )
    .on("mouseout", function (d) {
      d3.selectAll("text.countrydetails").remove();

      d3.selectAll(".activeAirport").attr("class", "airport").attr("d", path.pointRadius(1.5));
    });

    d3.select(".map").append("input").attr("type", "button").attr("class", "pause").attr("value", "Pause").on("click", function () {
      clearInterval(time);
    });

    d3.select(".map").append("input").attr("type", "button").attr("class", "play").attr("value", "Play").on("click", function () {
      clearInterval(time);
      time = setInterval(interval, intSpeed);
    });

    var speed = d3.select(".map").append("text").attr("class", "speed").text("Speed: 1 hour = " + intSpeed / 1000 * 60 + " seconds");

    d3.select(".map").append("input").attr("type", "button").attr("class", "play").attr("value", "X2").on("click", function () {
      intSpeed = intSpeed / 2;
      d3.select(".speed").text("Speed: 1 hour = " + intSpeed / 1000 * 60 + " seconds");
      clearInterval(time);
      time = setInterval(interval, intSpeed);
    });

    d3.select(".map").append("input").attr("type", "button").attr("class", "play").attr("value", "/2").on("click", function () {
      intSpeed = intSpeed * 2;
      d3.select(".speed").text("Speed: 1 hour = " + intSpeed / 1000 * 60 + " seconds");
      clearInterval(time);
      time = setInterval(interval, intSpeed);
    });
  }
})();

/***/ })
/******/ ]);
//# sourceMappingURL=main.bundle.js.map