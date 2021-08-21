// elements that make up the popup
const container = document.getElementById("popup");
const content = document.getElementById("popup-content");
const closer = document.getElementById("popup-closer");

// create overlay to anchor popup to map
const overlay = new ol.Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250,
  }
});

// add click handler to hide popup
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
}

var style = new ol.style.Style({
  image: new ol.style.Icon({
    scale: 0.05,
    src: "data/media/wildfire_icon.png"
  })
});

$(document).ready(function () {

  // create map
  var map = new ol.Map({
    target: "map",
    layers: [

      // OpenStreetMap
      new ol.layer.Tile({
        source: new ol.source.OSM()
      }),

      // multilevel visualization
      new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: "data/multilevel/tile-{z}-{x}-{y}.png",
          tileSize: [256, 256],
          attributions: '<a href="https://davinci.cs.ucr.edu">&copy;DaVinci</a>'
        }),
        maxZoom: 12
      })
    ],
    overlays: [overlay],
    view: new ol.View({
      center: [0, 0],
      zoom: 1
    })
  });

  // add hover handler to render popup
  map.on("pointermove", function (evt) {

    var p = evt.pixel;
    var feature = map.forEachFeatureAtPixel(p, function(feature) {
      return feature;
    });
    if (feature) {
      content.innerHTML = feature.get("acq_date");
      //console.log(feature.get("acq_date"));
      //console.log(feature.get("acq_time"));
      // set pos of overlay at click coordinate
      const coordinate = evt.coordinate;
      overlay.setPosition(coordinate);
    }
  });

  // get geojson data
  var url = "http://localhost:8080/vectors/states.geojson";
  $.get(url, function (data, status) {

    // add geospatial data to map
    let geoJSONObj = data;

    // make vector layer using geojson obj
    let vLayer = new ol.layer.Vector({
      //minZoom: 12,
      source: new ol.source.Vector({
        // featureProjection: "EPSG:3857"} is necessary for the code to work with UCR-Star data
        features: new ol.format.GeoJSON({featureProjection: "EPSG:3857"}).readFeatures(geoJSONObj)
      }),
      style: function(feature) {
        //style.getText().setText(feature.get("NAME"));
        return style;
      }
    });
    
    // add vector layer to map
    map.addLayer(vLayer);
  });
});