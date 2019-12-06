<template>
    <div>
        <form>
            <md-autocomplete v-model="selectedDeparture" :md-options="flights" id="departure-suggestion-input">
                <label>Departure</label>
            </md-autocomplete>

            <md-autocomplete v-model="selectedArrival" :md-options="flights" md-dense id="arrival-suggestion-input">
                <label>Arrival</label>
            </md-autocomplete>
            <md-button type="submit" class="md-primary" v-on:click="handleSubmit">Submit</md-button>
            <md-button type="submit" class="md-primary" v-on:click="handleReset">Reset</md-button>
        </form>

        <div id="flights-information-container" style="display:none">

        </div>

        <div id="svgContainer"></div>
    </div>
</template>

<script>
    import * as d3 from 'd3';
    function handleSubmit(event){
        event.preventDefault();
        var ele = document.getElementById('flights-information-container');
        ele.innerText = ""
        ele.style.display='block';
        var title = document.createElement('h3');
        title.innerText = "From " + this.selectedDeparture + " to " + this.selectedArrival;
        ele.append(title);
        var table = this.constructTable(this.selectedDeparture,this.selectedArrival);
        ele.append(table);
        var flights = this.flightInfo[this.selectedDeparture + "=>" + this.selectedArrival];
        document.getElementById('svgContainer').innerText =  "";
        createBarChart(flights);

    }
    function handleReset(event){
        event.preventDefault();
        var ele = document.getElementById('flights-information-container');
        ele.style.display='none';
        this.text = "";
        var svg=document.getElementById('svgContainer');
        svg.innerText = "";

    }

    function constructTable(origin,destination){
        var root = document.createElement('table');
        var header = document.createElement('tr');
        var carrier = document.createElement('th');
        carrier.innerText = "CARRIER"
        var delay = document.createElement('th');
        delay.innerText = 'DELAY';
        header.append(carrier);
        header.append(delay);
        root.append(header);
        var flights = this.flightInfo[origin + "=>" + destination];
        flights.sort(function(x, y) {
            return x.delay - y.delay;
        });
        for (let flight of flights){
            var ele = document.createElement('tr');
            var child1 = document.createElement('td');
            var child2 = document.createElement('td');
            child1.innerText = flight.carrier;
            child2.innerText = flight.delay;
            ele.append(child1);
            ele.append(child2);
            root.append(ele);
        }
        return root;
    }

    function createBarChart(flights){
        var container = d3.select('#svgContainer');
        container.append('h3');
        container.select('h3').innerText = "Barchart of The Recommendations";

        var margin = {top: 20, right: 30, bottom: 40, left: 30},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
        var padding = 0.05;

        var barwidth = (height - (flights.length) * (padding * height)) / flights.length;

        var xRange = [-40,40];
        var x = d3.scaleLinear()
            .domain(xRange)
            .range([0, width]);

        var carrier =[];
        for (let flight of flights){
            carrier.push(flight.carrier);
        }

        var y = d3.scaleBand()
            .range([0, height]).domain(carrier).paddingInner(padding);


        var xAxis = d3.axisBottom()
            .scale(x);

        var yAxis = d3.axisLeft()
            .scale(y);
            // .tickSize(0)
            // .tickPadding(6);

        var svg = d3.select("#svgContainer").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        // debugger;
        x.domain(xRange);
        svg.selectAll(".bar")
            .data(flights)
            .enter().append("rect")
            .attr("class", function(d) { return "bar bar--" + (d.delay< 0 ? "negative" : "positive"); })
            .attr("x", function(d) {
                if (d.delay < 0){
                    return x(d.delay);
                }
                else{
                    return x(0);
                }
            })
            .attr("y", function(d) { return y(d.carrier) + padding * height / 2; })
            .attr("width", function(d) {
                var width =  Math.abs(x(d.delay) - x(0));
                return width;
            })
            .attr("height", barwidth);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + x(0) + ",0)")
            .call(yAxis);

        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", height + margin.top + 10)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("text-decoration", "underline")
            .text("Ahead(-), Delay(+)");
    }


    function fetchData(response) {
        var locations = new Set();
        for(let datum of response){
            if (datum.carrier === 'all'){
                continue;
            }
            locations.add(datum.origin);
            locations.add(datum.destination);
            let key = datum.origin + "=>" +datum.destination;
            if (this.flightInfo[key] === undefined){
                this.flightInfo[key] = new Array();
            }
            this.flightInfo[key].push({carrier: datum.carrier, delay: parseFloat(datum.delay)});
        }
        for (let loc of locations){
            this.flights.push(loc);
        }
        this.flights.sort();
    }


    export default {
        name: 'AutocompleteStatic',
        methods: {
            handleSubmit,handleReset,fetchData,constructTable,createBarChart

        },
        data: () => ({
            selectedDeparture: 'LAS',
            selectedArrival: 'LAX',
            flights:[],
            flightInfo:{}
        }),
        mounted(){
            d3.csv('data/flights-aggregation.csv').then((response) => {
                this.fetchData(response)
                var ele = document.getElementById('flights-information-container');
                ele.innerText = ""
                ele.style.display='block';
                var title = document.createElement('h3');
                title.innerText = "From " + this.selectedDeparture + " to " + this.selectedArrival;
                ele.append(title);
                var table = this.constructTable(this.selectedDeparture,this.selectedArrival);
                ele.append(table);
                var flights = this.flightInfo[this.selectedDeparture + "=>" + this.selectedArrival];
                document.getElementById('svgContainer').innerText =  "";
                createBarChart(flights);
            });

        }
    }
</script>

<style>
    th, td {
        border: 1px solid black;
    }

    table {
        font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
    }

    table td, table th {
        border: 1px solid #ddd;
        padding: 8px;
    }

    table tr:nth-child(even){background-color: #f2f2f2;}

    table tr:hover {background-color: #ddd;}

    table th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #4CAF50;
        color: white;
    }

    #svgContainer{
        margin-top: 100px;
    }
    #suggestion-bar-chart{
        margin: auto;
        margin-top: 50px;
    }

    .bar--positive {
        fill: steelblue;
    }

    .bar--negative {
        fill: darkorange;
    }

    .axis text {
        font: 10px sans-serif;
    }

    .axis path,
    .axis line {
        fill: none;
        stroke: #000;
        shape-rendering: crispEdges;
    }
</style>