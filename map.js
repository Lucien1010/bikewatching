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

function formatTime(minutes) {
  const date = new Date(0, 0, 0, 0, minutes);

  return date.toLocaleString("en-US", {
    timeStyle: "short",
  });
}

function minutesSinceMidnight(date) {
    return date.getHours() * 60 + date.getMinutes();
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

  const timeSlider = document.getElementById("time-slider");
  const selectedTime = document.getElementById("selected-time");
  const anyTimeLabel = document.getElementById("any-time");

  selectedTime.style.display = "none";

  try {
    const jsonurl = "https://dsc106.com/labs/lab07/data/bluebikes-stations.json";
    jsonData = await d3.json(jsonurl);

    const trips = await d3.csv(
        "https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv",
        (trip) => {
            trip.started_at = new Date(trip.started_at);
            trip.ended_at = new Date(trip.ended_at);

            return trip;
        }
    );

    console.log("Loaded JSON Data:", jsonData);
    console.log("Trips Data:", trips);

    let stations = jsonData.data.stations;

    console.log("Stations Array:", stations);

    const departures = d3.rollup(
      trips,
      (v) => v.length,
      (d) => d.start_station_id
    );

    const arrivals = d3.rollup(
      trips,
      (v) => v.length,
      (d) => d.end_station_id
    );

    stations = stations.map((station) => {
      let id = station.short_name;

      station.arrivals = arrivals.get(id) ?? 0;
      station.departures = departures.get(id) ?? 0;
      station.totalTraffic = station.arrivals + station.departures;

      return station;
    });

    console.log(stations);

    const radiusScale = d3
      .scaleSqrt()
      .domain([0, d3.max(stations, (d) => d.totalTraffic)])
      .range([0, 25]);

    const stationFlow = d3
      .scaleQuantize()
      .domain([0, 1])
      .range([0, 0.5, 1]);

    const circles = svg
      .selectAll("circle")
      .data(stations)
      .enter()
      .append("circle")
      .attr("r", (d) => radiusScale(d.totalTraffic))
      .attr("fill", "#2563EB")
      .attr("stroke", "white")
      .attr("stroke-width", 1.2)
      .attr("fill-opacity", 0.6)
      .attr("stroke-opacity", 0.9)
      .style("--departure-ratio", (d) => stationFlow(d.departures / d.totalTraffic))
      .each(function (d) {
        d3.select(this)
          .append("title")
          .text(
            `${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`
          );
      });

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

    timeSlider.addEventListener("input", () => {
      const minutes = Number(timeSlider.value);

      selectedTime.textContent = formatTime(minutes);

      if (minutes === -1) {
        anyTimeLabel.style.display = "block";
        selectedTime.style.display = "none";
      } else {
        anyTimeLabel.style.display = "none";
        selectedTime.style.display = "block";
      }

      const filteredTrips =
        minutes === -1
            ? trips
            : trips.filter((trip) => {
                  const tripMinutes = minutesSinceMidnight(trip.started_at);

                  return Math.abs(tripMinutes - minutes) <= 60;
              });

      const departures = d3.rollup(
        filteredTrips,
        (v) => v.length,
        (d) => d.start_station_id
      );

      const arrivals = d3.rollup(
        filteredTrips,
        (v) => v.length,
        (d) => d.end_station_id
      );

      stations.forEach((station) => {
        let id = station.short_name;

        station.arrivals = arrivals.get(id) ?? 0;
        station.departures = departures.get(id) ?? 0;

        station.totalTraffic = station.arrivals + station.departures;
      });

      circles
        .attr("r", (d) => radiusScale(d.totalTraffic))
        .style("--departure-ratio", (d) => stationFlow(d.departures / d.totalTraffic));
    });
  } catch (error) {
    console.error("Error loading JSON:", error);
  }
});

