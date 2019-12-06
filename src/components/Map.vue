<template>
    <div id="flight-map">
        <div id="footer">
        <span>U.S. Commercial Flights</span>, 2018
        <div class="hint">
      mouseover for flights from each airport
    </div>
        </div>
        <center>
      <p>Filter By:
          <button name="all" class="btn btn-default" id="all">All</button>
          <button name="ua" class="btn btn-default" id="ua">United</button>
          <button name="aa" class="btn btn-default" id="aa">American</button>
          <button name="as" class="btn btn-default" id="as">Alaska</button>
          <button name="nk" class="btn btn-default" id="nk">Spirit</button>
          <br>
          <button name="dl" class="btn btn-default" id="dl">Delta</button>
          <button name="ha" class="btn btn-default" id="ha">Hawaiian</button>
          <button name="wn" class="btn btn-default" id="wn">Southwest</button>
          <button name="b6" class="btn btn-default" id="b6">JetBlue</button>
          <button name="f9" class="btn btn-default" id="f9">Frontier</button>     
      </p>
      </center>
        <svg width="960" height="700"></svg>
        <p>Top 10 busy airport</p>
        <svg width="800" height="700" id="chart"></svg>
    </div>
</template>

<script>

function groupBy( array , f ) {
                let groups = {};
                array.forEach( function( o ) {
                    let group = JSON.stringify( f(o) );
                    groups[group] = groups[group] || [];
                    groups[group].push( o );
                });
                return Object.keys(groups).map( function( group ) {
                    return groups[group];
                });
            }
function maxarr(arr,len){
                var max=[];
                arr.sort(function(a,b){
                    return a['Count']-b['Count']
                })
                for (var i=0;i<len;i++){
                    max.push(arr.pop())
                }
                return max.reverse()
            }
function preparedata(flights){
    var grouped_all = groupBy(flights, function(item){
                        return [item.origin];
                    });
                    var count=0.0;
                    var num=0.0;
                    var group_all=new Array()
                    var dic=new Array()
                    //console.log(grouped_all)
                    grouped_all.forEach(
                        function(e){
                            count=0
                            num=0
                            e.forEach(
                                function(m){
                                    count=count+parseInt(m['delay']);
                                    num=num+1;
                                }
                            )
                            dic=[]
                            dic['origin']=e[0]['origin']
                            dic['delay']=count/num
                            //console.log(dic)
                            group_all.push(dic)
                        }
                    )


                    

                    var N=10
                    group_all=maxarr(group_all,N)
                    return group_all;
}
function update(data) {
            data=data.sort(function(a,b){
                return a.delay-b.delay;
            })
             var svg = d3.select("#chart");
             var rects = svg.selectAll("rect")
             .data(data, function (d) { return d.origin; });
             rects.exit() //EXIT SELECTION -- here we decide to exit first
             .transition()
             .delay(1000)
             .duration(1000)
             .style("opacity", 0)
             .remove();

             var yScale = d3.scaleLinear();
                    var maxnum=0
                    var minnum=10000000
                    for (var i=0;i<data.length;i++){
                        if (data[i]['delay']>maxnum){
                            maxnum=data[i]['delay']
                        }
                        if (data[i]['delay']<minnum){
                            minnum=data[i]['delay']
                        }
                    }

                    yScale.domain([maxnum,minnum])
                        .range([100,600]);



            var colorlist=['#FF0000','#FF006B','#FF00EB','#CA00FF','#3800FF','#0000FF','#0094FF','#00FFFF','#00FFAD','#00FF00'];

             rects.enter() //ENTER
             .append("rect")
             .attr("fill", function(d) { return d.c; })
             .merge(rects) // UPDATE + ENTER
             .transition()
             .duration(3000)
             .delay(function(d, i) { return i * 100; })
             .attr("x", 0)
             .attr("y", function(d, i) { return i * 35; })
             .attr("width", function(d) { return yScale(d.delay); })
             .attr("height", 25)
             .attr("fill", function(d, i) { return colorlist[i]; });
            

            svg.selectAll("#text").remove();
            var text=svg.selectAll("text").data(data, function (d) { return d.origin; })
            text.enter().append("text")
            .merge(rects) // UPDATE + ENTER
             .transition()
             .duration(3000)
             .delay(function(d, i) { return i * 100; })
            .text(function(d){
                return d.origin;
            }).attr("x",function(d) { return yScale(d.delay)+50; })
            .attr("y", function(d, i) { return i * 35+20; })
            .attr("id","text")


             
            }
            





    import * as d3 from 'd3v4';
    import * as topojson from 'topojson';
    export default {
        name: "Map2",
        mounted(){
            var svg = d3.select("svg"),
                width = +svg.attr("width"),
                height = +svg.attr("height");

            var projection = d3.geoAlbers()
                .translate([width *0.6, height * 0.6])
                .scale(550);

            // var radius = d3.scaleSqrt()
            //     .domain([0, 100])
            //     .range([0, 14]);

            var path = d3.geoPath()
                .projection(projection)
                .pointRadius(2.5);

            var voronoi = d3.voronoi()
                .extent([[-1, -1], [width + 1, height + 1]]);

            var filter_mode = "#all";
            setFilterMode(filter_mode)

            var airports0;
            var flights0;
            var us0;

            d3.queue()
                .defer(d3.json, "data/us.json")
                .defer(d3.csv, "data/airports.csv", typeAirport)
                .defer(d3.csv, "data/flights-aggregation.csv", typeFlight)
                .await(ready);

            function ready(error, us, airports, flights) {
                if (error) throw error;
                flights0 = flights.slice();
                airports0 = airports.slice();
                us0 = us;
                // console.log(airports[2531])
                flights = flights.filter(d => d.carrier == 'all');

                var airportByIata = d3.map(airports, function(d) { return d.iata; });

                flights.forEach(function(flight) {
                    var source = airportByIata.get(flight.origin),
                        target = airportByIata.get(flight.destination);
                    source.arcs.coordinates.push([source, target]);
                    target.arcs.coordinates.push([target, source]);
                    source.delay = flight.delay;
                });
                // console.log(airports)

                

                airports = airports
                    .filter(function(d) { return d.arcs.coordinates.length; });


                svg.append("path")
                    .datum(topojson.feature(us, us.objects.land))
                    .attr("class", "land")
                    // .style('fill','#ddd')
                    .attr("d", path);

                svg.append("path")
                    .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
                    .attr("class", "state-borders")
                    // .style('fill','none')
                    // .style('stroke','#fff')
                    .attr("d", path);

                svg.append("path")
                    .datum({type: "MultiPoint", coordinates: airports})
                    .attr("class", "airport-dots")
                    .attr("d", path);

                var airport = svg.selectAll(".airport")
                    .data(airports)
                    .enter().append("g")
                    .attr("class", "airport");

                airport.append("title")
                    .text(function(d) { return d.iata + "\n" + d.arcs.coordinates.length + " flights" + "\n"+"median delay: "+d.delay +" minutes"; });

                airport.append("path")
                    .attr("class", "airport-arc")
                    // .style('fill','none')
                    .attr("d", function(d) { return path(d.arcs); })
                    .on("mouseover", function(d) { d3.select("#footer span").text(d.name); });

                airport.append("path")
                    .data(voronoi.polygons(airports.map(projection)))
                    .attr("class", "airport-cell")
                    .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; });
                
                var chart_data=preparedata(flights);
    update(chart_data);


            }

            function typeAirport(d) {
                d[0] = +d.longitude;
                d[1] = +d.latitude;
                d.arcs = {type: "MultiLineString", coordinates: []};
                d.delay = null;
                
                return d;
            }

            function typeFlight(d) {
                d.count = +d.count;
                return d;
            }

            //filter

    //console.log(airports)

    d3.select("#all")
    .on("click", function () {
    setFilterMode("#all")
        var dots = d3.selectAll('.airport-dots')

    dots
        .remove();
    var arcs = d3.selectAll('.airport-arc')
    arcs
        .remove();

        var ap = d3.selectAll('.airport')
    ap
        .remove();

        var cells = d3.selectAll('.airport-cell')
    cells
        .remove();
        

        var land = d3.selectAll('.land')
    land
        .remove();

        var boarders = d3.selectAll('.state-boarder')
    boarders
        .remove();
    var flights, airports, us;
    flights = flights0.filter(d => d.carrier == 'all');
    airports = airports0;
    us = us0;
    transitionMap(us, airports,flights);
    








    var chart_data=preparedata(flights)
    update(chart_data)


   
    });
    


    //console.log(airports)

    d3.select("#ua")
    .on("click", function () {
    setFilterMode("#ua")
        var dots = d3.selectAll('.airport-dots')

    dots
        .remove();
    var arcs = d3.selectAll('.airport-arc')
    arcs
        .remove();

        var ap = d3.selectAll('.airport')
    ap
        .remove();

        var cells = d3.selectAll('.airport-cell')
    cells
        .remove();
        

        var land = d3.selectAll('.land')
    land
        .remove();

        var boarders = d3.selectAll('.state-boarder')
    boarders
        .remove();
    var flights, airports, us;
    flights = flights0.filter(d => d.carrier == 'UA');
    airports = airports0;
    us = us0;
    airports.arcs = {type: "MultiLineString", coordinates: []};
    transitionMap(us, airports,flights);
    var chart_data=preparedata(flights)
    update(chart_data)
    });

    d3.select("#aa")
    .on("click", function () {
    setFilterMode("#aa")
        var dots = d3.selectAll('.airport-dots')

    dots
        .remove();
    var arcs = d3.selectAll('.airport-arc')
    arcs
        .remove();

        var ap = d3.selectAll('.airport')
    ap
        .remove();

        var cells = d3.selectAll('.airport-cell')
    cells
        .remove();
        

        var land = d3.selectAll('.land')
    land
        .remove();

        var boarders = d3.selectAll('.state-boarder')
    boarders
        .remove();
    var flights, airports, us;
    flights = flights0.filter(d => d.carrier == 'AA');
    airports = airports0;
    us = us0;
    transitionMap(us, airports,flights);
    var chart_data=preparedata(flights)
    update(chart_data)
    });

    d3.select("#as")
    .on("click", function () {
    setFilterMode("#as")
        var dots = d3.selectAll('.airport-dots')

    dots
        .remove();
    var arcs = d3.selectAll('.airport-arc')
    arcs
        .remove();

        var ap = d3.selectAll('.airport')
    ap
        .remove();

        var cells = d3.selectAll('.airport-cell')
    cells
        .remove();
        

        var land = d3.selectAll('.land')
    land
        .remove();

        var boarders = d3.selectAll('.state-boarder')
    boarders
        .remove();
    var flights, airports, us;
    flights = flights0.filter(d => d.carrier == 'AS');
    airports = airports0;
    us = us0;
    transitionMap(us, airports,flights);
    var chart_data=preparedata(flights)
    update(chart_data)
    });

    d3.select("#nk")
    .on("click", function () {
    setFilterMode("#nk")
        var dots = d3.selectAll('.airport-dots')

    dots
        .remove();
    var arcs = d3.selectAll('.airport-arc')
    arcs
        .remove();

        var ap = d3.selectAll('.airport')
    ap
        .remove();

        var cells = d3.selectAll('.airport-cell')
    cells
        .remove();
        

        var land = d3.selectAll('.land')
    land
        .remove();

        var boarders = d3.selectAll('.state-boarder')
    boarders
        .remove();
    var flights, airports, us;
    flights = flights0.filter(d => d.carrier == 'NK');
    airports = airports0;
    us = us0;
    transitionMap(us, airports,flights);
    var chart_data=preparedata(flights)
    update(chart_data)
    });

    d3.select("#dl")
    .on("click", function () {
    setFilterMode("#dl")
        var dots = d3.selectAll('.airport-dots')

    dots
        .remove();
    var arcs = d3.selectAll('.airport-arc')
    arcs
        .remove();

        var ap = d3.selectAll('.airport')
    ap
        .remove();

        var cells = d3.selectAll('.airport-cell')
    cells
        .remove();
        

        var land = d3.selectAll('.land')
    land
        .remove();

        var boarders = d3.selectAll('.state-boarder')
    boarders
        .remove();
    var flights, airports, us;
    flights = flights0.filter(d => d.carrier == 'DL');
    airports = airports0;
    us = us0;
    transitionMap(us, airports,flights);
    var chart_data=preparedata(flights)
    update(chart_data)
    });

    d3.select("#ha")
    .on("click", function () {
    setFilterMode("#ha")
        var dots = d3.selectAll('.airport-dots')

    dots
        .remove();
    var arcs = d3.selectAll('.airport-arc')
    arcs
        .remove();

        var ap = d3.selectAll('.airport')
    ap
        .remove();

        var cells = d3.selectAll('.airport-cell')
    cells
        .remove();
        

        var land = d3.selectAll('.land')
    land
        .remove();

        var boarders = d3.selectAll('.state-boarder')
    boarders
        .remove();
    var flights, airports, us;
    flights = flights0.filter(d => d.carrier == 'HA');
    airports = airports0;
    us = us0;
    transitionMap(us, airports,flights);
    var chart_data=preparedata(flights)
    update(chart_data)
    });

    d3.select("#wn")
    .on("click", function () {
    setFilterMode("#wn")
        var dots = d3.selectAll('.airport-dots')

    dots
        .remove();
    var arcs = d3.selectAll('.airport-arc')
    arcs
        .remove();

        var ap = d3.selectAll('.airport')
    ap
        .remove();

        var cells = d3.selectAll('.airport-cell')
    cells
        .remove();
        

        var land = d3.selectAll('.land')
    land
        .remove();

        var boarders = d3.selectAll('.state-boarder')
    boarders
        .remove();
    var flights, airports, us;
    flights = flights0.filter(d => d.carrier == 'WN');
    airports = airports0;
    us = us0;
    transitionMap(us, airports,flights);
    var chart_data=preparedata(flights)
    update(chart_data)
    });

    d3.select("#b6")
    .on("click", function () {
    setFilterMode("#b6")
    var dots = d3.selectAll('.airport-dots')

    dots
        .remove();
    var arcs = d3.selectAll('.airport-arc')
    arcs
        .remove();

        var ap = d3.selectAll('.airport')
    ap
        .remove();

        var cells = d3.selectAll('.airport-cell')
    cells
        .remove();
        

        var land = d3.selectAll('.land')
    land
        .remove();

        var boarders = d3.selectAll('.state-boarder')
    boarders
        .remove();
    var flights, airports, us;
    flights = flights0.filter(d => d.carrier == 'B6');
    airports = airports0;
    us = us0;
    transitionMap(us, airports,flights);
    var chart_data=preparedata(flights)
    update(chart_data)
    });

    d3.select("#f9")
    .on("click", function () {
    setFilterMode("#f9")
        var dots = d3.selectAll('.airport-dots')

    dots
        .remove();
    var arcs = d3.selectAll('.airport-arc')
    arcs
        .remove();

        var ap = d3.selectAll('.airport')
    ap
        .remove();

        var cells = d3.selectAll('.airport-cell')
    cells
        .remove();
        

        var land = d3.selectAll('.land')
    land
        .remove();

        var boarders = d3.selectAll('.state-boarder')
    boarders
        .remove();
    var flights, airports, us;
    flights = flights0.filter(d => d.carrier == 'F9');
    airports = airports0;
    us = us0;
    transitionMap(us, airports,flights);
    var chart_data=preparedata(flights)
    update(chart_data)
    });

    function setFilterMode(id) {
    d3.select("#all").style("background-color", "white");
    d3.select("#ua").style("background-color", "white");
    d3.select("#aa").style("background-color", "white");
    d3.select("#as").style("background-color", "white");
    d3.select("#nk").style("background-color", "white");
    d3.select("#dl").style("background-color", "white");
    d3.select("#ha").style("background-color", "white");
    d3.select("#wn").style("background-color", "white");
    d3.select("#b6").style("background-color", "white");
    d3.select("#f9").style("background-color", "white");
    d3.select(id).style("background-color", "grey");
    filter_mode = id;
}

    function transitionMap(us,airports,flights) {
        var airportByIata = d3.map(airports, function(d) { return d.iata; });
            airports.forEach(function(airport) {
                airport.arcs.coordinates = [];
            });

                flights.forEach(function(flight) {
                    var source = airportByIata.get(flight.origin),
                        target = airportByIata.get(flight.destination);
                    source.arcs.coordinates.push([source, target]);
                    target.arcs.coordinates.push([target, source]);
                    source.delay = flight.delay;
                });

                airports = airports
                    .filter(function(d) { return d.arcs.coordinates.length; });

                svg.append("path")
                    .datum(topojson.feature(us, us.objects.land))
                    .attr("class", "land")
                    .attr("d", path);

                svg.append("path")
                    .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
                    .attr("class", "state-borders")
                    .attr("d", path);

                svg.append("path")
                    .datum({type: "MultiPoint", coordinates: airports})
                    .attr("class", "airport-dots")
                    .attr("d", path);

                var airport = svg.selectAll(".airport")
                    .data(airports)
                    .enter().append("g")
                    .attr("class", "airport");
                airport.append("title")
                    .text(function(d) { return d.iata + "\n" + d.arcs.coordinates.length + " flights" + "\n"+"median delay: "+d.delay +" minutes"; });

                airport.append("path")
                    .attr("class", "airport-arc")
                    // .style('fill','none')
                    .attr("d", function(d) { return path(d.arcs); })
                    .on("mouseover", function(d) { d3.select("#footer span").text(d.name); });

                airport.append("path")
                    .data(voronoi.polygons(airports.map(projection)))
                    .attr("class", "airport-cell")
                    .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; });
        
}


        }
    }
</script>
<style>

    .land {
        fill: #ddd;
    }

    .state-borders {
        fill: none;
        stroke: #fff;
    }

    .airport-arc {
        fill: none;
    }

    .airport:hover .airport-arc {
        stroke: #f00;
    }

    .airport-cell {
        fill: none;
        stroke: #000;
        stroke-opacity: 0.1;
        pointer-events: all;
    }

</style>