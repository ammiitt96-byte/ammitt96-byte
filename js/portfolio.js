const SHEET_URL =
"https://docs.google.com/spreadsheets/d/1jpR2_9X8QAPErcKe80hnmeI6ztw1ctzh4wE6cQ0njLA/gviz/tq?sheet=Sheet1&tqx=out:json";

let allData = [];
let equityChart, rrChart;

fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));

    allData = json.table.rows.map(r => {
      const d = new Date(r.c[0].v);
      return {
        date: d,
        year: d.getFullYear(),
        month: d.toLocaleString("en",{month:"short"}),
        pl: Number(r.c[3]?.v) || 0,
        roi: Number(r.c[8]?.v) || 0
      };
    });

    initYears();
    renderAll();
  });

function initYears(){
  const years = [...new Set(allData.map(d=>d.year))].sort((a,b)=>b-a);
  const select = document.getElementById("yearSelect");
  years.forEach(y=>{
    const o = document.createElement("option");
    o.value = y; o.textContent = y;
    select.appendChild(o);
  });
}

function renderAll(){
  renderSummary();
  drawEquity();
  drawRR();
  drawTable();
}

/* SUMMARY */
function renderSummary(){
  const now = new Date();
  const monthData = allData.filter(d=>d.date.getMonth()===now.getMonth() && d.year===now.getFullYear());
  const yearData = allData.filter(d=>d.year===now.getFullYear());

  setSummary("month", monthData);
  setSummary("year", yearData);
  setSummary("all", allData);
}

function setSummary(type, data){
  const total = data.reduce((a,b)=>a+b.pl,0);
  document.getElementById(type+"PL").textContent = "₹"+total.toFixed(0);

  new Chart(document.getElementById(type+"Pie"),{
    type:"doughnut",
    data:{
      datasets:[{
        data:[Math.abs(total), 100],
        backgroundColor:["#4caf50","#222"],
        borderWidth:0
      }]
    },
    options:{cutout:"75%", plugins:{legend:{display:false}}}
  });
}

/* EQUITY */
function drawEquity(){
  let cum = 0;
  const eq = allData.map(d=>cum+=d.pl);

  equityChart = new Chart(document.getElementById("equityChart"),{
    type:"line",
    data:{
      labels:allData.map(d=>d.month),
      datasets:[{
        data:eq,
        borderColor:"#3ea6ff",
        tension:0.4,
        fill:true,
        backgroundColor:"rgba(62,166,255,0.1)"
      }]
    },
    options:{plugins:{legend:{display:false}}}
  });
}

/* RR */
function drawRR(){
  rrChart = new Chart(document.getElementById("rrChart"),{
    type:"bar",
    data:{
      labels:allData.map(d=>d.month),
      datasets:[{
        data:allData.map(d=>Math.abs(d.pl)),
        backgroundColor:"#2f7ef7"
      }]
    },
    options:{plugins:{legend:{display:false}}}
  });
}

/* TABLE */
function drawTable(){
  const tb = document.getElementById("monthTable");
  tb.innerHTML="";
  allData.forEach(d=>{
    tb.innerHTML+=`
      <tr>
        <td>${d.month}</td>
        <td class="${d.pl>=0?"profit":"loss"}">₹${d.pl}</td>
        <td>${d.roi}%</td>
      </tr>`;
  });
}
