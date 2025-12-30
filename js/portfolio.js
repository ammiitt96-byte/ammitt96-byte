const SHEET_URL =
"https://docs.google.com/spreadsheets/d/1jpR2_9X8QAPErcKe80hnmeI6ztw1ctzh4wE6cQ0njLA/gviz/tq?tqx=out:json";

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

    initMonths(rows);
    drawDashboard(rows);
  })
  .catch(err => console.error("FETCH ERROR:", err));

/* -------- HELPERS ---------- */

function formatDate(d) {
  // Google Date(YYYY,MM,DD)
  if (typeof d === "string" && d.startsWith("Date")) {
    const parts = d.match(/\d+/g);
    const date = new Date(parts[0], parts[1], parts[2]);
    return date.toLocaleDateString("en-IN");
  }
  return d;
}

/* -------- DASHBOARD ---------- */

function drawDashboard(data) {
  const totalPL = data.reduce((a,b)=>a+b.pl,0);
  const capital = data[0].capital;

  capitalCard.innerHTML = `Capital<br><b>₹${capital}</b>`;
  profitCard.innerHTML = `Net P/L<br><b>₹${totalPL}</b>`;
  withdrawCard.innerHTML = `Withdrawals<br><b>₹50,000</b>`;
  balanceCard.innerHTML = `End Balance<br><b>₹${capital + totalPL}</b>`;

  drawEquity(data);
  drawPLBars(data);
  drawWinRate(data);
}

/* -------- CHARTS ---------- */

function drawEquity(data) {
  let cum = 0;
  const equity = data.map(d => cum += d.pl);

  new Chart(equityChart, {
    type: "line",
    data: {
      labels: data.map(d=>d.date),
      datasets: [{
