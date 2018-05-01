var map = L.map('map', {
  center: [39.983947, -75.058916],
  zoom: 11
});

var Stamen_TonerLite = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 17,
  ext: 'png'
}).addTo(map);

var walkable = 'https://raw.githubusercontent.com/huilingh/OST4GIS-week12/master/Final/geojson/dissolved_walkability.geojson'

var cartoUserName = 'huilingh';
var grocery = "SELECT * FROM grocery"
var cafe = "SELECT * FROM sidewalk_cafe"
var corners = "SELECT * FROM foodpre_serv WHERE licensetyp = 'Food Preparing and Serving'"
var cornerslg = "SELECT * FROM foodpre_serv WHERE licensetyp = 'Food Preparing and Serving (50+ SEATS)'"
var format = "GeoJSON";
var walkmap;

var marker1 = {
    radius: 5,
    fillColor: "#548d31",
    color: "#ffffff",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

var marker2 = {
    radius: 5,
    fillColor: "#4263a6",
    color: "#ffffff",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

var marker4 = {
    radius: 5,
    fillColor: "#e6ab37",
    color: "#ffffff",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

var walkStyle = function(feature) {
  switch (feature.properties.ACCESS_) {
           case 'No Access': return {color: "#F0C27B", weight: 2, opacity: 0.2, fillOpacity: 0.6};
           case 'Low Access':   return {color: "#ac7966", weight: 2, opacity: 0.2, fillOpacity: 0.6};
           case 'Moderate Access': return {color: "#7d4757", weight: 2, opacity: 0.2, fillOpacity: 0.6};
           case 'High Access': return {color: "#4B1248", weight: 2, opacity: 0.2, fillOpacity: 0.6};
       }
};

$.ajax(walkable).then(function(data){
  parsedWalk = JSON.parse(data);
  walkmap = L.geoJson(parsedWalk, {
    style: walkStyle,
  }).addTo(map);
})

$('#foodmap').click(function(){
  $('#foodmapInfo').show();
  $('#providerIntro').hide();
  $('#providerCheck').hide();

  if (walkmap) { map.removeLayer(walkmap); }
  if (option1||option2||option4) {
    map.removeLayer(option1);
    map.removeLayer(option2);
    map.removeLayer(option4);
  }
  $.ajax(walkable).then(function(data){
    parsedWalk = JSON.parse(data);
    walkmap = L.geoJson(parsedWalk, {
      style: walkStyle,
    }).addTo(map);
  })
})

$('#providers').click(function(){
  $('div.infobox').show();
  $('#foodmapInfo').hide();
  $('#providerIntro').show();
  $('#providerCheck').show();

  if (walkmap) { map.removeLayer(walkmap); }
  if (option1) { map.removeLayer(option1); }
  var sql = grocery;
  foodurl = "https://"+cartoUserName+".carto.com/api/v2/sql?format="+format+"&q="+sql;
  $.ajax(foodurl).done(function(data){
    option1 = L.geoJson(data, {
      pointToLayer: function (feature, latlng) {return L.circleMarker(latlng, marker1);},
      onEachFeature: function(feature, layer) {layer.bindPopup(feature.properties.legalname)},
      // style:
    }).addTo(map);
  });

  $('#submit').click(function(){
    // var userInput = $('#input').val();
    // var sql = "SELECT * FROM grocery WHERE legalname LIKE '%"+userInput+"%'"
    // console.log(sql);
    // foodurl = "https://"+cartoUserName+".carto.com/api/v2/sql?format="+format+"&q="+sql;
    // console.log(foodurl);
    // $.ajax(foodurl).done(function(data){
    //   userMap = L.geoJson(data, {
    //     // style:
    //   }).addTo(map);
    // });

    if ($('#option1').is(':checked')) {
      if (option1) { map.removeLayer(option1); }
      var sql = grocery;
      foodurl = "https://"+cartoUserName+".carto.com/api/v2/sql?format="+format+"&q="+sql;
      $.ajax(foodurl).done(function(data){
        option1 = L.geoJson(data, {
          pointToLayer: function (feature, latlng) {return L.circleMarker(latlng, marker1);},
          onEachFeature: function(feature, layer) {layer.bindPopup(feature.properties.legalname)},
          // style:
        }).addTo(map);
      });
    }

    if ($('#option2').is(':checked')) {
      if (option2) { map.removeLayer(option2); }
      var sql = corners;
      foodurl = "https://"+cartoUserName+".carto.com/api/v2/sql?format="+format+"&q="+sql;
      $.ajax(foodurl).done(function(data){
        console.log(data);
        option2 = L.geoJson(data, {
          pointToLayer: function (feature, latlng) {return L.circleMarker(latlng, marker2);},
          onEachFeature: function(feature, layer) {layer.bindPopup(feature.properties.legalname)},
          // style:
        }).addTo(map);
      });
    }

    // if ($('#option3').is(':checked')) {
    //   if (option3) { map.removeLayer(option3); }
    //   var sql = cornerslg;
    //   foodurl = "https://"+cartoUserName+".carto.com/api/v2/sql?format="+format+"&q="+sql;
    //   $.ajax(foodurl).done(function(data){
    //     option3 = L.geoJson(data, {
    //       // style:
    //     }).addTo(map);
    //   });
    // }

    if ($('#option4').is(':checked')) {
      if (option4) { map.removeLayer(option4); }
      var sql = cafe;
      foodurl = "https://"+cartoUserName+".carto.com/api/v2/sql?format="+format+"&q="+sql;
      $.ajax(foodurl).done(function(data){
        option4 = L.geoJson(data, {
          // style:
          pointToLayer: function (feature, latlng) {return L.circleMarker(latlng, marker4);},
          onEachFeature: function(feature, layer) {layer.bindPopup(feature.properties.legalname)},
        }).addTo(map);
      });
    }
  })

  $('#clear').click(function(){
    map.removeLayer(option1);
    map.removeLayer(option2);
    // map.removeLayer(option3);
    map.removeLayer(option4);
  })
})
