var svgWidth = 800; 
var svgHeight = 600;

var chartMargin = {
    top: 25,
    right: 25,
    bottom: 90,
    left: 90
};

var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// var circleTextGroup=""

var svg = d3
    .select('#scatter')
    .append('svg')
    .attr('height', svgHeight)
    .attr('width', svgWidth);

var chartGroup = svg.append("g")
    .attr("transform",`translate(${chartMargin.left}, ${chartMargin.top})`);

var chosenXAxis = 'age';
var chosenYAxis = 'obesity';

function xScale(data, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.9,
                d3.max(data, d => d[chosenXAxis]) * 1.1
        ])
        .range([0,chartWidth]);
    
    return xLinearScale;
}

function yScale(data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.9,
            d3.max(data, d => d[chosenYAxis]) * 1.1
        ])
        .range([chartHeight,0]);
    
    return yLinearScale;
}

function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(500)
        .call(bottomAxis);

    return xAxis;
}

function renderYAxis(newYScale, yAxis){
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(500)
        .call(leftAxis);

    return yAxis;
}

function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
    .duration(500)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

function renderCircleText(circleTextGroup, newXscale, chosenXAxis, newYScale, chosenYAxis) {
    circleTextGroup.transition()
    .duration(500)
    .attr("x", d => newXscale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis])+5);

    return circleTextGroup;
}

function updateToolTip(chosenXAxis, chosenYAxis ,circlesGroup) {
    var xlabel;
    var ylabel;
    // Set the x axis label based on chosen x axis value
    if (chosenXAxis === 'age') {
        xlabel = 'Age (Median)';
    } else if (chosenXAxis === 'poverty'){
        xlabel = 'In Poverty (%)';
    } else {
        xlabel = 'Income ($, Median)';
    }
    // Set the y axis label based on chosen y axis value
    if (chosenYAxis === 'obesity') {
        ylabel = 'Obesity (%)';
    } else if (chosenYAxis === 'smokes') {
        ylabel = 'Smokes (%)'
    } else {
        ylabel = "Lacks Healthcare (%)"
    }

    var toolTip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0,-70])
        .html(function(d) {
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`)
        })

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        })
    
    return circlesGroup;
}

// Get data, and then run everything below
d3.csv('./static/data/data.csv').then(function(data, err){
    if (err) throw err; 

    console.log(data)

    data.forEach(function(data){
        data.age = +data.age
        data.ageMoe = +data.ageMoe
        data.healthcare = +data.healthcare
        data.healthcareHigh = +data.healthcareHigh
        data.healthcareLow = +data.healthcareLow
        data.income = +data.income
        data.incomeMoe = +data.incomeMoe
        data.obesity = +data.obesity
        data.obesityHigh = +data.obesityHigh
        data.obesityLow = +data.obesityLow
        data.poverty = +data.poverty
        data.povertyMoe = +data.povertyMoe
        data.smokes = +data.smokes
        data.smokesHigh = +data.smokesHigh
        data.smokesLow = +data.smokesLow
    });

    var xLinearScale = xScale(data,chosenXAxis);

    var yLinearScale = yScale(data, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append('g')
        .classed('x-axis', true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append('g')
        .classed('y-axis', true)
        .call(leftAxis);

    var circleTextGroup=chartGroup.selectAll(".stateText")
        .data(data);

        circleTextGroup.enter()
            .append("text")
            .classed("stateText", true)
            .merge(circleTextGroup)
            .attr("x", d=>xLinearScale(d[chosenXAxis]))
            .attr("y", d=>yLinearScale(d[chosenYAxis])+5)
            .html(d => d.abbr);
        
        circleTextGroup.exit().remove();

    function updateCircleTextGroup(data) {
        circleTextGroup = chartGroup.selectAll(".stateText")
        .data(data);

        circleTextGroup.enter()
            .append("text")
            .classed("stateText", true)
            .merge(circleTextGroup)
            // .attr("x", d => xLinearScale(d[chosenXAxis]))
            // .attr("y", d => yLinearScale(d[chosenYAxis])+5)
            .html(d => d.abbr);

        circleTextGroup.exit().remove();

        return circleTextGroup
    }
    // updateCircleTextGroup(data)
    
        // .data(data)
        //     .attr("x", d => xLinearScale(d[chosenXAxis]))
        //     .attr("y", d => yLinearScale(d[chosenYAxis])+5)
        
    console.log(circleTextGroup)

    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
            .enter()
            .append("circle")
            .attr("cx", d=>xLinearScale(d[chosenXAxis]))
            .attr("cy", d=>yLinearScale(d[chosenYAxis]))
            .attr("r", 10)
            .attr("fill", "blue")
            .attr("opacity", "0.5")
            .classed("stateCircle", true)

    var xlabelsGroup = chartGroup.append('g')
        .attr("transform", `translate(${chartWidth /2}, ${chartHeight + 20})`);
    
    var povertyLabel = xlabelsGroup.append("text")
        .attr("x",0)
        .attr('y', 20)
        .attr("value", "poverty")
        .classed("inactive", true)
        .text("In Poverty (%)");
    
    var ageLabel = xlabelsGroup.append("text")
        .attr("x",0)
        .attr('y', 40)
        .attr("value", "age")
        .classed("active", true)
        .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x",0)
        .attr('y', 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Income ($, Median)");

    var ylabelsGroup = chartGroup.append('g')
        .attr("transform", `translate(0, ${chartHeight/2})`);
    
    var obesityLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x",0)
        .attr('y', -70)
        .attr("value", "obesity")
        .classed("active", true)
        .text("Obese (%)");
    
    var smokesLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x",0)
        .attr('y', -50)
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

    var healthcareLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x",0)
        .attr('y', -30)
        .attr("value", "healthcare")
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");

    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    xlabelsGroup.selectAll("text")
        .on('click', function() {
            var value  = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                chosenXAxis = value;

                xLinearScale = xScale(data, chosenXAxis);

                xAxis = renderXAxis(xLinearScale, xAxis);

                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                circleTextGroup = renderCircleText(updateCircleTextGroup(data), xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("inactive", true)
                        .classed("active", false);
                    incomeLabel
                        .classed("inactive", true)
                        .classed("active", false);
                } else if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("inactive", true)
                        .classed("active", false);
                    incomeLabel
                        .classed("inactive", true)
                        .classed("active", false);
                } else {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("inactive", true)
                        .classed("active", false);
                    ageLabel
                        .classed("inactive", true)
                        .classed("active", false);
                }
            }
        })

    ylabelsGroup.selectAll("text")
        .on('click', function() {
            var value  = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                chosenYAxis = value;

                yLinearScale = yScale(data, chosenYAxis);

                yAxis = renderYAxis(yLinearScale, yAxis);

                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                circleTextGroup = renderCircleText(updateCircleTextGroup(data), xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                if (chosenYAxis === "obesity") {
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("inactive", true)
                        .classed("active", false);
                    healthcareLabel
                        .classed("inactive", true)
                        .classed("active", false);
                } else if (chosenYAxis === "smokes") {
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("inactive", true)
                        .classed("active", false);
                    healthcareLabel
                        .classed("inactive", true)
                        .classed("active", false);
                } else {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("inactive", true)
                        .classed("active", false);
                    smokesLabel
                        .classed("inactive", true)
                        .classed("active", false);
                }
            }
    })
}).catch(function(error){
    console.log(error);
});