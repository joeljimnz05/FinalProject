import { highlightDay } from "./linechart";
import * as d3 from "d3";

const CELL = 38;
const GAP = 4;
const STEP = CELL + GAP;
const MARGIN = { top: 40, right: 20, bottom: 50, left: 32 };
const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const colorScale = d3.scaleSequential()  
.interpolator(d3.interpolateRgb("#2a0a10", "#e8405a"));

export function drawHeatmap(data) {
  const byDate = new Map(data.map(d => [fmtKey(d.date), d]));

  const strokeScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.assignments)])
  .range([0, 4])
  .clamp(true);

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
    const firstOfMonth = daysInWeek.find(d => d.getDate() <= 14);
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
        .attr("stroke", d && d.assignments > 0 ? "#f0c040" : "none")
        .attr("stroke-width", d ? strokeScale(d.assignments) : 0)
        .on("click", () => { if (d) {

          highlightDay(d.date);
          showDetail(d); }});
    }
  });

const legendW = 140;
const legendX = numWeeks * STEP - legendW;
const legendY = 7 * STEP + 16;

const assignLegendX = MARGIN.left;
const assignLegendY = legendY + MARGIN.top - 24;

const al = g.append("g").attr("transform", `translate(0,${legendY})`);
[0, 1, 3, 5].forEach((val, i) => {
  al.append("rect")
    .attr("x", i * 36)
    .attr("y", 0)
    .attr("width", 14)
    .attr("height", 14)
    .attr("rx", 2)
    .attr("fill", "#1e1e1e")
    .attr("stroke", val > 0 ? "#f0c040" : "#333")
    .attr("stroke-width", strokeScale(val));
  al.append("text")
    .attr("class", "legend-label")
    .attr("x", i * 36 + 7)
    .attr("y", 26)
    .attr("text-anchor", "middle")
    .text(val === 0 ? "0" : val === 5 ? "5+" : val);
});
al.append("text")
  .attr("class", "legend-label")
  .attr("x", 0)
  .attr("y", 38)
  .text("Assignments completed (border thickness)");



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