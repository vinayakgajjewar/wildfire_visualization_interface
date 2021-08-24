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
        maxZoom: 9
      })
    ],
    overlays: [overlay],
    view: new ol.View({
      center: [-13694686.259677762, 4715193.587946976],
      zoom: 6
    })
  });

  // add hover handler to render popup
  map.on("pointermove", function (evt) {

    var p = evt.pixel;
    var feature = map.forEachFeatureAtPixel(p, function(feature) {
      return feature;
    });
    if (feature) {

      // if we're hovering over a feature, display feature information
      let popupContent = `
        acq_date: ${feature.get("acq_date")}
        <br>
        frp: ${feature.get("frp")}
        <br>
        TEMP_ave: ${feature.get("TEMP_ave")}
        <br>
        WSPD_ave: ${feature.get("WSPD_ave")}
      `;
      content.innerHTML = popupContent;
      //console.log(feature.get("acq_date"));
      //console.log(feature.get("acq_time"));
      // set pos of overlay at click coordinate
      const coordinate = evt.coordinate;
      overlay.setPosition(coordinate);

      // reset bottom info
      document.getElementById("acq_date").innerHTML = "";
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
      document.getElementById("acq_date").innerHTML = feature.get("acq_date");
      document.getElementById("acq_time").innerHTML = feature.get("acq_time");
      document.getElementById("frp").innerHTML = feature.get("frp");
      document.getElementById("TEMP_ave").innerHTML = feature.get("TEMP_ave");
      document.getElementById("TEMP_min").innerHTML = feature.get("TEMP_min");
      document.getElementById("TEMP_max").innerHTML = feature.get("TEMP_max");
      document.getElementById("PRCP").innerHTML = feature.get("PRCP");
      document.getElementById("SNOW").innerHTML = feature.get("SNOW");
      document.getElementById("WDIR_ave").innerHTML = feature.get("WDIR_ave");
      document.getElementById("WSPD_ave").innerHTML = feature.get("WSPD_ave");
      document.getElementById("PRES_ave").innerHTML = feature.get("PRES_ave");
      document.getElementById("WCOMP").innerHTML = feature.get("WCOMP");
      document.getElementById("ELEV_max").innerHTML = feature.get("ELEV_max");
      document.getElementById("ELEV_min").innerHTML = feature.get("ELEV_min");
      document.getElementById("ELEV_median").innerHTML = feature.get("ELEV_median");
      document.getElementById("ELEV_mode").innerHTML = feature.get("ELEV_mode");
      document.getElementById("ELEV_sum").innerHTML = feature.get("ELEV_sum");
      document.getElementById("ELEV_mean").innerHTML = feature.get("ELEV_mean");
    }
  });

  // get geojson data
  var url = "http://localhost:8080/vectors/states.geojson";
  $.get(url, function (data, status) {

    // add geospatial data to map
    let geoJSONObj = data;

    // make vector layer using geojson obj
    let vLayer = new ol.layer.Vector({
      minZoom: 9,
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