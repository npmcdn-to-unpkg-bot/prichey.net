var waitFor = require('waitFor');
var sassqwatch = require('sassqwatch');

waitFor('body.gbmf', function() {
  var map,
    idleListener,
    requestUrl = [window.location.protocol, '', window.location.host].join('/'),
    markers = [];

  var initMap = function() {
    var mapOptions = {
      zoom: 4,
      center: new google.maps.LatLng(39.50, -98.35),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      mapTypeControl: false,
      streetViewControl: false
    };

    map = new google.maps.Map($('#gbmf-map')[0], mapOptions);
    idleListener = google.maps.event.addListener(map, 'idle', firstIdle);
  };

  //add markers first time only
  var firstIdle = function() {
    google.maps.event.removeListener(idleListener);
  };

  // Adds a marker to the map and push to the array.
  var addMarker = function(location, selected) {
    // icon = !selected ? regularMarker : selectedMarker;
    zindex = !selected ? null : google.maps.Marker.MAX_ZINDEX + 1;
    var marker = new google.maps.Marker({
      position: location,
      map: map,
      // icon: icon,
      zIndex: zindex,
    });
    marker.set('location', location);

    marker.addListener('click', function() {
      markers.forEach(function(marker) {
        // marker.setIcon(regularMarker);
        marker.setZIndex(null);
      });

      marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
      // marker.setIcon(selectedMarker);
      map.panTo(marker.getPosition());
    });

    markers.push(marker);

    if (selected) {
      map.setCenter(marker.getPosition());
    }
  };

  var getLocations = function() {
    var locations = [];
    $('.gbmf-images img').each(function(i) {
      var $this = $(this);
      if ($this.data('latitude') && $this.data('longitude') && $this.data('id')) {
        locations.push({
          lat: $this.data('latitude'),
          lng: $this.data('longitude'),
          id: $this.data('id')
        });
      }
    });
    return locations;
  };

  var addMarkers = function() {
    var locations = getLocations();
    locations.forEach(function(location, i) {
      // location.lat = parseFloat(location.lat);
      // location.lng = parseFloat(location.lng);
      addMarker(location, i == 0);
    });
  };

  // Adds a marker to the map and push to the array.
  // var addMarker = function(location, selected) {
  //   icon = !selected ? regularMarker : selectedMarker;
  //   zindex = !selected ? null : google.maps.Marker.MAX_ZINDEX + 1;
  //   var marker = new google.maps.Marker({
  //     position: location,
  //     map: map,
  //     icon: icon,
  //     zIndex: zindex,
  //   });
  //   marker.set('location', location);
  //
  //   marker.addListener('click', function() {
  //     markers.forEach(function(marker) {
  //       marker.setIcon(regularMarker);
  //       marker.setZIndex(null);
  //     });
  //
  //     marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
  //     // marker.setIcon(selectedMarker);
  //     map.panTo(marker.getPosition());
  //
  //     // $("li.result").removeClass('selected');
  //     // $selected = $("li.result-" + location.post_name);
  //     // $selected.addClass('selected');
  //   });
  //
  //   markers.push(marker);
  //
  //   if (selected) {
  //     map.setCenter(marker.getPosition());
  //   }
  // };

  var init = function() {
    if ($(window).width() > 768) {
      initMap();
      addMarkers();
    }
  }

  init();
});
