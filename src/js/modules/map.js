'use strict';

(function($) {
    $.fn.tfindermap = function(options) {

        var settings = $.extend({
            queryLimit: 3,
            removeData: false
        }, options);

        var trailfinder_map;
        
        function trailfinder_initialize() {
            var mapOptions = {
                zoom: 9,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }
            trailfinder_map = new google.maps.Map(document.getElementById('map'), mapOptions);
            // Try HTML5 geolocation
            if (navigator.geolocation) {
                
                navigator.geolocation.getCurrentPosition(function(position) {
                    var lat = position.coords.latitude,
                        lng = position.coords.longitude,
                        //lat=41.081445,lng= -81.519005,
                        pos = new google.maps.LatLng(lat, lng),
                        geolocMarker = new google.maps.Marker({
                            map: trailfinder_map,
                            position: pos,
                            clickable: true,
                            icon: 'http://labs.google.com/ridefinder/images/mm_20_green.png'
                        });
                    geolocMarker.info = new google.maps.InfoWindow({
                        content: '<span style="font-weight: bold;" class="users-location-marker">Your location</span>'
                    });
                    google.maps.event.addListener(geolocMarker, 'click', function() {
                        geolocMarker.info.open(map, geolocMarker);
                    });
                    trailfinder_map.setCenter(pos);

                    if (settings.removeData) {
                        $("#location-data").empty();
                    }

                    // Send the JSON request using jQuery
                    $.ajax({
                        url: 'https://tf-svc.azurewebsites.net/trails?format=json',
                        dataType: 'json',
                        success: function(data) {
                            var trails = data.Trails;
                            //var rows = ret['rows'];
                            var resultsTableData = document.getElementById('location-data');
                            var locCoordinates = [];
                            
                            trails.forEach(function(trail) {
                                
                                var trailId = trail.Id;
                                var locationName = trail.Name;
                                var trailLatitude = trail.Latitude;
                                var trailLongitude = trail.Longitude;
                                var coords = trail.Latitude + ',' + trail.Longitude;

                                //var locationName = rows[rowNumber][0];
                                //var locationCoordinates = rows[rowNumber][1];
                                
                                locCoordinates.push(coords);
                                var dataElement = document.createElement('li');
                                dataElement.className = "row-" + trailId + " table-view-cell";
                                var nameElement = document.createElement('p');
                                nameElement.innerHTML = locationName;
                                nameElement.className = 'name-name';
                                var coordinatesElement = document.createElement('p');
                                coordinatesElement.className = 'coordinates';
                                //var nospaceCoords = locationCoordinates.replace(/ /g, '');
                                coordinatesElement.innerHTML = coords;
                                $(dataElement).append("<span class='icon icon-info trail-info-icon'></span>");

                                dataElement.appendChild(nameElement);
                                resultsTableData.appendChild(dataElement);

                                //TODO: re-enable this code once fixed
                                //directions & favs & coords
                                // var trailInfo = document.createElement('div');
                                // trailInfo.className = 'trail-info';
                                // $(trailInfo).css('display', 'none');
                                
                                // var directionsLink = "<div class='directions-link'><a class='btn btn-primary' href='http://maps.google.com/maps?saddr=" + lat + ',' + lng + "&daddr=" + coords + "' target='_blank'><span class='fa icon-in-btn map-marker'></span>get directions</a></div>";
                                // var addFav = "<div class='add-fav'><span class='icon icon-star'></span><span class='icon icon-star-filled star-filled'></span><span class='add-fav-text'>add favorite</span></div>";
                                // var viewMap = "<a href='#'>Click to view a trail map</a>";
                                // $(trailInfo).append(coordinatesElement, directionsLink, addFav, viewMap);
                                //dataElement.appendChild(trailInfo);
                                
                                
                            });
                            distanceMatrixCoords(locCoordinates, trails);
                        } //end success
                    });

                    function distanceMatrixCoords(coords, trails) {
                        var origins = pos;
                        var destinations = coords;
                        var service = new google.maps.DistanceMatrixService();

                        service.getDistanceMatrix({
                                origins: [origins],
                                destinations: destinations,
                                travelMode: google.maps.TravelMode.DRIVING,
                                unitSystem: google.maps.UnitSystem.IMPERIAL,
                                avoidHighways: false,
                                avoidTolls: false
                            },
                            callback
                        );

                        function callback(response, status) {
                            if (status == google.maps.DistanceMatrixStatus.OK) {
                                var origins = response.originAddresses;
                                var destinations = response.destinationAddresses;
                                var distanceElement = [];
                                var theRow = null;

                                for (var i = 0; i < origins.length; i++) {
                                    
                                    var results = response.rows[i].elements;

                                    for (var j = 0; j < results.length; j++) {
                                        var element = results[j];
                                        var distance = element.distance.text;
                                        var duration = element.duration.text;
                                        var from = origins[i];
                                        var to = destinations[j];

                                        distanceElement[j] = document.createElement('p');
                                        distanceElement[j].innerHTML = results[j].distance.text + " - " + results[j].duration.text + " away";
                                        distanceElement[j].className = 'distance-cell';

                                        theRow = document.getElementsByClassName("row-" + trails[j].Id);
                                        $(theRow).append(distanceElement[j]);
                                    }
                                }
                            }
                        }

                    }

                }, function() {
                    handleNoGeolocation(true);
                });
            } else {
                // Browser doesn't support Geolocation
                handleNoGeolocation(false);
                alert('Your device does not support geolocation. Please enable it for this app.');
            }
        }
        
        //error handling for geolocation
        function handleNoGeolocation(errorFlag) {
            if (errorFlag) {
                var content = 'Error: The Geolocation service failed.';
            } else {
                var content = 'Error: Your browser doesn\'t support geolocation.';
            }
            var options = {
                map: map,
                position: new google.maps.LatLng(41.081445, -81.519005),
                content: content
            };
            var infowindow = new google.maps.InfoWindow(options);
            trailfinder_map.setCenter(options.position);
        }

        google.maps.event.addDomListener(window, 'load', trailfinder_initialize());

    }

})(jQuery);