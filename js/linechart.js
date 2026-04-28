import * as d3 from "d3";

export function drawLineChart(data) {
  const LM = { top: 20, right: 80, bottom: 40, left: 60 };
  const LW = 900 - LM.left - LM.right;
  const LH = 260 - LM.top - LM.bottom;

  const svg = d3.select("#linechart")
    .attr("viewBox", `0 0 ${LW + LM.left + LM.right} ${LH + LM.top + LM.bottom}`)
    .attr("width", LW + LM.left + LM.right)
    .attr("height", LH + LM.top + LM.bottom);


  svg.append("rect")
    .attr("width", LW + LM.left + LM.right)
    .attr("height", LH + LM.top + LM.bottom)
    .attr("fill", "#0f0f0f");

  const g = svg.append("g")
    .attr("transform", `translate(${LM.left},${LM.top})`);

  const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([0, LW]);

  const ySteps = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.steps)])
    .range([LH, 0]);

  const yAssign = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.assignments)])
    .range([LH, 0]);

  g.append("g")
    .attr("transform", `translate(0,${LH})`)
    .call(d3.axisBottom(xScale).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat("%b")))
    .call(g => g.select(".domain").attr("stroke", "#333"))
    .call(g => g.selectAll(".tick line").attr("stroke", "#333"))
    .selectAll("text")
    .attr("fill", "#888");

  g.append("g")
    .call(d3.axisLeft(ySteps).ticks(5))
    .call(g => g.select(".domain").attr("stroke", "#333"))
    .call(g => g.selectAll(".tick line").attr("stroke", "#333"))
    .selectAll("text")
    .attr("fill", "#888");

  g.append("g")
    .attr("transform", `translate(${LW},0)`)
    .call(d3.axisRight(yAssign).ticks(5))
    .call(g => g.select(".domain").attr("stroke", "#333"))
    .call(g => g.selectAll(".tick line").attr("stroke", "#333"))
    .selectAll("text")
    .attr("fill", "#888");

  const stepsLine = d3.line()
    .x(d => xScale(d.date))
    .y(d => ySteps(d.steps));

  g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#e8405a")
    .attr("stroke-width", 4)
    .attr("opacity", 1)
    .attr("d", stepsLine);

  const assignLine = d3.line()
    .x(d => xScale(d.date))
    .y(d => yAssign(d.assignments));

  g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#f0c040")
    .attr("stroke-width", 4)
    .attr("opacity", 1)
    .attr("d", assignLine);

  g.selectAll(".dot-steps")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot-steps")
    .attr("cx", d => xScale(d.date))
    .attr("cy", d => ySteps(d.steps))
    .attr("r", 3)
    .attr("fill", "#e8405a")
    .attr("opacity", 1);

  g.selectAll(".dot-assign")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot-assign")
    .attr("cx", d => xScale(d.date))
    .attr("cy", d => yAssign(d.assignments))
    .attr("r", 3)
    .attr("fill", "#f0c040")
    .attr("opacity", 5);
}

export function highlightDay(date) {
  const key = d3.timeFormat("%Y-%m-%d")(date);

  d3.selectAll(".dot-steps")
    .attr("r", d => d3.timeFormat("%Y-%m-%d")(d.date) === key ? 6 : 3)
    .attr("stroke", d => d3.timeFormat("%Y-%m-%d")(d.date) === key ? "#fff" : "none")
    .attr("stroke-width", 2)
    .attr("opacity", d => d3.timeFormat("%Y-%m-%d")(d.date) === key ? 1 : 0.5);

  d3.selectAll(".dot-assign")
    .attr("r", d => d3.timeFormat("%Y-%m-%d")(d.date) === key ? 6 : 3)
    .attr("stroke", d => d3.timeFormat("%Y-%m-%d")(d.date) === key ? "#fff" : "none")
    .attr("stroke-width", 2)
    .attr("opacity", d => d3.timeFormat("%Y-%m-%d")(d.date) === key ? 1 : 0.5);
}