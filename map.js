import mapboxgl from "https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

mapboxgl.accessToken = "pk.eyJ1IjoibG1oc2lhbyIsImEiOiJjbXA5MWlmMXcwaXc1MzRwb2ZvdXo5M3kxIn0.EFz3_BbbTbmA-_-Ga9ptUw";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/outdoors-v12",

  center: [-71.09415, 42.36027],

  zoom: 12,
  minZoom: 5,
  maxZoom: 18,
});

const svg = d3.select("#map").select("svg");

function getCoords(station) {
  const point = new mapboxgl.LngLat(+station.lon, +station.lat);
  const { x, y } = map.project(point);

  return { cx: x, cy: y };
}

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

  let jsonData;

  try {
    const jsonurl = "https://dsc106.com/labs/lab07/data/bluebikes-stations.json";
    jsonData = await d3.json(jsonurl);

    console.log("Loaded JSON Data:", jsonData);

    let stations = jsonData.data.stations;

    console.log("Stations Array:", stations);

    const circles = svg
      .selectAll("circle")
      .data(stations)
      .enter()
      .append("circle")
      .attr("r", 4)
      .attr("fill", "#2563EB")
      .attr("stroke", "white")
      .attr("stroke-width", 1.2)
      .attr("opacity", 0.75);

    function updatePositions() {
      circles
      .attr("cx", (d) => getCoords(d).cx)
      .attr("cy", (d) => getCoords(d).cy);
    }

    updatePositions();

    map.on("move", updatePositions);
    map.on("zoom", updatePositions);
    map.on("resize", updatePositions);
    map.on("moveend", updatePositions);

  } catch (error) {
    console.error("Error loading JSON:", error);
  }
});

