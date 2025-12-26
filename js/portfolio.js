const SHEET_URL =
"https://docs.google.com/spreadsheets/d/1jpR2_9X8QAPErcKe80hnmeI6ztw1ctzh4wE6cQ0njLA/tq?tqx=out:json";

fetch(SHEET_URL)
.then(res => res.text())
.then(text => {
  const json = JSON.parse(text.substring(47).slice(0, -2));
  const rows = json.table.rows.map(r => ({
    date: r.c[0]?.v,
    month: r.c[1]?.v,
    capital: r.c[2]?.v,
    pl: r.c[3]?.v,
    used: r.c[4]?.v,
    image: r.c[7]?.v,
    roi: r.c[8]?.v
  }));
  initMonths(rows);
});

function initMonths(data) {
  const months = [...new Set(data.map(d => d.month))];
  const select = document.getElementById("monthSelect");

  months.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.innerText = m;
    select.appendChild(opt);
  });

  select.onchange = () => renderMonth(data, select.value);
  renderMonth(data, months[0]);
}

function renderMonth(data, month) {
  const mData = data.filter(d => d.month === month);

  const totalPL = mData.reduce((a,b)=>a+b.pl,0);
  const avgROI = (mData.reduce((a,b)=>a+b.roi,0)/mData.length).toFixed(2);

  document.getElementById("capitalCard").innerText =
    `Capital: ₹${mData[0].capital}`;

  document.getElementById("plCard").innerText =
    `Profit/Loss: ₹${totalPL}`;

  document.getElementById("roiCard").innerText =
    `Avg ROI: ${avgROI}%`;

  drawChart(mData);
  showImages(mData);
  analysis(totalPL, avgROI);
}

let chart;
function drawChart(data) {
  if(chart) chart.destroy();

  chart = new Chart(document.getElementById("plChart"), {
    type: "line",
    data: {
      labels: data.map(d=>d.date),
      datasets: [{
        label: "Profit/Loss",
        data: data.map(d=>d.pl),
        borderWidth: 2
      }]
    }
  });
}

function showImages(data) {
  const div = document.getElementById("tradeImages");
  div.innerHTML = "";
  data.forEach(d => {
    if(d.image) div.innerHTML += `<img src="${d.image}">`;
  });
}

function analysis(pl, roi) {
  document.getElementById("analysisBox").innerText =
    pl > 0
    ? `Profitable month with ${roi}% ROI using disciplined strategies.`
    : `Loss month. Risk optimization required.`;
}

