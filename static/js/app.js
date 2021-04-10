// Set variables for the size of the SVG
var svgWidth = 800; 
var svgHeight = 600;

// Set the margins of the chart.  Larger margins on the bottom and left to make room for
// the axes labels.
var chartMargin = {
    top: 25,
    right: 25,
    bottom: 90,
    left: 90
};

// Set the chart width and chart height by using the margins
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// Create the svg element, set height and width
var svg = d3
    .select('#scatter')
    .append('svg')
    .attr('height', svgHeight)
    .attr('width', svgWidth);

// Create a chart group.  Use a transform to position elements relative to the margins
var chartGroup = svg.append("g")
    .attr("transform",`translate(${chartMargin.left}, ${chartMargin.top})`);

// Set default axes for the chart
var chosenXAxis = 'age';
var chosenYAxis = 'obesity';

// Set the min and max x axis scale based on the chosen X axis values
function xScale(data, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.9,
                d3.max(data, d => d[chosenXAxis]) * 1.1
        ])
        .range([0,chartWidth]);
    
    return xLinearScale;
}

// Set the min and max y axis scale based on the chosen Y axis values
function yScale(data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.9,
            d3.max(data, d => d[chosenYAxis]) * 1.1
        ])
        .range([chartHeight,0]);
    
    return yLinearScale;
}

// Render/draw the X axis.  Use a transition to make animated updates to the graph.
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(500)
        .call(bottomAxis);

    return xAxis;
}

// Render/draw the Y axis.  Use a transition to make animated updates to the graph.
function renderYAxis(newYScale, yAxis){
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(500)
        .call(leftAxis);

    return yAxis;
}

// Render the circles group based on the X scale, X axis, Y scale, and Y axis.
// This will center the circles on the X and Y values 
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
    .duration(500)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// Render the state labels based on the X scale, X axis, Y scale, and Y axis.
// This will center the state labels on the X and Y values, with an offset for the Y 
// value to help keep the state abbreviation centered in the circle.
function renderCircleText(circleTextGroup, newXscale, chosenXAxis, newYScale, chosenYAxis) {
    circleTextGroup.transition()
    .duration(500)
    .attr("x", d => newXscale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis])+5);

    return circleTextGroup;
}

// Update the tool tip
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

    // Create a tooltip variable
    var toolTip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0,-85]) //Use an offset so the tool tip doesn't overlap the circle you want to see
        .html(function(d) {  //Add data to the tooltip based on the chosen X and Y axes
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`)
        })

    // Call the tooltip with the circles group
    circlesGroup.call(toolTip);

    // When a circle has a mouseover event, show the tooltip
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        // When a circle has a mouseout event, hide the tooltip
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        })
    
    return circlesGroup;
}

// Get data, and then run everything below
d3.csv('./static/data/data.csv').then(function(data, err){
    if (err) throw err; 

    // Show the data in the console to confirm everything loaded correctly
    console.log(data)

    // Make sure all of the numerical values in the data are interpreted as numbers
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

    // Set the x linear scale using the xScale function
    var xLinearScale = xScale(data,chosenXAxis);

    // Set the y linear scale using the yScale function
    var yLinearScale = yScale(data, chosenYAxis);

    // Set the bottom and left axes using the new X and Y linear scales
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Add an X axis chart group to the SVG
    var xAxis = chartGroup.append('g')
        .classed('x-axis', true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    // Add a Y axis chart group to the SVG
    var yAxis = chartGroup.append('g')
        .classed('y-axis', true)
        .call(leftAxis);

    // Create a circle text group for the state text abbreviations
    var circleTextGroup=chartGroup.selectAll(".stateText")
        .data(data);

        // Step over the text that is already in the graph for the axes labels.
        // Then add new text elements with the stateText class, with x and y locations
        // based on the selected X and Y axes
        // This is set up here to set the initial locations of the circle text group (state abbr)
        circleTextGroup.enter()
            .append("text")
            .classed("stateText", true)
            .merge(circleTextGroup)
            .attr("x", d=>xLinearScale(d[chosenXAxis]))
            .attr("y", d=>yLinearScale(d[chosenYAxis])+5)
            .html(d => d.abbr);
        
        circleTextGroup.exit().remove();

    // Set up a function that will update the circle text group when new axes are selected
    function updateCircleTextGroup(data) {
        circleTextGroup = chartGroup.selectAll(".stateText")
        .data(data);

        circleTextGroup.enter()
            .append("text")
            .classed("stateText", true)
            .merge(circleTextGroup)
            .html(d => d.abbr);

        circleTextGroup.exit().remove();

        return circleTextGroup
    }

    // Create a circles group that creates a new set of circles based on the chosen X and Y axes
    // Set radius to 10px, opacity to 0.5 (so state abbr can show thorugh), and class as stateCircle
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
            .enter()
            .append("circle")
            .attr("cx", d=>xLinearScale(d[chosenXAxis]))
            .attr("cy", d=>yLinearScale(d[chosenYAxis]))
            .attr("r", 10)
            .attr("opacity", "0.5")
            .classed("stateCircle", true)

    // Create x axis labels, and center them at the bottom of the chart
    var xlabelsGroup = chartGroup.append('g')
        .attr("transform", `translate(${chartWidth /2}, ${chartHeight + 20})`);
    
    // Add a label for poverty data on the x Axis
    var povertyLabel = xlabelsGroup.append("text")
        .attr("x",0)
        .attr('y', 20)
        .attr("value", "poverty")
        .classed("inactive", true)
        .text("In Poverty (%)");
    
    // Add a label for age data on the x axis.  Offset to avoid overlapping other labels
    var ageLabel = xlabelsGroup.append("text")
        .attr("x",0)
        .attr('y', 40)
        .attr("value", "age")
        .classed("active", true)
        .text("Age (Median)");

    // Add a label for income data on the x axis.  Offset to avoid overlapping other labels
    var incomeLabel = xlabelsGroup.append("text")
        .attr("x",0)
        .attr('y', 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Income ($, Median)");

    // Create y axis labels.  Set the labels to be halfway up the side of the chart.
    var ylabelsGroup = chartGroup.append('g')
        .attr("transform", `translate(0, ${chartHeight/2})`);
    
    // Add a label for obsesity data on the y axis.  Offset to avoid overlapping the axis and other labels
    var obesityLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x",0)
        .attr('y', -70)
        .attr("value", "obesity")
        .classed("active", true)
        .text("Obese (%)");
    
    // Add a label for smoking data on the y axis.  Offset to avoid overlapping the axis and other labels
    var smokesLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x",0)
        .attr('y', -50)
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

    // Add a label for healthcare data on the y axis.  Offset to avoid overlapping the axis and other labels
    var healthcareLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x",0)
        .attr('y', -30)
        .attr("value", "healthcare")
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");

    // Update the circles group with the latest tooltip by running updateToolTip.  Refer to new
    // chosen X and Y axes
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // Add an event handler for clicking the X axis labels
    xlabelsGroup.selectAll("text")
        .on('click', function() {
            var value  = d3.select(this).attr("value");
            if (value !== chosenXAxis) {  //If you click an axis that's not already active, run the function below
                
                // Set a new X axis value based on selection
                chosenXAxis = value;

                // Set a new xLinearScale based on the chosen X axis value
                xLinearScale = xScale(data, chosenXAxis);

                // Render a new x axis (which includes transition) based on the new linear scale
                xAxis = renderXAxis(xLinearScale, xAxis);

                // Render new circles based on the new X axis selection and the current Y axis
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Render a new circle text group (state abbr) based on the newly selected X axis and the current Y axis
                circleTextGroup = renderCircleText(updateCircleTextGroup(data), xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Update the tooltip to reflect the data from the chosen X and Y axes
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // Set the class for the labels on the X axis based on the selected axis
                // This will change the highlight color of the axes
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

    // Create an event handler for when a new Y axis is clicked
    ylabelsGroup.selectAll("text")
        .on('click', function() {
            var value  = d3.select(this).attr("value");
            if (value !== chosenYAxis) {  //If the selected Y axis is not the current Y axis, run the function below
                
                // Update the chosen Y axis to the clicked value
                chosenYAxis = value;

                // Update the Y linear scale based on the chosen Y axis
                yLinearScale = yScale(data, chosenYAxis);

                // Render the Y axis based on the new yLinearScale
                yAxis = renderYAxis(yLinearScale, yAxis);

                // Render a new circles group based on the newly selected Y axis and current X axis
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Render a new circle text group (state abbr) based on the newly selected Y axis and current X axis
                circleTextGroup = renderCircleText(updateCircleTextGroup(data), xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Update the tooltip in the circles group based on the chosen X and Y axes
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // Change the class of each of the y axis labels based on the selection.  The selected axis becomes "active" and other axes become "inactive"
                // This will make the selected axis bold and other axes will have a fainter stroke
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
}).catch(function(error){  //If there are any errors for loading the data, print those errors to the console
    console.log(error);
});