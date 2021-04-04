// var data = []

// d3.csv('./static/data/data.csv').then(function loadData(incoming){
//     data = incoming
//     console.log(data)
// })

var svgWidth = 1000; 
var svgHeight = 750;

var chartMargin = {
    top: 25,
    right: 25,
    bottom: 25,
    left: 25
};

var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

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
        .domain([d3.min(data, d => d[chosenXAxis]),
                d3.max(data, d => d[chosenXAxis])
        ])
        .range([0,chartWidth]);
    
    return xLinearScale;
}

function yScale(data, chosenyAxis) {
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]),
                d3.max(data, d => d[chosenYAxis])
        ])
        .range([0,chartWidth]);
    
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

function updateToolTip(chosenXAxis, chosenYAxis ,circlesGroup) {
    var xlabel;
    var ylabel;
    // Set the x axis label based on chosen x axis value
    if (chosenXAxis === 'age') {
        xlabel = 'Age';
    } else {
        xlabel = 'XAxisNotAnOptionYet';
    }
    // Set the y axis label based on chosen y axis value
    if (chosenYAxis === 'obesity') {
        ylabel = 'Percent Obesity';
    } else {
        ylabel = "YAxisNotAnOptionYet"
    }

    var toolTip = d3.tip()
        .attr('class', 'tooltip')
        .offset([50,-50])
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