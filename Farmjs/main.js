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


var orilat;
var orilng;

var state = {
  position: {
    marker: null,
    updated: null
  }
};

/* We'll use underscore's `once` function to make sure this only happens
 *  one time even if weupdate the position later
 */
var goToOrigin = _.once(function(lat, lng) {
  map.flyTo([lat, lng], 14);
  // console.log(lat,lng);
});


// This chunck calculate the nearest location
// Convert Degress to Radians
function Deg2Rad(deg) {
  return deg * Math.PI / 180;
}

function PythagorasEquirectangular(lat1, lon1, lat2, lon2) {
  lat1 = Deg2Rad(lat1);
  lat2 = Deg2Rad(lat2);
  lon1 = Deg2Rad(lon1);
  lon2 = Deg2Rad(lon2);
  var R = 6371; // km
  var x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
  var y = (lat2 - lat1);
  var d = Math.sqrt(x * x + y * y) * R;
  return d;
}

function NearestLocation(latitude, longitude, locations) {
  var mindif = 99999;
  var closest;

  for (index = 0; index < locations.length; ++index) {
    var dif = PythagorasEquirectangular(latitude, longitude, locations[index][1], locations[index][2]);
    if (dif < mindif) {
      closest = index;
      mindif = dif;
    }
  }

  // echo the nearest city
  closestLocation = locations[closest];
  console.log(closestLocation);
}
// end of chunck



/* Given a lat and a long, we should create a marker, store it
 *  somewhere, and add it to the map
 */
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
    $('span.name').text(layer.feature.properties.NAME);
    $('span.address').text(layer.feature.properties.ADDRESS);
    $('span.day').text(layer.feature.properties.DAY);
    $('span.time').text(layer.feature.properties.TIME);
    $('span.month').text(layer.feature.properties.MONTHS);
    $('span.neighbor').text(layer.feature.properties.NEIGHBORHOOD);
    $('span.transit').text(layer.feature.properties.MAJOR_BUS_SUBWAY_ROUTES);
    $('#intro').hide();
    $('#travelinfo').hide();
    $('#results').show();
  });
};

var markers = {
    radius: 5,
    fillColor: "#6e9f47",
    color: "#ffffff",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};


// get and parse the farmers market Locations
var market = 'https://raw.githubusercontent.com/huilingh/OST4GIS-week12/master/Final/geojson/Farmers_Markets.geojson'

$.ajax(market).then(function(market){
  parsedMarket = JSON.parse(market);
  allMarkets = L.geoJson(parsedMarket, {
    pointToLayer: function (feature, latlng) {return L.circleMarker(latlng, markers);},
  }).addTo(map).eachLayer(eachFeatureFunction);

  $('#back').click(function(){
    $('#intro').show();
    $('#results').hide();
    $('#travelinfo').hide();
  })

  /* This 'if' check allows us to safely ask for the user's current position */
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      updatePosition(position.coords.latitude, position.coords.longitude, position.timestamp);
      orilat = position.coords.latitude;
      orilng = position.coords.longitude;
      console.log(orilat, orilng);

      marketlatlng = _.map(parsedMarket.features, function(data) {return [data.properties.NAME, data.geometry.coordinates[1], data.geometry.coordinates[0]]})

      // get closest farmers market
      NearestLocation(orilat, orilng, marketlatlng);
      destlat = closestLocation[1];
      destlng = closestLocation[2];

      var polyline;

      // go to the nearest location by car
      $('#car').click(function(){
        if(polyline !== undefined){
          map.removeLayer(polyline);
        }
        var Route = 'https://api.mapbox.com/directions/v5/mapbox/driving/' +
        orilng + ',' + orilat + ';' + destlng + ',' + destlat +
        '?access_token=pk.eyJ1IjoiaHVpbGluZ2giLCJhIjoiY2pmOW9vcDFvMjlrNzJ4cDQ2NXBwbGxuaiJ9.dCVDcHLb63hLrTilZTl1vQ'

        $.ajax(Route).then(function(route) {
          console.log(route);
          var string = route.routes[0].geometry;
          var decodelatlngs = decode(string);
          var latlngs = _.map(decodelatlngs, function(data) {return [data[0]*10, data[1]*10]});
          console.log(latlngs);
          polyline = L.polyline(latlngs, {color: '#3b4d94'}).addTo(map);

          $('#travelinfo').show();
          $('#results').hide();
          $('span.to').text(closestLocation[0]);
          $('span.distance').text(route.routes[0].distance);
          $('span.duration').text(Math.round(route.routes[0].duration/60));
        })
      })

      console.log(polyline);
      // go to the nearest location by walking
      $('#walk').click(function(){
        if(polyline !== undefined){
          map.removeLayer(polyline);
        }
        var Route = 'https://api.mapbox.com/directions/v5/mapbox/walking/' +
        orilng + ',' + orilat + ';' + destlng + ',' + destlat +
        '?access_token=pk.eyJ1IjoiaHVpbGluZ2giLCJhIjoiY2pmOW9vcDFvMjlrNzJ4cDQ2NXBwbGxuaiJ9.dCVDcHLb63hLrTilZTl1vQ'

        $.ajax(Route).then(function(route) {
          console.log(route);
          var string = route.routes[0].geometry;
          var decodelatlngs = decode(string);
          var latlngs = _.map(decodelatlngs, function(data) {return [data[0]*10, data[1]*10]});
          console.log(latlngs);
          polyline = L.polyline(latlngs, {color: '#e38f49'}).addTo(map);

         $('#travelinfo').show();
         $('#results').hide();
         $('span.to').text(closestLocation[0]);
         $('span.distance').text(route.routes[0].distance);
         $('span.duration').text(Math.round(route.routes[0].duration/60));
        })
      })

    });
  }

  else {
    alert("Unable to access geolocation API!");
  }

})
