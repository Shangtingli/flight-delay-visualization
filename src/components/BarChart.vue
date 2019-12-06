<template>
    <div id="barchart">
        <h3>Median Delay By Airport Barchart (Top 8)</h3>
        <svg id="chart" height=600 width=1200></svg>
        <h3>Median Delay By Carrier Barchart</h3>
        <svg id='carrir' height=600 width=1200></svg>
        <h3>Delay Rate By Carrier And Day of Week Bubble Chart</h3>
        <center>
        <svg id='bubble' width="932" height="932"></svg>
        </center>
        <ul style="list-style-type:none;">
            <li>Weekends are good days to travel</li>
            <li>Avoid Mondays</li>
            <li>While, you get what you pay for</li>
        </ul>
    </div>
</template>

<script>
    import * as d3 from 'd3';
    export default {
        name: "BarChart",
        mounted(){
            function removeZeroValue(arr){
                var newArr=[];
                arr.forEach(
                    function(e){
                        if (Math.abs(e['ARR_DELAY'])>0){
                            newArr.push(e)
                        }
                    }
                );
                return newArr;
            }
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
            d3.csv('data/flights_iata.csv',function(d){
                return {
                    DEST_AIRPORT_ID:+d.DEST_AIRPORT_ID,
                    ARR_DELAY:+d.ARR_DELAY,
                    Origin:d.Description_origin,
                    Dest:d.Description_dest,
                    Carrir:d.OP_UNIQUE_CARRIER
                };
            }).then(
                function(data){

                    var dataProcessed=removeZeroValue(data);
                    // debugger;
                    var sorted = groupBy(dataProcessed, function(item){
                        return [item.DEST_AIRPORT_ID];
                    });
                    var count=0.0;
                    var num=0.0;
                    var dataGroup=new Array()
                    var dic=new Array()
                    sorted.forEach(
                        function(e){
                            count=0
                            num=0
                            e.forEach(
                                function(m){
                                    count=count+m['ARR_DELAY'];
                                    num=num+1;
                                }
                            )
                            dic=[]
                            dic['DEST_AIRPORT_ID']=e[0]['DEST_AIRPORT_ID']
                            dic['Count']=count/num
                            var list=[]
                            list=e[0]['Dest'].split(",")
                            dic['DEST_DESCRIPTION']=list
                            // debugger;
                            dataGroup.push(dic)
                        }
                    )

                    var topN=10;

                    dataGroup=maxarr(dataGroup,topN);
                    // debugger;
                    var xScale = d3.scaleBand()
                        .round(true)
                        .paddingInner(0.05);

                    // debugger;
                    xScale.domain(dataGroup.map(function (d) {
                        // debugger;
                        return d.DEST_AIRPORT_ID;
                    }))
                        .range([70, 1470]);
                    var height=500;
                    var yScale = d3.scaleLinear();
                    var maxnum=0
                    var minnum=10000000
                    for (var i=0;i<dataGroup.length;i++){
                        if (dataGroup[i]['Count']>maxnum){
                            maxnum=dataGroup[i]['Count']
                        }
                        if (dataGroup[i]['Count']<minnum){
                            minnum=dataGroup[i]['Count']
                        }
                    }

                    yScale.domain([maxnum,minnum/2])
                        .range([100,height]);






                    var yAxis = d3.axisLeft()
                        .scale(yScale);
                    d3.select("#chart").append('g')
                        .attr('class', 'y axis')
                        .attr('transform', 'translate(70,' +0  + ')')
                        .call(yAxis);
                   
                   d3.select("#chart").append('g').call(
                        d3.axisBottom(xScale).tickValues([])
                    ).attr('transform', 'translate(0,500)')


                    d3.select("#chart").append("text").text("City Name").attr("x",600).attr("y",530)

                    d3.select("#chart")
                        .selectAll("div")
                        .data(dataGroup)
                        .enter()
                        .append('rect')
                        .attr('class','rect')
                        .attr('x',function(d){return xScale(d.DEST_AIRPORT_ID)+300/(1.5*topN)})
                        .attr('y',function(d){return yScale(d.Count)})
                        .attr('height',function(d){return height-yScale(d.Count)})
                        .attr('width',1400/(1.5*topN))
                        .style("fill","lightpink");


                    d3.select("#chart").selectAll('div')
                        .data(dataGroup, function (d) {
                            return d.DEST_AIRPORT_ID;
                        })
                        .enter()
                        .append('text')
                        .text(function (d) {
                            return d.DEST_DESCRIPTION[0];
                        })
                        .attr('class', 'ac')
                        .attr('x', function (d) {
                            return xScale(d.DEST_AIRPORT_ID)+1000/(1.5*topN)-d.DEST_DESCRIPTION[0].length/2-30;
                        })
                        .attr('y',  function(d){return yScale(d.Count)-20}
                        )
                        .attr('opacity','0')

                    var sorted_carrir = groupBy(dataProcessed, function(item){
                        return [item.Carrir];
                     });
                    //var count=0.0;
                    //var num=0.0;
                    var dataGroup_carrir=new Array()
                    dic=[]
                    //var dic=new Array()
                    sorted_carrir.forEach(
                        function(e){
                            count=0
                            num=0
                            e.forEach(
                                function(m){
                                    count=count+m['ARR_DELAY'];
                                    num=num+1;
                                }
                            )
                            dic=[]
                            dic['Carrir']=e[0]['Carrir']
                            dic['Count']=count/num
                            dataGroup_carrir.push(dic)
                        }
                    )



                    var xScale_carrir = d3.scaleBand()
                        .round(true)
                        .paddingInner(0.05);

                    xScale_carrir.domain(dataGroup_carrir.map(function (d) {
                        return d.Carrir;
                    }))
                        .range([70, 1470]);
                    height=500;
                    var yScale_carrir = d3.scaleLinear();
                    maxnum=0
                    minnum=10000000
                    for (i=0;i<dataGroup_carrir.length;i++){
                        if (dataGroup_carrir[i]['Count']>maxnum){
                            maxnum=dataGroup_carrir[i]['Count']
                        }
                        if (dataGroup_carrir[i]['Count']<minnum){
                            minnum=dataGroup_carrir[i]['Count']
                        }
                    }

                    yScale_carrir.domain([maxnum,minnum])
                        .range([200,height]);






                    var yAxis_carrir = d3.axisLeft()
                        .scale(yScale_carrir);
                    d3.select("#carrir").append('g')
                        .attr('class', 'y axis')
                        .attr('transform', 'translate(70,' +0  + ')')
                        .call(yAxis_carrir);


                    var xAxis_carrir = d3.axisBottom()
                        .scale(xScale_carrir);

                    d3.select("#carrir").append('g')
                        .attr('class', 'x axis')
                        .attr('transform', 'translate(0,' +height  + ')')
                        .call(xAxis_carrir.tickSize(0));

                    d3.select("#carrir")
                        .selectAll("div")
                        .data(dataGroup_carrir)
                        .enter()
                        .append('rect')
                        .attr('class','rect')
                        .attr('x',function(d){return xScale_carrir(d.Carrir)+10})
                        .attr('y',function(d){return yScale_carrir(d.Count)})
                        .attr('height',function(d){return height-yScale_carrir(d.Count)})
                        .attr('width',80)
                        .style("fill","lightblue");
                }
            )

            d3.json("data/bubble.json") 
    .then(function (data) { 
        //insert chart code here ...
        var color, width, height, pack;

        color = d3.scaleLinear()
    .domain([0, 3])
    .range(["hsl(332,80%,85%)", "hsl(326,67%,14%)"])
    .interpolate(d3.interpolateHcl)

    //format = d3.format(",d")

    width = 932

    height = width

    pack = data => d3.pack()
    .size([width, height])
    .padding(3)(d3.hierarchy(data).sum(d => d.value)
    .sort((a, b) => b.value - a.value))

    const root = pack(data);
  let focus = root;
  let view;

  const svg = d3.select('#bubble')
      .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
      .style("display", "block")
      .style("margin", "0 -14px")
      .style("background", color(0))
      .style("cursor", "pointer")
      .on("click", () => zoom(root));

  const node = svg.append("g")
    .selectAll("circle")
    .data(root.descendants().slice(1))
    .join("circle")
      .attr("fill", d => d.children ? color(d.depth) : "white")
      .attr("pointer-events", d => !d.children ? "none" : null)
      .on("mouseover", function() { d3.select(this).attr("stroke", "#000"); })
      .on("mouseout", function() { d3.select(this).attr("stroke", null); })
      .on("click", d => focus !== d && (zoom(d), d3.event.stopPropagation()));

  const label = svg.append("g")
      .style("font", "10px sans-serif")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
    .selectAll("text")
    .data(root.descendants())
    .join("text")
      .style("fill-opacity", d => d.parent === root ? 1 : 0)
      .style("display", d => d.parent === root ? "inline" : "none")
      .text(d => d.data.name);

  zoomTo([root.x, root.y, root.r * 2]);

  function zoomTo(v) {
    const k = width / v[2];

    view = v;

    label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr("r", d => d.r * k);
  }

  function zoom(d) {
    //const focus0 = focus;

    focus = d;

    const transition = svg.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", _d => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return t => zoomTo(i(t));
        });

    label
      .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
      .transition(transition)
        .style("fill-opacity", d => d.parent === focus ? 1 : 0)
        .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
  }
});




        }
    }
</script>

<style>
    .ac:hover{
        opacity:1;
    }
</style>