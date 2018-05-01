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


var smart = 'https://raw.githubusercontent.com/huilingh/OST4GIS-week12/master/Final/geojson/Heart%20Smart%20corner%20stores.geojson'

var markers = {
    radius: 5,
    fillColor: "#579fb7",
    color: "#ffffff",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

var orilat;
var orilng;
var polyline;

var state = {
  position: {
    marker: null,
    updated: null
  }
};

var goToOrigin = _.once(function(lat, lng) {
  map.flyTo([lat, lng], 14);
});

var updatePosition = function(lat, lng, updated) {
  if (state.position.marker) { map.removeLayer(state.position.marker); }
  state.position.marker = L.circleMarker([lat, lng], {color: "red", radius: 10});
  state.position.updated = updated;
  state.position.marker.addTo(map);
  goToOrigin(lat, lng);
};

var eachFeatureFunction = function(layer) {
  layer.on('click', function (event) {
    console.log(layer.feature.properties);
    $('span.name').text(layer.feature.properties.StoreName);
    $('span.address').text(layer.feature.properties.Address);
    $('span.day').text(layer.feature.properties.Day);
    $('span.time').text(layer.feature.properties.Time);
    $('span.partner').text(layer.feature.properties.Partner);
    $('#intro').hide();
    $('#results').show();

    destlat = layer.feature.geometry.coordinates[1];
    destlng = layer.feature.geometry.coordinates[0];
    var Route = 'https://api.mapbox.com/directions/v5/mapbox/driving/' +
    orilng + ',' + orilat + ';' + destlng + ',' + destlat +
    '?access_token=pk.eyJ1IjoiaHVpbGluZ2giLCJhIjoiY2pmOW9vcDFvMjlrNzJ4cDQ2NXBwbGxuaiJ9.dCVDcHLb63hLrTilZTl1vQ'

    $.ajax(Route).then(function(route) {
      console.log(route);
      var string = route.routes[0].geometry;
      var decodelatlngs = decode(string);
      var latlngs = _.map(decodelatlngs, function(data) {return [data[0]*10, data[1]*10]});
      console.log(latlngs);
      if (polyline) {map.removeLayer(polyline);}
      polyline = L.polyline(latlngs, {color: '#3b4d94'}).addTo(map);
      $('#travelinfo').show();
      $('span.distance').text(route.routes[0].distance);
      $('span.duration').text(Math.round(route.routes[0].duration/60));
    })

  });
};


$.ajax(smart).then(function(smart){
  parsedSmart = JSON.parse(smart);
  allSmart = L.geoJson(parsedSmart, {
    pointToLayer: function (feature, latlng) {return L.circleMarker(latlng, markers);},
  }).addTo(map).eachLayer(eachFeatureFunction);

  $('#back').click(function(){
    $('#intro').show();
    $('#results').hide();
    if (polyline) {map.removeLayer(polyline);}
    destlat = undefined;
    destlng = undefined;
  });

  $('#ori').click(function(){
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        updatePosition(position.coords.latitude, position.coords.longitude, position.timestamp);
        orilat = position.coords.latitude;
        orilng = position.coords.longitude;
        console.log(orilat, orilng);
      });
    };
  });

});
