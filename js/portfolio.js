const SHEET_URL =
"https://docs.google.com/spreadsheets/d/1jpR2_9X8QAPErcKe80hnmeI6ztw1ctzh4wE6cQ0njLA/gviz/tq?tqx=out:json&nocache=" + Date.now();

let chart;
let allData = [];

fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));

    allData = json.table.rows
      .filter(r => r.c && r.c[0])
      .map(r => {
        const d = parseDate(r.c[0].v);
        return {
          year: d.getFullYear(),
          month: d.toLocaleString("en-IN",{month:"short"}),
          date: d,
          pl: Number(r.c[3]?.v) || 0,
          roi: Number(r.c[8]?.v) || 0
        };
      });

    initYears();
  });

function parseDate(d) {
  const p = d.match(/\d+/g);
  return new Date(p[0], p[1], p[2]);
}

/* -------- YEAR SELECT ---------- */
function initYears() {
  const years = [...new Set(allData.map(d => d.year))];
  const select = document.getElementById("yearSelect");

  years.forEach(y => {
    const o = document.createElement("option");
    o.value = y;
    o.textContent = y;
    select.appendChild(o);
  });

  select.onchange = () => renderYear(+select.value);
  renderYear(years[0]);
}

/* -------- RENDER YEAR ---------- */
function renderYear(year) {
  const data = allData.filter(d => d.year === year);

  const months = {};
  data.forEach(d => {
    if (!months[d.month]) months[d.month] = {pl:0, roi:[]};
    months[d.month].pl += d.pl;
    months[d.month].roi.push(d.roi);
  });

  const rows = Object.entries(months).map(([m,v]) => ({
    month:m,
    pl:v.pl,
    roi:(v.roi.reduce((a,b)=>a+b,0)/v.roi.length).toFixed(2)
  }));

  updateSummary(rows);
  drawTable(rows);
  drawChart(rows);
}

/* -------- SUMMARY ---------- */
function updateSummary(rows) {
  const total = rows.reduce((a,b)=>a+b.pl,0);
  const avgR = (rows.reduce((a,b)=>a+Number(b.roi),0)/rows.length).toFixed(2);

  document.getElementById("totalPL").textContent = "₹"+total;
  document.getElementById("avgROI").textContent = avgR+"%";

  const sorted = [...rows].sort((a,b)=>b.pl-a.pl);
  document.getElementById("bestMonth").textContent = sorted[0].month;
  document.getElementById("worstMonth").textContent = sorted.at(-1).month;
}

/* -------- TABLE ---------- */
function drawTable(rows) {
  const tb = document.getElementById("monthTable");
  tb.innerHTML = "";

  rows.forEach(r => {
    tb.innerHTML += `
      <tr>
        <td>${r.month}</td>
        <td class="${r.pl>=0?"profit":"loss"}">₹${r.pl}</td>
        <td>${r.roi}%</td>
      </tr>`;
  });
}

/* -------- CHART ---------- */
function drawChart(rows) {
  if (chart) chart.destroy();

  let cum = 0;
  const equity = rows.map(r => cum += r.pl);

  chart = new Chart(document.getElementById("equityChart"), {
    type:"line",
    data:{
      labels:rows.map(r=>r.month),
      datasets:[{
        data:equity,
        borderColor:"#3ea6ff",
        tension:0.4
      }]
    },
    options:{plugins:{legend:{display:false}}}
  });
}

