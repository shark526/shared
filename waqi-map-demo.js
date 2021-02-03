var CartoDB_Positron = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
    }
);

let map = L.map(document.getElementById("leaflet-map"), {
    attributionControl: false,
    gestureHandling: true,
    zoomSnap: 0.1,
})
    .setView([0, 0], 12)
    .addLayer(CartoDB_Positron);

map.on("moveend", () => {
    let bounds = map.getBounds();
    bounds =
        bounds.getNorth() +
        "," +
        bounds.getWest() +
        "," +
        bounds.getSouth() +
        "," +
        bounds.getEast();
    document.getElementById("leaflet-map-bounds").innerHTML = "bounds: " + bounds;

    populateMarkers(bounds);
});

let allMarkers = {};

function populateMarkers(bounds) {
    return fetch(
        "https://api.waqi.info/map/bounds/?latlng=" + bounds + "&token=" + token()
    )
        .then((x) => x.json())
        .then((stations) => {
            if (stations.status != "ok") throw stations.reason;

            stations.data.forEach((station) => {
                if (allMarkers[station.uid]) map.removeLayer(allMarkers[station.uid]);

                let iw = 83,
                    ih = 107;
                let icon = L.icon({
                    iconUrl: "https://waqi.info/mapicon/" + station.aqi + ".30.png",
                    iconSize: [iw / 2, ih / 2],
                    iconAnchor: [iw / 4, ih / 2 - 5],
                });

                let marker = L.marker([station.lat, station.lon], {
                    zIndexOffset: station.aqi,
                    title: station.station.name,
                    icon: icon,
                }).addTo(map);

                marker.on("click", () => {
                    console.log("click");
                    let popup = L.popup()
                        .setLatLng([station.lat, station.lon])
                        .setContent(station.station.name)
                        .openOn(map);

                    getMarkerAQI(station.uid).then((aqi) => {
                        let details = "";
                        for (specie in aqi.iaqi) {
                            details += "<b>" + specie + "</b>:" + aqi.iaqi[specie].v + " ";
                        }
                        popup.setContent(station.station.name + "<br> position:" + station.lat + "," + station.lon + "<br>" + details);
                    });
                });

                allMarkers[station.uid] = marker;
            });

            return stations.data.map(
                (station) => new L.LatLng(station.lat, station.lon)
            );
        });
}

function getMarkerAQI(markerUID) {
    return fetch(
        "https://api.waqi.info/feed/@" + markerUID + "/?token=" + token()
    )
        .then((x) => x.json())
        .then((data) => {
            if (data.status != "ok") throw data.reason;
            return data.data;
        });
}

function loadMapByGeo(curGeo) {
    let geoHere = curGeo.concat(curGeo[0] - 0.005, curGeo[1] + 0.005);
    populateMarkers(geoHere.join(",")).then((bounds) => {
        map.fitBounds(bounds, { maxZoom: 12, paddingTopLeft: [0, 40] });
    });
}

function initMap() {
    fetch("http://api.waqi.info/feed/here/?token=" + token())
        .then((x) => x.json())
        .then((aqiData) => {
            if (aqiData.status != "ok") throw aqiData.data;

            let finalData = {
                aqi: aqiData.data.aqi,
                city: aqiData.data.city
            };

            loadMapByGeo(finalData.city.geo);
        });
}

initMap();
