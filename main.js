// Create a Leaflet map instance and center it on Zimbabwe
const map = L.map('map').setView([-19.0154, 29.1549], 7);


// Create the Google Satellite base map layer
const googleSatellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  attribution: 'Africa Regional Centre for Space Sciecnce Education in English'
});

// Create the grid overlay layer group
const gridOverlay = L.layerGroup();

// Add grid lines to the grid overlay layer group
function addGridLines() {
  const bounds = map.getBounds();
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();

  const latGridInterval = 1; // Interval between latitude grid lines
  const lonGridInterval = 1; // Interval between longitude grid lines

  const gridLines = [];

  for (let lat = Math.floor(southWest.lat / latGridInterval) * latGridInterval; lat <= northEast.lat; lat += latGridInterval) {
    gridLines.push([[lat, southWest.lng], [lat, northEast.lng]]);
  }

  for (let lon = Math.floor(southWest.lng / lonGridInterval) * lonGridInterval; lon <= northEast.lng; lon += lonGridInterval) {
    gridLines.push([[southWest.lat, lon], [northEast.lat, lon]]);
  }

  // Create SVG elements for each grid line and add them to the grid overlay layer group
  gridLines.forEach(line => {
    const polyline = L.polyline(line, { className: 'grid-line' });
    gridOverlay.addLayer(polyline);
  });

  // Add labels to the grid corners
  const labelOptions = { className: 'grid-label', opacity: 0, direction: 'center', permanent: true };

  const gridCorners = [
    [southWest.lat, southWest.lng],
    [southWest.lat, northEast.lng],
    [northEast.lat, northEast.lng],
    [northEast.lat, southWest.lng]
  ];

  gridCorners.forEach(corner => {
    const label = L.marker(corner, labelOptions).addTo(map);
    label.bindTooltip(`${corner[0].toFixed(3)}, ${corner[1].toFixed(3)}`, { offset: [0, -12], className: 'grid-label-tooltip' });
  });
}

// Event listener for map move to redraw the grid lines and labels
map.on('moveend', () => {
  gridOverlay.clearLayers();
  addGridLines();
});

// Initial drawing of grid lines and labels
addGridLines();

// Add the Google Satellite base map layer as the default
googleSatellite.addTo(map);

// Create an object to hold the base map layers
const baseMaps = {
  'Google Satellite': googleSatellite
};

// Create an object to hold the overlay layers
const overlayMaps = {
  'Grid Overlay': gridOverlay
};

// Function to add a Geoserver layer to the map
function addGeoserverLayer(year, month) {
  // Create the WMS URL based on the selected parameters
  const wmsUrl = `http://localhost:8080/geoserver/drought/wms`;

  // Create the WMS layer options
  const wmsLayerOptions = {
    layers: `drought:${year}_${month}`,
    format: 'image/png',
    transparent: true
  };

  // Create the WMS layer and add it to the map
  const wmsLayer = L.tileLayer.wms(wmsUrl, wmsLayerOptions);

  // Add the WMS layer to the overlay maps
  const layerName = `${year}_${month}`;
  overlayMaps[layerName] = wmsLayer;
  wmsLayer.addTo(map);

  // Update the layers control
  updateLayersControl();
}

// Function to remove a Geoserver layer from the map
function removeGeoserverLayer(year, month) {
  // Remove the WMS layer from the map
  const layerName = `${year}_${month}`;
  const wmsLayer = overlayMaps[layerName];
  if (wmsLayer) {
    wmsLayer.remove();
    delete overlayMaps[layerName];

    // Update the layers control
    updateLayersControl();
  }
}

// Function to update the layers control
function updateLayersControl() {
  // Remove existing layers control if it exists
  if (map.layersControl) {
    map.removeControl(map.layersControl);
  }

  // Create a new layers control
  map.layersControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
}

// Function to update the map based on user selections
function updateMap() {
  // Get the selected year and month
  const selectedYear = document.getElementById('year-select').value;
  const selectedMonth = document.getElementById('month-select').value;

  // Remove existing Geoserver layers
  for (const layerName in overlayMaps) {
    if (layerName.includes('drought:')) {
      removeGeoserverLayer(layerName.split(':')[1].split('_')[0], layerName.split(':')[1].split('_')[1]);
    }
  }

  if (selectedYear && selectedMonth) {
    // Add the selected Geoserver layer to the map
    addGeoserverLayer(selectedYear, selectedMonth);
  }
}

// Event listener for the button to update the map on click
const viewButton = document.getElementById('view-button');
viewButton.addEventListener('click', updateMap);

document.addEventListener('DOMContentLoaded', function () {
  // Get the current year
  const currentYear = new Date().getFullYear();

  // Populate the years dynamically
  const yearSelect = document.getElementById('year-select');
  for (let year = 2000; year <= currentYear; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.text = year;
    yearSelect.appendChild(option);
  }

  // Populate the months dynamically
  const monthSelect = document.getElementById('month-select');
  for (let month = 1; month <= 12; month++) {
    const option = document.createElement('option');
    option.value = month.toString().padStart(2, '0');
    option.text = month.toString().padStart(2, '0');
    monthSelect.appendChild(option);
  }
});


function handleMapClick(event) {
    const { lat, lng } = event.latlng;
  
    // Fetch the attribute data from the clicked location (replace with your own data retrieval method)
    const attributeData = fetchAttributeData(lat, lng);
  
    // Create a table to display the attribute data
    const table = document.createElement('table');
    table.classList.add('popup-table');
  
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    Object.keys(attributeData).forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
  
    // Create table body
    const tbody = document.createElement('tbody');
    const row = document.createElement('tr');
    Object.values(attributeData).forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });
    tbody.appendChild(row);
    table.appendChild(tbody);
  
    // Create the popup and display the table
    L.popup()
      .setLatLng(event.latlng)
      .setContent(table)
      .openOn(map);
  }
  

// Function to populate the years dynamically for Downloads
function populateYears() {
    const currentYear = new Date().getFullYear();
    const downloadYearSelect = document.getElementById('download-year-select');
  
    for (let year = 2000; year <= currentYear; year++) {
      const option = document.createElement('option');
      option.value = year;
      option.text = year;
      downloadYearSelect.appendChild(option);
    }
  }
  
  // Call the function to populate the years
  populateYears();
  
// Function to handle the download button click
function handleDownload() {
    // Get the selected year and dataset type
    const selectedYear = document.getElementById('download-year-select').value;
    const selectedType = document.getElementById('download-type-select').value;
  
    // Construct the URL for the zip file
    const baseUrl = 'data';
    const yearUrl = `${baseUrl}/${selectedYear}`;
    const fileUrl = selectedType === 'zonal' ? `${yearUrl}/zonal_statistics.zip` : `${yearUrl}/raster_maps.zip`;
  
    // Create a temporary link element and trigger the download
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = selectedType === 'zonal' ? 'zonal_statistics.zip' : 'raster_maps.zip';
    link.click();
  }
  

// Event listener for the download button
const downloadButton = document.getElementById('download-button');
downloadButton.addEventListener('click', () => {
  // Get the selected year and dataset type
  const selectedYear = document.getElementById('download-year-select').value;
  const selectedType = document.getElementById('download-type-select').value;

  // Construct the URL for the zip file
  const baseUrl = 'data';
  const yearUrl = `${baseUrl}/${selectedYear}`;
  const fileUrl = selectedType === 'zonal' ? `${yearUrl}/zonal_statistics.zip` : `${yearUrl}/raster_maps.zip`;

  // Create a temporary link element and trigger the download
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = selectedType === 'zonal' ? 'zonal_statistics.zip' : 'raster_maps.zip';
  link.click();
});


// Create a custom legend control
const legendControl = L.control({ position: 'bottomright' });

// Define the content of the legend control
legendControl.onAdd = function (map) {
  const div = L.DomUtil.create('div', 'legend');
  div.innerHTML = '<img src="img/legend.png" alt="Legend">';
  return div;
};

// Define the content of the legend control
legendControl.onAdd = function (map) {
  const div = L.DomUtil.create('div', 'legend');
  const img = L.DomUtil.create('img', 'legend-image');
  img.src = 'img/legend.png';
  img.alt = 'Legend';
  img.style.width = '150px'; // Adjust the width as per your requirement
  img.style.height = 'auto'; // Maintain the aspect ratio
  div.appendChild(img);
  return div;
};

// Add the legend control to the map
legendControl.addTo(map);

// Create the scale control and add it to the map
L.control.scale().addTo(map);
// Add the printing control to the map
L.control.print().addTo(map);







/*// Add an event listener to the toggle button
const toggleButton = document.getElementById('toggle-button');
toggleButton.addEventListener('click', toggleLeftSection);

// Function to toggle the visibility of the left section
function toggleLeftSection() {
  const container = document.querySelector('.container');
  container.classList.toggle('hide-left-section');
}

// Function to handle the window resize event
function handleWindowResize() {
  const toggleButton = document.getElementById('toggle-button');
  const leftSection = document.querySelector('.left-section');
  const screenWidth = window.innerWidth;

  if (screenWidth <= 1024) {
    toggleButton.style.display = 'block';
    leftSection.classList.add('hide');
  } else {
    toggleButton.style.display = 'none';
    leftSection.classList.remove('hide');
  }
}

// Add an event listener for the window resize event
window.addEventListener('resize', handleWindowResize);

// Call the handleWindowResize function once on page load
handleWindowResize();

*/
// JavaScript code
// JavaScript code
const toggleButton = document.getElementById("toggle-button");
const leftSection = document.querySelector(".left-section");

toggleButton.addEventListener("click", function() {
  leftSection.classList.toggle("hidden");
});

window.addEventListener("resize", function() {
  if (window.innerWidth > 1024) {
    leftSection.classList.remove("hidden");
  }
});

