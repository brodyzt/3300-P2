const buildGraph = async () => {


    const game_data = await d3.csv("games.csv");
    const bar_graph_data = await d3.json("stacked_bar_data.json");

    /* Configure padding around graph */
    let stackBarPadding = {
        top: 100,
        bottom: 100,
        left: 100,
        right: 100,
        betweenLegend: -250
    }


    let stackBarContainerSvgWidth = 1200;
    let stackBarContainerSvgHeight = 800;

    let stackBarContainerSvg = d3.select("svg#stackedBar")
        .attr("viewBox", "0 0 " + stackBarContainerSvgWidth + " " + stackBarContainerSvgHeight)
        .classed("svg-content", true);

    let stackBarWidth = stackBarContainerSvgWidth - stackBarPadding.left - stackBarPadding.right;
    let stackBarHeight = stackBarContainerSvgHeight - stackBarPadding.top - stackBarPadding.bottom;

    let stackBarSvg = stackBarContainerSvg.append("g")
        .attr("transform", "translate(" + (stackBarContainerSvgWidth / 2.0 - stackBarWidth / 2.0) + "," + stackBarPadding.top + ")");




    /* Creating legend for colors */
    // let stackBarLegendHeight = stackBarHeight / 4;
    // let stackBarLegendWidth = 200;
    // let stackBarLegendInset = 725;

    /* Add SVG grouping element for legend */
    // let stackBarLegend = stackBarSvg.append("g")
    //     .attr("class", "legend")
    //     .attr("width", stackBarLegendWidth)
    //     .attr("height", stackBarLegendHeight)
    //     .attr("transform", "translate(" + stackBarLegendInset + "," + (0) +
    //         ")");

    /* Add an item for each category to the legend */
    // stackBarTestNames.reverse().forEach((testName, index) => {

    //     /* Adding SVG grouping element for each category */
    //     let stackBarCurrentLegendItem = stackBarLegend.append("g")
    //         .attr("class", "legend-item")
    //         .attr("width", stackBarLegendWidth)
    //         .attr("transform", "translate(0," +
    //             (index * stackBarLegendHeight / (stackBarTestNames.length * 1.0)) +
    //             ")");

    //     /* Add rect sample color for category */
    //     stackBarCurrentLegendItem.append("rect")
    //         .attr("width", "20")
    //         .attr("height", "20")
    //         .attr("id", testName)
    //         .style("fill", stackBarColorScale[Math.floor((stackBarTestNames.length - 1 - index) / 2.0)])
    //         .style("opacity", 0.75 - (index % 2) * 0.25)

    //     /* Add description text for category */
    //     stackBarCurrentLegendItem.append("text")
    //         .text(stackBarTestKeyToFullNameDict[testName])
    //         .attr("dx", "25")
    //         .attr("dy", "15")
    //         .attr("id", testName + "_label")
    // });


    function update_attributes(x_attr, y_attr) {
        const x_category = x_attr;
        const y_category = y_attr;

        const data_key = x_category + "_" + y_category;
        // console.log(data_key)

        const graph_data = bar_graph_data[data_key];
        // console.log(graph_data)

        const x_vals = graph_data.map(x => x[0]);
        // console.log(x_vals)

        let stackBarXScale = d3.scaleBand()
            .domain(x_vals)
            .range([0, stackBarWidth])
            .paddingInner(0.1)
            .paddingOuter(0.02);

        let stackBarYScale = d3.scaleLinear()
            .domain([0, 1])
            .range([stackBarHeight, 0]);

        /* Create axis SVG components */
        let stackBarXAxis = d3.axisBottom()
            .scale(stackBarXScale)
            .tickSize(-10)
        let stackBarYAxis = d3.axisLeft()
            .scale(stackBarYScale)
            .tickSize(10)

        /* Append axis SVG components to DOM */
        let stackBarXAxisSVGComponent = stackBarSvg.append("g")
            .attr("transform", "translate(0," + (stackBarHeight) + ")")
            .attr("class", "x")
            .call(stackBarXAxis)

        let stackBarYAxisSVGComponent = stackBarSvg.append("g")
            .attr("transform", "translate(0,0)")
            .attr("class", "y")
            .call(stackBarYAxis);

        stackBarXAxisSVGComponent.selectAll(".tick line").attr("stroke", "#000000").attr("transform", "translate(0,10)")
        stackBarXAxisSVGComponent.selectAll(".tick text").attr("y", 10).attr("dx", 0);


        stackBarYAxisSVGComponent.selectAll(".tick:not(first-of-type) line")
            .attr("stroke", "#000000")
            .attr('stroke-width', '2px')
            .attr("transform", "translate(0,-0.5)")
        stackBarYAxisSVGComponent.selectAll(".tick text").attr("y", 0).attr("dx", 0);

        /* Add left edge for x axis */
        stackBarSvg.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", 0)
            .attr("y2", stackBarHeight)
            .attr("stroke", "#000000")
            .attr("stroke-width", "2px")
            .attr("class", "yAxisBoundary")

        /* Add left edge for y axis */
        stackBarSvg.append("line")
            .attr("x1", 0)
            .attr("x2", stackBarWidth)
            .attr("y1", stackBarHeight)
            .attr("y2", stackBarHeight)
            .attr("stroke", "#000000")
            .attr("stroke-width", "2px")
            .attr("class", "yAxisBoundary")


        /* Add axes labels */
        stackBarContainerSvg.append("text").
        attr("transform", "translate(" + (stackBarPadding.left + stackBarWidth / 2.0) + "," + (stackBarPadding.top + stackBarHeight + stackBarPadding.bottom / 2.0) + ")")
            .style("text-anchor", "middle")
            .attr("class", "axesLabel")
            .text("Year")
        stackBarContainerSvg.append("text")
            .attr("transform", "translate(" + (stackBarPadding.left / 2.0 - 10) + "," + (stackBarHeight / 2.0 + stackBarPadding.top) + ")rotate(270)")
            .style("text-anchor", "middle")
            .attr("class", "axesLabel")
            .text("Percentage In Category")


        // Remove domain components garbage
        d3.selectAll("path.domain").remove();

        /* Add Data to graph */
        let stackBarColorScale = d3.schemeCategory10;
        let verticalSpacing = 1;

        graph_data
            .forEach((x_category) => {
                x_val = x_category[0];
                b_counts = x_category[1];

                var currentY = stackBarHeight;

                b_counts.forEach((b_category, index) => {
                    category_name = b_category[0];
                    subcategory_count = b_category[1];
                    let barTopY = stackBarYScale(subcategory_count);
                    let height = stackBarHeight - barTopY;
                    stackBarSvg.append("rect")
                        .attr("width", stackBarXScale.bandwidth)
                        .attr("height", Math.max(height - verticalSpacing, 0))
                        .attr("x", stackBarXScale(x_val))
                        .attr("y", barTopY - stackBarHeight + currentY)
                        .style("fill", stackBarColorScale[index])
                        .style("opacity", 0.75 - (index % 2) * 0.25)

                    currentY -= height;
                })

            });
    }

    param1_select.addEventListener("change", function () {
        update_attributes(param1_select.value, param2_select.value);
    });
    param2_select.addEventListener("change", function () {
        update_attributes(param1_select.value, param2_select.value);
    });
}

buildGraph();

const x_categories = ["Platform", "Genre"]
const y_categories = ["Platform", "Genre", "Year"]


var param1_select = document.getElementById("graph1param1");
var param2_select = document.getElementById("graph1param2");

x_categories.forEach(category => {
    const option = document.createElement("option");
    option.text = category;
    param1_select.add(option);
})

y_categories.forEach(category => {
    const option = document.createElement("option");
    option.text = category;
    param2_select.add(option);
})