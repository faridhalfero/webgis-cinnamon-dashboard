console.log("Loading GeoJSON...");

fetch('data/Export_Output_4-8.json')
  .then(res => {
    if (!res.ok) throw new Error('GeoJSON file not found!');
    return res.json();
  })
  .then(data => {
    console.log("GeoJSON loaded:", data);

    const map = L.map('map').setView([-2.27, 101.58], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.geoJSON(data, {
      style: { color: 'lime', weight: 2 },
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        layer.bindPopup(
          `<b>${props.Farmer}</b><br>Luas: ${props.Luas_Poly?.toFixed(2) ?? 0} ha`
        );
      }
    }).addTo(map);
  })
  .catch(error => {
    console.error("Error loading GeoJSON:", error);
  });

fetch('data/farmers_log.json')
  .then(res => res.json())
  .then(data => {
    const top5 = data
      .filter(d => d["Available Volume (kg)"])
      .sort((a, b) => b["Available Volume (kg)"] - a["Available Volume (kg)"])
      .slice(0, 5);

    document.getElementById('total-garden').innerHTML = `
      <h3>Total Kebun</h3>
      <p>${data.length}</p>
    `;

    const totalVolume = data.reduce((sum, d) => sum + (d["Available Volume (kg)"] || 0), 0);
    document.getElementById('total-volume').innerHTML = `
      <h3>Total Volume Tersedia</h3>
      <p>${totalVolume.toLocaleString()} kg</p>
    `;

    new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: {
        labels: top5.map(d => d["Farm Code"]),
        datasets: [{
          label: 'Available Volume (kg)',
          data: top5.map(d => d["Available Volume (kg)"]),
          backgroundColor: 'lime'
        }]
      },
      options: {
        plugins: {
          legend: { labels: { color: '#fff' } }
        },
        scales: {
          x: { ticks: { color: '#fff' } },
          y: { ticks: { color: '#fff' } }
        }
      }
    });
  });