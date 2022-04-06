import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { attempt } from '../game/progressSlice';

interface chartProps {
    attempts: Array<attempt>,
    width: number,
    height: number,
}

function hslToHex(h: number, s: number, l: number) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

const nColours = 5;
const colours = Array(nColours).fill(0).map((_e, i) => hslToHex(Math.floor(i/nColours*359), 100, 50));

export function ExpertiseChart({ 
    attempts,
    width,
    height,
 }: chartProps) {
    const marginLeft = 30;
    const marginRight = 30;
    const marginTop = 10;
    const marginBottom = 20;

    const ref = useRef(null);

    useEffect(() => {
        const svg = d3.select(ref.current);
        // Clear old data
        svg.selectAll("path").remove();
        svg.selectAll("g").remove();
        svg.selectAll("text").remove();
        svg.selectAll("rect").remove();

        if (attempts === undefined) {


            return;
        }

        const scaleX = d3.scaleLinear()
            .domain([0, attempts.length + 1])
            .range([marginLeft, width - marginRight]);
        const scaleY = d3.scaleLinear()
            .domain([0, 1])
            .range([height - marginBottom, marginTop])
        const HPBarScaleX = d3.scaleBand()
            .domain(attempts.map((_e, i) => i.toString()))
            .range([ marginLeft, width - marginRight ])
            .padding(0.2);
        const HPBarScaleY = d3.scaleLinear()
            .domain([0, d3.max(attempts, d => d3.max([d.playerHP, d.bossHP]))] as [number, number])
            .range([height - marginBottom, marginTop])

        const playerHPs = attempts.map((e, i) => [i+1, e.playerHP < 0 ? 0 : e.playerHP]);

        svg.selectAll("playerHPBar")
            .data(playerHPs)
            .enter()
            .append("rect")
              .attr("x", d => scaleX(d[0]) - HPBarScaleX.bandwidth()/2)
              .attr("y", d => HPBarScaleY(d[1]))
              .attr("width", HPBarScaleX.bandwidth())
              .attr("height", d => (height - marginBottom) - HPBarScaleY(d[1]))
              .attr("fill", "#00B51A")
              .attr("opacity", 0.5);

        const bossHPs = attempts.map((e, i) => [i+1, e.bossHP]);

        svg.selectAll("bossHPBar")
            .data(bossHPs)
            .enter()
            .append("rect")
              .attr("x", d => scaleX(d[0]) - HPBarScaleX.bandwidth()/2)
              .attr("y", d => HPBarScaleY(d[1]))
              .attr("width", HPBarScaleX.bandwidth())
              .attr("height", d => (height - marginBottom) - HPBarScaleY(d[1]))
              .attr("fill", "#D12124")
              .attr("opacity", 0.5);

        const line = d3.line()
            .x(d => scaleX(d[0]))
            .y(d => scaleY(d[1]));

        if (attempts.length > 0) {
            for (let j=0; j < attempts[attempts.length-1].expertise.length; j++) {
                const data = attempts.map((attempt, i) => {
                    if (j >= attempt.expertise.length) {
                        return [i+1, 0];
                    }
                    const attack = Object.keys(attempt.expertise[j])[0];
                    return [i+1, attempt.expertise[j][attack]]
                }) as Array<[number, number]>;

                svg.append("path")
                .attr("fill", "none")
                .attr("stroke", colours[j])
                .attr("stroke-width", 1.5)
                .attr("d", line(data));
            }
        }

        svg.append("g")
            .attr("transform", `translate(0, ${height - marginBottom})`)
            .call(d3.axisBottom(scaleX)
                .tickValues(scaleX.ticks().filter(tick => Number.isInteger(tick)))
                .tickFormat(d3.format('d'))
            );
        svg.append("g")
            .attr("transform", `translate(${marginLeft}, 0)`)
            .call(d3.axisLeft(scaleY));
        svg.append("g")
            .attr("transform", `translate(${width - marginRight}, 0)`)
            .call(d3.axisRight(HPBarScaleY));
    }, [attempts, width, height])

    return (
        <svg ref={ref} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>

        </svg>
    );
}