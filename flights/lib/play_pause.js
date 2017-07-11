
export default function interval(){
  for (var i = 0; i < flights.length-1; i++) {
    if (parseInt(flights[i].DEP_TIME) === timer) {

      svg.selectAll(".clock").remove()
      let minutes = timer%100;
      let hours = (timer-minutes)/100;
      if (hours < 10 && minutes < 10) {
        svg.append("text")
        .attr("class", "clock")
        .text("Time: 0" +hours + ":0" + minutes )
      }else if (hours < 10) {
        svg.append("text")
        .attr("class", "clock")
        .text("Time: 0" +hours + ":" + minutes )
      } else if (minutes < 10) {
        svg.append("text")
        .attr("class", "clock")
        .text("Time: " +hours + ":0" + minutes )
      } else {
        svg.append("text")
        .attr("class", "clock")
        .text("Time: " +hours + ":" + minutes )
      }


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
    clearInterval(time);
  }
}
