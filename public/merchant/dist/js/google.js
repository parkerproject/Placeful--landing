google.maps.event.addDomListener(window, 'load', function () {
  var places = new google.maps.places.Autocomplete(document.getElementById('txtPlaces'));
  google.maps.event.addListener(places, 'place_changed', function () {
    var place = places.getPlace();
    console.log(place);
    var address = place.formatted_address;
    var latitude = place.geometry.location.lat();
    var longitude = place.geometry.location.lng();
    var mesg = "Address: " + address;
    mesg += "\nLatitude: " + latitude;
    mesg += "\nLongitude: " + longitude;
    //alert(mesg);
    $('input[name=business_address]').val(address);
    $('input[name=business_place]').val(place.name);
    $('input[name=business_lat]').val(latitude);
    $('input[name=business_lng]').val(longitude);
    $('input[name=business_lng]').val(longitude);
    $('input[name=business_lng]').val(longitude);
    $('input[name=business_phone]').val(place.formatted_phone_number);
    $('input[name=business_map]').val(place.url);
  });
});