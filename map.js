import mapboxgl from "https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm";

mapboxgl.accessToken = "pk.eyJ1IjoibG1oc2lhbyIsImEiOiJjbXA5MWlmMXcwaXc1MzRwb2ZvdXo5M3kxIn0.EFz3_BbbTbmA-_-Ga9ptUw";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/outdoors-v12",

  center: [-71.09415, 42.36027],

  zoom: 12,
  minZoom: 5,
  maxZoom: 18,
});

map.on("load", async () => {
  map.addSource("boston_route", {
    type: "geojson",
    data: "https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson",
  });

  map.addLayer({
    id: "bike-lanes",
    type: "line",
    source: "boston_route",
    paint: {
        "line-color": "#178C3A",
        "line-width": 4,
        "line-opacity": 0.7,
    },
  });
  
  map.addSource("cambridge_route", {
    type: "geojson",
    data: "https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson",
    });

  map.addLayer({
    id: "cambridge-bike-lanes",
    type: "line",
    source: "cambridge_route",
    paint: {
        "line-color": "#178C3A",
        "line-width": 4,
        "line-opacity": 0.7,
    },
  });
});

