// Google Map services variables

var map;
var service;
var infowindow;
var pyrmont;

// Browser location services

$(document).ready(function(){
  geoFindMe();
});


function geoFindMe() {
  var output = $('.position-data');

  if (!navigator.geolocation){
    output.html("<p>Geo not supported</p>");
    return;
  }

  function success(position) {
    var latitude  = position.coords.latitude;
    var longitude = position.coords.longitude;

    // output.html('<p>Latitude is ' + latitude + '° <br>Longitude is ' + longitude + '°</p>');

    // var img = new Image();
    // img.src = "https://maps.googleapis.com/maps/api/staticmap?center=" + latitude + "," + longitude + "&zoom=13&size=300x300&sensor=false";

    // $('.google-map').html(img);
    initialize(latitude, longitude);
  };

  function error() {
    output.html("Unable to retrieve your location");
  };

  // output.html("<p>Locating…</p>");

  navigator.geolocation.getCurrentPosition(success, error);
}


// Google Map services

function initialize(latitude, longitude) {
  // var pyrmont = new google.maps.LatLng(-33.8665433,151.1956316);
  // $('.places-data').html('<p>initing on' + latitude + '° , ' + longitude + '°</p>');
  pyrmont = new google.maps.LatLng(latitude, longitude);

  map = new google.maps.Map(document.getElementById('map'), {
      center: pyrmont,
      zoom: 15
    });

  service = new google.maps.places.PlacesService(map);
  var link = $('#title .auto-fill-button').find('a');
  link.click(autoFillPlaces);
  link.html(link.data('ready'));
  // service.nearbySearch(request, callback);
}


function autoFillPlaces() {
  var link = $(this);
  link.html(link.data('load'));

  var request = {
    location: pyrmont,
    radius: '500',
    types: ['restaurant']
  };

  service.nearbySearch(request, fillPlaces);
}

function fillPlaces(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < 3; i++) {
      var lucky = results[Math.floor(Math.random() * results.length)].name;
      var $form = $('#title .choice-form');
      $form.find('input').eq(i).val(lucky);
    }
    var link = $('#title .auto-fill-button').find('a');
    link.html(link.data('done'));
  }
}
