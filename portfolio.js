const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbHrZS1_OVARmmc7070aQq2MJHgSXGhacfdNi7LEt8cLHECf0gfi3lgwIsIb0tONGtUB_50bNtOjKa/pub?output=csv";

fetch(sheetURL)
  .then(res => res.text())
  .then(data => {
    const rows = data.split("\n").slice(1);
    const tbody = document.querySelector("#portfolioTable tbody");

    rows.forEach(row => {
      const cols = row.split(",");
      if (cols.length > 4) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${cols[0]}</td>
          <td>${cols[4]}</td>
          <td>${cols[5]}</td>
          <td>${cols[6]}</td>
          <td>${cols[7]}</td>
        `;
        tbody.appendChild(tr);
      }
    });
  })
  .catch(err => console.error("Error fetching sheet:", err));

