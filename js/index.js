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

// style object for polygons
var polygonStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: "ff00ff",
    width: 1
  })
});

function makeDynamicGETRequest(map) {
  // get geojson data
  var url = "http://localhost:8080/vectors/states.geojson";

  // extents object to send to back-end
  minx = map.getView().calculateExtent()[0];
  miny = map.getView().calculateExtent()[1];
  maxx = map.getView().calculateExtent()[2];
  maxy = map.getView().calculateExtent()[3];

  //console.log(ol.proj.toLonLat([minx, miny]));
  //console.log(ol.proj.toLonLat([maxx, maxy]));

  let extentsObj = {
    minx: ol.proj.toLonLat([minx, miny])[0],
    miny: ol.proj.toLonLat([minx, miny])[1],
    maxx: ol.proj.toLonLat([maxx, maxy])[0],
    maxy: ol.proj.toLonLat([maxx, maxy])[1]
  };

  console.log("extents:");
  console.log(extentsObj);

  // make GET request with extents
  $.get(url, extentsObj, function (data, status) {

    console.log("status:");
    console.log(status);

    // clear all current vector layers first
    //map.setLayerGroup([]);

    // add geospatial data to map
    let geoJSONObj = data;
    console.log("geoJSONObj");
    console.log(geoJSONObj);

    // make vector layer using geojson obj
    let vLayer = new ol.layer.Vector({
      // temporarily commented out
      //minZoom: 9,
      source: new ol.source.Vector({
        // {featureProjection: "EPSG:3857"} is necessary for the code to work with UCR-Star data
        features: new ol.format.GeoJSON({featureProjection: "EPSG:3857"}).readFeatures(geoJSONObj)
      }),
      style: function(feature) {
        //style.getText().setText(feature.get("NAME"));
        return polygonStyle;
      }
    });
    
    // add vector layer to map
    map.addLayer(vLayer);
  });
}

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
      // TEMPORARILY REMOVED
      /*new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: "data/multilevel/tile-{z}-{x}-{y}.png",
          tileSize: [256, 256],
          attributions: '<a href="https://davinci.cs.ucr.edu">&copy;DaVinci</a>'
        }),
        maxZoom: 9
      })*/
    ],
    overlays: [overlay],
    view: new ol.View({
      center: [-13694686.259677762, 4715193.587946976],
      zoom: 6
    })
  });

  makeDynamicGETRequest(map);

  // add hover handler to render popup
  map.on("pointermove", function (evt) {

    var p = evt.pixel;
    var feature = map.forEachFeatureAtPixel(p, function(feature) {
      return feature;
    });
    if (feature) {

      // if we're hovering over a feature, display feature information
      let popupContent = `
        Acres: ${feature.get("Acres")}
        <br>
        County: ${feature.get("County")}
        <br>
        Crop2014: ${feature.get("Crop2014")}
        <br>
        Date_Data_: ${feature.get("Date_Data_")}
      `;
      content.innerHTML = popupContent;

      // set pos of overlay at click coordinate
      const coordinate = evt.coordinate;
      overlay.setPosition(coordinate);

    } else {
      //overlay.setPosition(undefined);
      //closer.blur();
    }
  });

  // on singleclick, display current feature info at bottom of map
  map.on("singleclick", function (evt) {
    var p = evt.pixel;
    console.log(evt.coordinate);
    var feature = map.forEachFeatureAtPixel(p, function(feature) {
      return feature;
    });
    if (feature) {

      // if we're clicking on a feature, display more info at the bottom
      document.getElementById("acres").innerHTML = feature.get("Acres");
      document.getElementById("county").innerHTML = feature.get("County");
      document.getElementById("crop2014").innerHTML = feature.get("Crop2014");
      document.getElementById("date").innerHTML = feature.get("Date_Data_");
    }
  });
/*
  // make dynamic GET request at end of map move event
  // only want to make request if zoom level is high enough
  map.on("moveend", function() {
    if (map.getView().getZoom() >= 12) {
      makeDynamicGETRequest(map);
    }
  });
});