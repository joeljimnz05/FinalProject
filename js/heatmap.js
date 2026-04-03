const CELL = 38;
const GAP = 4;
const STEP = CELL + GAP;
const MARGIN = { top: 40, right: 20, bottom: 50, left: 36 };
const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const colorScale = d3.scaleSequential()
  .interpolator(d3.interpolateRgb("#2a0a10", "#e8405a"));

d3.csv("./data/data.csv", d => ({
  date:        new Date(d.date + "T00:00:00"),
  steps:       +d.steps,
  miles:       +d.distance_miles,
  calories:    +d.active_calories,
  flights:     +d.flights_climbed,
  studyHours:  +d.study_work_hours,
  assignments: +d.assignments_completed
})).then(data => {
  drawHeatmap(data);
});

function drawHeatmap(data) {
  const byDate = new Map(data.map(d => [fmtKey(d.date), d]));

  const minDate = d3.min(data, d => d.date);
  const maxDate = d3.max(data, d => d.date);

  colorScale.domain([0, d3.max(data, d => d.steps)]);

  const startOfFirstWeek = d3.timeMonday.floor(minDate);
  const weeks = d3.timeMondays(startOfFirstWeek, d3.timeDay.offset(maxDate, 7));
  const numWeeks = weeks.length;

  const svgWidth  = MARGIN.left + numWeeks * STEP + MARGIN.right;
  const svgHeight = MARGIN.top  + 7 * STEP        + MARGIN.bottom;

  const svg = d3.select("#heatmap")
    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  const g = svg.append("g")
    .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

  DOW_LABELS.forEach((label, i) => {
    g.append("text")
      .attr("class", "dow-label")
      .attr("x", -6)
      .attr("y", i * STEP + CELL / 2 + 4)
      .attr("text-anchor", "end")
      .text(label);
  });


  const monthsSeen = new Set();

  weeks.forEach((weekStart, wi) => {
    const daysInWeek = d3.timeDays(weekStart, d3.timeDay.offset(weekStart, 7));
    const firstOfMonth = daysInWeek.find(d => d.getDate() <= 7);
    if (firstOfMonth) {
      const mo = firstOfMonth.getMonth();
      if (!monthsSeen.has(mo)) {
        monthsSeen.add(mo);
        g.append("text")
          .attr("class", "month-label")
          .attr("x", wi * STEP)
          .attr("y", -10)
          .text(d3.timeFormat("%B")(firstOfMonth));
      }
    }
  });

  weeks.forEach((weekStart, wi) => {
    for (let dow = 0; dow < 7; dow++) {
      const cellDate = d3.timeDay.offset(weekStart, dow);
      if (cellDate < d3.timeDay.floor(minDate) || cellDate > maxDate) continue;

      const key = fmtKey(cellDate);
      const d   = byDate.get(key);

      g.append("rect")
        .attr("class", "day-cell")
        .attr("x", wi * STEP)
        .attr("y", dow * STEP)
        .attr("width", CELL)
        .attr("height", CELL)
        .attr("rx", 3)
        .attr("fill", d ? colorScale(d.steps) : "#1e1e1e")
        .on("click", () => { if (d) showDetail(d); });
    }
  });

  const legendW = 140;
  const legendX = numWeeks * STEP - legendW;
  const legendY = 7 * STEP + 16;

  const defs = svg.append("defs");
  const grad = defs.append("linearGradient").attr("id", "legend-grad");

  grad.append("stop").attr("offset", "0%").attr("stop-color", "#2a0a10");
  grad.append("stop").attr("offset", "100%").attr("stop-color", "#e8405a");

  const lg = g.append("g").attr("transform", `translate(${legendX},${legendY})`);
  lg.append("rect").attr("width", legendW).attr("height", 8).attr("rx", 2).attr("fill", "url(#legend-grad)");
  lg.append("text").attr("class", "legend-label").attr("y", 20).text("0 steps");
  lg.append("text").attr("class", "legend-label").attr("x", legendW).attr("y", 20).attr("text-anchor", "end")
    .text(d3.max(data, d => d.steps).toLocaleString() + " steps");
}

function showDetail(d) {
  document.getElementById("day-detail").classList.remove("hidden");
  document.getElementById("detail-date").textContent = d3.timeFormat("%A, %B %-d, %Y")(d.date);
  document.getElementById("d-steps").textContent   = d.steps.toLocaleString();
  document.getElementById("d-miles").textContent   = d.miles.toFixed(2);
  document.getElementById("d-cal").textContent     = Math.round(d.calories).toLocaleString();
  document.getElementById("d-flights").textContent = d.flights;
  document.getElementById("d-study").textContent   = d.studyHours;
  document.getElementById("d-assign").textContent  = d.assignments;
}

document.getElementById("close-detail").addEventListener("click", () => {
  document.getElementById("day-detail").classList.add("hidden");
});

function fmtKey(date) {
  return d3.timeFormat("%Y-%m-%d")(date);
}