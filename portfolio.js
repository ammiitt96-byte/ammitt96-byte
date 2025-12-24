const sheetURL = "https://docs.google.com/spreadsheets/d/1jpR2_9X8QAPErcKe80hnmeI6ztw1ctzh4wE6cQ0njLA/gviz/tq?tqx=out:csv&sheet=Sheet1";

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

