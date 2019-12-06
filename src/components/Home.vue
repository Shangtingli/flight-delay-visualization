<template>
<div>
<div class="container">
<img width = 1600 class="sky" src="assets/sky.gif"/>
<div id="axis1" class="one" width=700>
    <img width=100 class="object van move-right" src="assets/plane1.png"/>
</div>

<div id="axis2" class="one">
    <img width=100 class="object van2 move-right" src="assets/plane2.png"/>
</div>

<div id="axis3" class="one">
    <img width=100 class="object van3 move-right" src="assets/plane3.png"/>
</div>
<center>
<div class="title"><b>US FLIGHT DELAY VISUALIZATION</b></div>
<div class="mission">Fast, Safe and On Time</div>

<div class="desc">Explore our app and optimize your next journey with no delays!</div>
</center>
</div>
</div>
</template>


<style>
.container {
  position: relative;
  text-align: center;
  color: white;
}
.sky{
opacity: 0.75;
  filter: alpha(opacity=75); /* For IE8 and earlier */
}
    .object {
    position: absolute;
}
.van {
    top: 45%;
    left: 15%;
}

.van2 {
    top: 60%;
    left: 15%;
}

.van3 {
    top: 75%;
    left: 15%;
}

#axis1:hover .move-right{
    transform: translate(850px,-100px);
    -webkit-transform: translate(850px,-100px); /** Chrome & Safari **/
    -o-transform: translate(850px,-100px); /** Opera **/
    -moz-transform: translate(850px,-100px); /** Firefox **/
}
#axis2:hover .move-right{
    transform: translate(850px,-100px);
    -webkit-transform: translate(850px,-100px); /** Chrome & Safari **/
    -o-transform: translate(850px,-100px); /** Opera **/
    -moz-transform: translate(850px,-100px); /** Firefox **/
}
#axis3:hover .move-right{
    transform: translate(850px,-100px);
    -webkit-transform: translate(850px,-100px); /** Chrome & Safari **/
    -o-transform: translate(850px,-100px); /** Opera **/
    -moz-transform: translate(850px,-100px); /** Firefox **/
}

.object {
    position: absolute;
    transition: all 2s ease-in-out;
    -webkit-transition: all 2s ease-in-out; /** Chrome & Safari **/
    -moz-transition: all 2s ease-in-out; /** Firefox **/
    -o-transition: all 2s ease-in-out; /** Opera **/
}

.title {
  position: absolute;
  top: 15%;
  left: 50%;
  font-size: 40px;
  color: black;
  transform: translate(-50%, -50%);
  font-family: Chalkduster, fantasy;
  line-height: 1;
}
.desc {
  position: absolute;
  top: 35%;
  left: 50%;
  font-size: 25px;
  color:black;
  transform: translate(-50%, -50%);
  font-family: Chalkduster, fantasy;
  line-height: 1;
}
.mission {
  position: absolute;
  bottom: 2%;
  left: 50%;
  font-size: 20px;
  color:white;
  transform: translate(-50%, -50%);
  font-family: Chalkduster, fantasy;
}
</style>