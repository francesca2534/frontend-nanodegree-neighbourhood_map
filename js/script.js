var len;
var desiredType = ""; 
var icon = 'https://maps.google.com/mapfiles/kml/shapes/';
var map;

//Array to accept markers
var markers = [];

//Array for locations
var locations = [
	{title: 'Pullichira Church', type: 'Churches', location: {lat: 8.847406400000001 , lng: 76.6625299}, tag: 'Mayyanad', dist:'12.7 km'},
	{title: 'Kottiyam Church', type: 'Churches', location: {lat: 8.8620263 , lng: 76.67197999999999}, tag: 'Kottiyam', dist: '9.6 km'},
	{title: 'Kakottumoola Church', type: 'Churches', location: {lat: 8.8306047 , lng: 76.6539951}, tag: 'Mayyanad', dist: '14.2'},
	{title: 'Kollam Beach', type: 'Entertainment', location: {lat: 8.8756778 , lng: 76.58891630000001}, tag: 'Kollam Beach', dist: '2.8 km'},
	{title: 'Carnival Cinemas', type: 'Entertainment', location: {lat: 8.889529, lng: 76.5858222}, tag: 'Carnival Cinemas', dist: '1.7 km'},
	{title: 'Holy Cross', type: 'Health', location: {lat: 8.861639199999999 , lng: 76.67340369999999}, tag: 'Kottiyam', dist: '9.8 km'},
	{title: 'KIMS', type: 'Health', location: {lat: 8.8643903 , lng: 76.68133019999999}, tag: 'Kottiyam', dist: '10.3 km'},
	{title: 'Auxilium English Medium', type: 'Education', location: {lat: 8.8538558 , lng: 76.67503239999999}, tag: 'Kottiyam', dist: '10.7 km'},
	{title: 'Mount Carmel', type: 'Education', location: {lat: 8.882745699999999 , lng: 76.5656204}, tag: 'Kollam', dist: '4.2 km'}
];

len = locations.length;

function initMap() {
    // Constructor creates a new map.
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 8.8504004, lng: 76.66292899999999},
      zoom: 10
	});
	var largeInfowindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();
    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < len; i++) {
      // Get the position from the location array.
		var position = locations[i].location;
		var title = locations[i].title;
		var type = locations[i].type;
		var tag = locations[i].tag;
		// Create a marker per location, and put into markers array.
		var marker = new google.maps.Marker({
			map: map,
			position: position,
			title: title,
			type: type,
			tag : tag,
			//icon: icon + 'parking_lot.png',
			id: i,
		});

		// Push the marker to our array of markers.
		markers.push(marker);
		// Create an onclick event to open an infowindow at each marker.
		marker.addListener('click', (function(markerCopy) {
			return function() {
				populateInfoWindow(this, largeInfowindow);
				if (markerCopy.getAnimation() !== null) {
				markerCopy.setAnimation(null);
				} else {
				markerCopy.setAnimation(google.maps.Animation.BOUNCE);
				}
			};
		})(marker));
		bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);    
    // To make sure that the markers exist before we attach them to the location objects
    ko.applyBindings(new viewModel());
}

//Runs when wiki button is pressed
function wiki(tag) {
	var $wikiElem = $('#wikipedia-links');
	$wikiElem.text("");//Clears the content.
	var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + tag + '&format=json&callback=wikiCallback';
	//Set timeout to avoid error
	var wikiRequestTimeout = setTimeout(function() {
		$wikiElem.text('failed to get wikipedia resources');
	},8000);

	$.ajax( {
		dataType: "jsonp",
		url: wikiUrl,
		success: function(response) {
			articleList = response[1];
			for (i = 0; i <articleList.length; i++) {
				articleStr = articleList[i];
				var url = "https://en.wikipedia.org/wiki/" + articleStr;
				$wikiElem.append('<li><a href="' + url + '">' + articleStr + '</a></li>' );
			}
			clearTimeout(wikiRequestTimeout);
		}
	});
	return false;
}

var Places = function (location) {
	var self = this;
	self.title = location.title;
	self.type = location.type;
	self.dist = location.dist;
};

function viewModel(marker) {
	var self = this; 

	//Clicking on list item sets animation
	self.itemClick = function() {
		self.locations().forEach(function(location, i) {
			location.marker.setAnimation(null);
		});
		this.marker.setAnimation(google.maps.Animation.BOUNCE);
		document.getElementById("dist").innerHTML = this.dist;
		document.getElementById("title").innerHTML = this.title;
	};

	self.availableTypes = [
	    { type: "All"},
  	    { type: "Churches"},
  	    { type: "Entertainment"},
  	    { type: "Health"},
  	    { type: "Education"}
	];

	self.selectedChoice = ko.observable("All");

	self.locations = ko.observableArray([
		new Places(locations[0]),
		new Places(locations[1]),
		new Places(locations[2]),
		new Places(locations[3]),
		new Places(locations[4]),
		new Places(locations[5]),
		new Places(locations[6]),
		new Places(locations[7]),
		new Places(locations[8])
	]);

	//Attaching markers to the location
	self.locations().forEach(function(location, i) {
		location.marker = markers[i];
	});

	//Filters the list on screen as per the selection on dropdown list
	self.filteredLocations = ko.computed(function() {
		desiredType = self.selectedChoice();		
		len = self.locations().length;


		if (desiredType=="All") { 
			self.locations().forEach(function(location) {
				location.marker.setVisible(true); //Setting the marker to be visible
			})	;
			return self.locations();
		}

		else {	
	        return ko.utils.arrayFilter(self.locations(), function(location) {
	            if (location.type == desiredType) {
	            	location.marker.setVisible(true);
	   				return location;         
	   			}
	            else {
	            	location.marker.setVisible(false); //Marker hidden
	            }	            	
	            
	        });		
		}
	});

}

//InfoWindow property
function populateInfoWindow(marker, infowindow) {
	// Checking whether infowindow is already opened on this marker.
	if (infowindow.marker != marker) {
	  infowindow.marker = marker;
	  tagger = marker.tag;
	  infowindow.setContent('<div>' + marker.title + '</div>' + '<br>' + '<button id="submit" onclick="wiki('+'tagger'+')">wiki</button>');
	  infowindow.open(map, marker);
	  // Removing animation on close click.
	  infowindow.addListener('closeclick',function(){
	    infowindow.marker.setAnimation(null);            
	  });
	}
}

