import mapboxgl from "https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm";

mapboxgl.accessToken = "pk.eyJ1IjoibG1oc2lhbyIsImEiOiJjbXA5MWlmMXcwaXc1MzRwb2ZvdXo5M3kxIn0.EFz3_BbbTbmA-_-Ga9ptUw";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",

  center: [-71.09415, 42.36027],

  zoom: 12,
  minZoom: 5,
  maxZoom: 18,
});