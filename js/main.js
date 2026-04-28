import * as d3 from "d3";
import { drawHeatmap } from "./heatmap.js";
import { drawLineChart } from "./linechart.js";
import dataUrl from "url:../static/data.csv";

d3.csv(dataUrl, d => ({
  date:        new Date(d.date + "T00:00:00"),
  steps:       +d.steps,
  miles:       +d.distance_miles,
  calories:    +d.active_calories,
  flights:     +d.flights_climbed,
  studyHours:  +d.study_work_hours,
  assignments: +d.assignments_completed
})).then(data => {
    
  drawHeatmap(data);
  drawLineChart(data);
});