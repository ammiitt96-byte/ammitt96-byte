const SHEET_URL =
"https://docs.google.com/spreadsheets/d/1jpR2_9X8QAPErcKe80hnmeI6ztw1ctzh4wE6cQ0njLA/gviz/tq?tqx=out:json";

/* -------- FETCH DATA ---------- */
fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));

    const rows = json.table.rows
      .filter(r => r.c && r.c[0] && r.c[1])
      .map(r => ({
        date: formatDate(r.c[0].v),
        month: r.c[1].v,
        capital: Number(r.c[2]?.v) || 0,
        pl: Number(r.c[3]?.v) || 0,
        used: Number(r.c[4]?.v) || 0,
        strategy: r.c[5]?.v || "",
        image: r.c[7]?.v || "",
        roi: Number(r.c[8]?.v) || 0
      }));

    console.log("FINAL DATA:", rows);

    drawDashboard(rows);
  })
  .catch(err => console.error("FETCH ERROR:", err));

/* -------- HELPERS ---------- */
function formatDate(d) {
  if (typeof d === "string" && d.startsWith("Date")) {
    const p = d.match(/\d+/g);
    return new Date(p[0], p[1], p[2]).toLocaleDateString("en-IN");
  }
  return d;
}

/* -------- DASHBOARD ---------- */
function drawDashboard(data) {
  const totalPL = data.reduce((a,b)=>a+b.pl,0);
  const capital = data[0].capital;

  document.getElementById("capitalCard").innerHTML =
    `Capital<br><b>₹${capital}</b>`;
  document.getElementById("profitCard").innerHTML =
    `Net P/L<br><b>₹${totalPL}</b>`;
  document.getElementById("withdrawCard").innerHTML =
    `Withdrawals<br><b>₹50,000</b>`;
  document.getElementById("balanceCard").innerHTML =
    `End Balance<br><b>₹${capital + totalPL}</b>`;

  drawEquity(data);
}

/* -------- CHART ---------- */
function drawEquity(data) {
  let cum = 0;
  const equity = data.map(d => cum += d.pl);

  new Chart(
    document.getElementById("equityChart"),
    {
      type: "line",
      data: {
        labels: data.map(d => d.date),
        datasets: [{
          label: "Equity Curve",
          data: equity,
          borderColor: "#00ff99",
          tension: 0.4
        }]
      },
      options: {
        plugins: { legend: { display: false } }
      }
    }
  );
}
