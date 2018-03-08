//Model
var parks = [{
        name: "Las Palmas Park",
        lat: 37.3646,
        lng: -122.0373,
        venueid: "4b9d61d4f964a5206ba836e3"
    }, {
        name: "Ponderosa Park",
        lat: 37.3622,
        lng: -122.0062,
        venueid: "4bb2981635f0c9b68e86bb83"
    }, {
        name: "Baylands Park",
        lat: 37.4132,
        lng: -121.9988,
        venueid: "4cd8a8ba1647a0938d23e34c"
    }, {
        name: "Ortega Park",
        lat: 37.3422,
        lng: -122.0256,
        venueid: "4a1f0984f964a520f97b1fe3"
    }, {
        name: "Fair Oaks Park",
        lat: 37.3845,
        lng: -122.0147,
        venueid: "4b8b172ff964a520699232e3"
    }

        ];
var destination = function (item) {
    this.name = item.name;
    this.lat = item.lat;
    this.lng = item.lng;
    this.venueid = item.venueid;
    this.marker = item.marker;
};

//View
var map, infoWindow;

//Initializes the map
function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 37.3688,
            lng: -122.0363
        },
        zoom: 12,
        styles: [

            {
                "stylers": [{
                    "saturation": -100
                }]
            }, {
                "featureType": "water",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#0099dd"
                }]
            }, {
                "elementType": "labels",
                "stylers": [{
                    "visibility": "off"
                }]
            }, {
                "featureType": "poi.park",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#aadd55"
                }]
            }, {
                "featureType": "road.highway",
                "elementType": "labels",
                "stylers": [{
                    "visibility": "on"
                }]
            }, {
                "featureType": "road.arterial",
                "elementType": "labels.text",
                "stylers": [{
                    "visibility": "on"
                }]
            }, {
                "featureType": "road.local",
                "elementType": "labels.text",
                "stylers": [{
                    "visibility": "on"
                }]
            }, {}
        ]
    });
    infoWindow = new google.maps.InfoWindow();

    parks.forEach (function(loc) {
        var lat = loc.lat;
        var lng = loc.lng;
        var name = loc.name;
        var venueID = loc.venueid;
        var marker = new google.maps.Marker({
            map: map,
            position: {
                lat,
                lng
            },
            name: name,
            animation: google.maps.Animation.DROP,
            id: venueID
        });
        loc.marker=marker;

        marker.addListener('click', function() {
            animateMarker(this, marker);
            showInfoWindow(this, marker);


        });
    });

    
    // Activate knockout
    ko.applyBindings(new viewModel());
}
//Creates bounce animation on marker when location is clicked
var animateMarker = function(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(null);

    }, 1000);
};


//ajax request for Foursquare API
var showInfoWindow = function(marker) {
    $.ajax({
        url: "https://api.foursquare.com/v2/venues/" + marker.id + '?client_id=WFEKDE0PWZUNSM4N2YDX14XNHWLLQS1UYOJYD2TB4N2BZOSW&client_secret=C34FVR5N14S3F5CVK053GHCHHDT3D42WDE5UTN5MDNUJXPMF&v=20170612',
        dataType: "json",
        success: function(data) {
            // add likes and ratings to marker
            marker.rating = data.response.venue.rating;
            marker.likes = data.response.venue.likes.count;
            marker.location = data.response.venue.location.address;
            marker.popular = data.response.venue.popular.hours;
            populateWindow(marker, infoWindow);

        },
        //alert if there is error
        error: function() {
            alert("Something went wrong");
        }
    });

};

// populates infowindow with information about marker
var populateWindow = function(marker, infowindow) {

    infowindow.setContent('<div>' + marker.name + '<p>' + 'Location:' + marker.location +
        '<p>' + 'Likes: ' + marker.likes + '</div>' +
        '<p>' + 'Rating: ' + marker.rating.toString());
    infowindow.open(map, marker);

};
//View Model
var viewModel = function() {

    var self = this;
    this.parkList = ko.observableArray([]);
    parks.forEach(function(parkLocation) {
        self.parkList.push(new destination(parkLocation));
    });

    
    //Filter
    this.filter = ko.observable("");

    self.filteredLocations = ko.computed(function() {
        var filter = self.filter().toLowerCase();
        if (!filter) {
            return self.parkList();
        } else {
            return ko.utils.arrayFilter(self.parkList(), function(item) {
                var result = (item.name.toLowerCase().indexOf(filter) === 0);
                item.marker.setVisible(result);
                return result;
            });
        }
    });

    this.showMarker = function(location) {
        google.maps.event.trigger(location.marker, 'click');
    };

    var errorMsg = function(error) {

        alert("Error in map");
    };
};

