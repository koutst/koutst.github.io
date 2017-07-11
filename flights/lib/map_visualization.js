
(function(){
  var margin = { top: 400, left: 100, right: 0, down: 0},
    height = 1000 - margin.top - margin.down,
    width = 2000 - margin.left - margin.right;

  var svg = d3.select("#map")
    .append("svg")
    .attr("height", height + margin.top + margin.down)
    .attr("width", width + margin.left + margin.right)
    .append("g")
    .attr("transform", "translate("+ 0 + "," + margin.top +")");

    d3.queue()
      .defer(d3.json, "countries.topojson")
      .defer(d3.json, "airports.topojson")
      .defer(d3.csv, "flights.csv")
      .await(ready);

    var projection = d3.geoMercator()
      .translate([ width / 2, height / 2 ])
      .scale(250);

    var path = d3.geoPath()
      .projection(projection);


    function ready(error, countriesData, airportsData, flightData) {
      // console.log(flightData)
      var countriesParsed = topojson.feature(countriesData, countriesData.objects.countries).features;

      svg.selectAll(".country")
        .data(countriesParsed)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path)
        .on("mouseover", function(d){
          d3.select(this)
          .attr("class", "activeCountry")
          .attr("fill", "black");

          d3.select(this.parentNode.parentNode.parentNode.parentNode)
          .append("text")
          .attr("class", "countrydetails")
          .text(
            "Country: " + d.properties.NAME
          )
          d3.select(this.parentNode.parentNode.parentNode.parentNode)
          .append("text")
          .attr("class", "countrydetails")
          .text(
            "Continent: " + d.properties.CONTINENT
          )
          d3.select(this.parentNode.parentNode.parentNode.parentNode)
          .append("text")
          .attr("class", "countrydetails")
          .text(
            "GDP (in millions): " + d.properties.GDP_MD_EST
          )
          debugger
        })
        .on("mouseout", function(d){
          d3.selectAll("text.countrydetails").remove()
          d3.selectAll(".activeCountry")
          .attr("class", "country")
        });




      var airports = topojson.feature(airportsData, airportsData.objects.airports).features;


      var airportsNameCoord = {};

      for (var i = 0; i < airports.length; i++) {
        let iata = airports[i].properties.iata_code;
        let coord = airports[i].geometry.coordinates
        airportsNameCoord[iata] = {coord: coord}
      }

      let flights = [];
      for (var i = 0; i < flightData.length; i++) {
        orgAir = flightData[i]["ORIGIN"];
        destAir = flightData[i]["DEST"];
        depTime = flightData[i]["DEP_TIME"]
        if (airportsNameCoord[orgAir] && airportsNameCoord[destAir] && depTime) {
          flightData[i]["type"] = "Point";
          flightData[i]["coordinates"] = airportsNameCoord[orgAir]["coord"];
          flightData[i]["DESTCOORD"] = airportsNameCoord[destAir]["coord"];
          flights.push(flightData[i])
        }
      }

      function transition(rect, route) {
        rect.attr('opacity', 1)
        .transition()
        .duration(1000)
        .attrTween("transform", translateAttr(route.node()))
        .attr("d", path.pointRadius(0))
        .remove()
        ;
      }

      function translateAttr(path) {
        let l = path.getTotalLength();
        return function(i) {
          return function(t) {
            let p = path.getPointAtLength(t * l);
            return "translate(" + (p.x) + "," + (p.y) + ")";
          }
        }
      }

      let timer = 0;

      const interval = function(){
        //
        svg.selectAll(".clock").remove()
        let minutes = timer%100;
        let hours = (timer-minutes)/100;
        if (hours < 10 && minutes < 10) {
          svg.append("text")
          .attr("class", "clock")
          .text("Time (hh/mm): 0" +hours + ":0" + minutes )

        }else if (hours < 10) {
          svg.append("text")
          .attr("class", "clock")
          .text("Time (hh/mm): 0" +hours + ":" + minutes )
        } else if (minutes < 10) {
          svg.append("text")
          .attr("class", "clock")
          .text("Time (hh/mm): " +hours + ":0" + minutes )
        } else {
          svg.append("text")
          .attr("class", "clock")
          .text("Time (hh/mm): " +hours + ":" + minutes )
        }
        svg.selectAll(".clock")
        .attr("height", 0)
        .attr("width", 10)
        for (var i = 0; i < flights.length-1; i++) {

          if (parseInt(flights[i].DEP_TIME) === timer) {
            transition(svg
            .data([flights[i]])
            .append("path")
            .attr("class", "rect")
            .attr("fill", "red")
            .attr("d", path)
            .attr("stroke-width", 0.5), svg
            .data([{type: "LineString", coordinates: [flights[i].coordinates, flights[i].DESTCOORD]}])
            .append("path")
            .attr("class", "route")
            .attr("d", path)
            .attr('opacity', 0.5)
            .attr('fill', "none")
            .attr('stroke-width', 0.01)
            .attr('stroke', '	#00FF00')
            .transition()
            .duration(1000)
            .remove());
          }

        }
        timer += 1
        if (timer%100 >= 60) {
          timer += 100 - timer%100
        }
        if (timer >= 2400) {
          timer = 0;
        }
      }

      let time = setInterval(
        interval, 1000)

      svg.selectAll(".airport")
      .data(airports)
      .enter()
      .append("path")
      .attr("class", "airport")
      .attr("d", path.pointRadius(1.5))
      // .attr("scale", 100)
      .on("mouseover", function(d){
        //
        d3.select(this)
        .attr("class", "activeAirport")
        .attr("stroke", "blue")
        .attr("stroke-width", 0.5)
        .attr("fill", "red")
        .attr("d", path.pointRadius(5));

        d3.select(this.parentNode.parentNode.parentNode.parentNode)
        .append("text")
        .attr("class", "countrydetails")
        .text(
          "Airport: " + d.properties.name
        )
        d3.select(this.parentNode.parentNode.parentNode.parentNode)
        .append("text")
        .attr("class", "countrydetails")
        .text(
          "IATA: " + d.properties.iata_code
        )
        //
      })
      .on("mouseout", function(d){
        d3.selectAll("text.countrydetails").remove()

        d3.selectAll(".activeAirport")
        .attr("class", "airport")
        .attr("d", path.pointRadius(1.5));

      });


      d3.select(svg.node().parentNode.parentNode.parentNode)
      .append("input")
      .attr("type","button")
      .attr("class","pause")
      .attr("value","Pause")
      .on("click", function(){
        //
          clearInterval(time)
      })

      d3.select(svg.node().parentNode.parentNode.parentNode)
      .append("input")
      .attr("type","button")
      .attr("class","play")
      .attr("value","Play")
      .on("click", function(){
        time = setInterval(interval, 1000)
      })


    }
})();
