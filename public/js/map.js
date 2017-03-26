const mapDiv = document.querySelector('#map');

const mymap = L.map('map').setView([32.82994, 34.99019], 16);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
}).addTo(mymap);

L.marker([32.82994, 34.99019]).addTo(mymap);

const latLongOptions = {
  position: 'topright',
  separator: ' : ',
  emptyString: 'Lat : Long',
  lngFirst: false,
  numDigits: 5,
  lngFormatter: undefined,
  latFormatter: undefined,
  prefix: ""
};

L.control.mousePosition(latLongOptions).addTo(mymap);
