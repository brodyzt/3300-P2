const buildGraph = async () => {


    const game_data = await d3.csv("games.csv");
    const bar_graph_data = await d3.json("stacked_bar_data.json");

    /* Configure padding around graph */
    let stackBarPadding = {
        top: 100,
        bottom: 100,
        left: 100,
        right: 100,
        legendWidth: 200
    }


    let stackBarContainerSvgWidth = 1400;
    let stackBarContainerSvgHeight = 700;


    let stackBarWidth = stackBarContainerSvgWidth - stackBarPadding.left - stackBarPadding.right - stackBarPadding.legendWidth;
    let stackBarHeight = stackBarContainerSvgHeight - stackBarPadding.top - stackBarPadding.bottom;

    let stackBarContainerSvg = d3.select("svg#stackedBar")
        .attr("viewBox", "0 0 " + stackBarContainerSvgWidth + " " + stackBarContainerSvgHeight)
        .classed("svg-content", true);

    stackBarContainerSvg.append("text")
        .attr("transform", "translate(" + (stackBarPadding.left + stackBarWidth / 2.0) + "," + (stackBarPadding.top + stackBarHeight + stackBarPadding.bottom / 2.0) + ")")
        .style("text-anchor", "middle")
        .attr("class", "axesLabel")
        .text("Year");


    let stackBarSvg = stackBarContainerSvg.append("g")
        .attr("transform", "translate(" + stackBarPadding.left + "," + stackBarPadding.top + ")");

    let stackBarContentsSVG = stackBarSvg.append("g");

    let stackBarXAxisSVGComponent = stackBarSvg.append("g");
    let stackBarYAxisSVGComponent = stackBarSvg.append("g");


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


    function reload_attributes() {
        const x_category = param2_select.value;
        const y_category = param1_select.value;

        if (x_category == y_category) {
            return;
        }

        const data_key = y_category + "_" + x_category;
        // console.log(data_key)

        const graph_data = bar_graph_data[data_key][1];
        const columns = bar_graph_data[data_key][0];
        console.log(columns)

        const x_vals = graph_data.map(x => x[x_category]);
        // console.log(graph_data)
        // console.log(graph_data);
        // console.log(x_category)
        // console.log(x_vals);

        let stackBarXScale = d3.scaleBand()
            .domain(x_vals)
            .range([0, stackBarWidth])
            .paddingInner(0.25)
            .paddingOuter(0.25);

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

        // console.log(graph_data[0]["keys"])

        let stackBarStack = d3.stack()
            .keys(columns);

        let series = stackBarStack(graph_data)
        console.log(series)
        series = series.map((d, i) => {
            // console.log(d)
            return d.map(d2 => {
                d2["category"] = columns[i];
                return d2;
            });
        })

        console.log(series)

        // console.log(series)

        /* Append axis SVG components to DOM */
        stackBarXAxisSVGComponent
            .attr("transform", "translate(0," + (stackBarHeight) + ")")
            .attr("class", "x")
            .call(stackBarXAxis)

        stackBarYAxisSVGComponent
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


        /* Add axes labels */
        stackBarContainerSvg.select("text").text(x_category);

        stackBarContainerSvg.append("text")
            .attr("transform", "translate(" + (stackBarPadding.left / 2.0 - 10) + "," + (stackBarHeight / 2.0 + stackBarPadding.top) + ")rotate(270)")
            .style("text-anchor", "middle")
            .attr("class", "axesLabel")
            .text("Percentage In Category")


        // Remove domain components garbage
        d3.selectAll("path.domain").remove();

        /* Add Data to graph */
        // let stackBarColorScale = d3.schemeCategory10;
        let stackBarColorScale = ["#ff0029", "#377eb8", "#66a61e", "#984ea3", "#00d2d5", "#ff7f00", "#af8d00",
            "#7f80cd", "#b3e900", "#c42e60", "#a65628", "#f781bf", "#8dd3c7", "#bebada", "#fb8072",
            "#80b1d3"
        ]
        let verticalSpacing = 1;

        // graph_data
        //     .forEach((x_category) => {
        //         x_val = x_category[0];
        //         b_counts = x_category[1];

        //         var currentY = stackBarHeight;

        //         b_counts.forEach((b_category, index) => {
        //             category_name = b_category[0];
        //             subcategory_count = b_category[1];
        //             let barTopY = stackBarYScale(subcategory_count);
        //             let height = stackBarHeight - barTopY;
        //             stackBarSvg.append("rect")
        //                 .attr("width", stackBarXScale.bandwidth)
        //                 .attr("height", Math.max(height - verticalSpacing, 0))
        //                 .attr("x", stackBarXScale(x_val))
        //                 .attr("y", barTopY - stackBarHeight + currentY)
        //                 .style("fill", stackBarColorScale[index])
        //                 .style("opacity", 0.75 - (index % 2) * 0.25)

        //             currentY -= height;
        //         })

        //     });

        stackBarContentsSVG
            .selectAll("g")
            .data(series)
            .join("g")
            .attr("fill", (_, i) => stackBarColorScale[i])
            .selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("class", function (d, i) {
                console.log(d["category"])
                return d["category"];
            })
            .on("mouseover", d => mouseOverCategory(d["category"]))
            .on("mouseout", d => mouseOutCategory(d["category"]))
            .transition()
            .duration(500)
            .attr("x", function (d) {
                // console.log(d);
                // console.log(d.data[x_category])
                return stackBarXScale(d.data[x_category]);
            })
            .attr("y", function (d) {
                // console.log(d)
                return stackBarYScale(d[1])
            })
            .attr("height", d => stackBarYScale(d[0]) - stackBarYScale(d[1]))
            .attr("width", stackBarXScale.bandwidth)
            .attr("opacity", 0.8)
        // .join("rect")
        // .attr("x", d => stackBarXAxis(d[0]))
        // .attr("y", d => stackBarYAxis(d[1]))
        // .attr("height", d => stackBarYAxis(d[0]))


        function mouseOverCategory(category) {
            d3.select("rect#" + category)
                .transition()
                .duration(100)
                .attr("width", 30)
                .attr("opacity", 1)

            d3.select("text#" + category)
                .transition()
                .duration(100)
                .attr("dx", 35)
                .attr("font-weight", "bold")

            console.log(stackBarXScale)
            console.log(stackBarXScale.bandwidth)
            d3.selectAll("rect." + category)
                .transition()
                .duration(100)
                .attr("width", stackBarXScale.bandwidth() + 10)
                .attr("transform", "translate(-5,0)")
                .attr("opacity", 1);
        }

        function mouseOutCategory(category) {
            d3.select("rect#" + category)
                .transition()
                .duration(100)
                .attr("width", 20)
                .attr("opacity", 0.8)

            d3.select("text#" + category)
                .transition()
                .duration(100)
                .attr("dx", 25)
                .attr("font-weight", "normal")

            d3.selectAll("rect." + category)
                .transition()
                .duration(100)
                .attr("width", stackBarXScale.bandwidth())
                .attr("transform", "translate(0,0)")
                .attr("opacity", .8);
        }

        // add legend

        console.log(series)


        let stackBarLegendHeight = stackBarHeight / 4;
        let stackBarLegendWidth = stackBarPadding.legendWidth;
        let stackBarLegendInset = 1400 - stackBarLegendWidth;
        let legendYOffset = 100;

        var legend = stackBarContainerSvg.append("g")
            .attr("class", "legend")
            .attr("width", stackBarLegendWidth)
            .attr("height", stackBarLegendHeight)
            .attr("transform", "translate(" + stackBarLegendInset + "," + (0) +
                ")");


        columns.forEach((column_val, index) => {

            console.log(stackBarHeight)
            console.log(index)
            console.log(series.length)
            let current_item = legend.append("g")
                .attr("class", "legend-item")
                .attr("width", width / (series.length * 1.0))
                .attr("id", column_val)
                .attr("transform", "translate(0," +
                    (legendYOffset + index * stackBarHeight / (series.length * 2.0)) +
                    ")");


            current_item.append("rect")
                .attr("width", "20")
                .attr("height", "20")
                .attr("id", column_val)
                .attr("opacity", 0.8)
                .style("fill", stackBarColorScale[index])
                .on("mouseover", () => mouseOverCategory(column_val))
                .on("mouseout", () => mouseOutCategory(column_val));

            current_item.append("text")
                .text(column_val)
                .attr("dx", "25")
                .attr("dy", "15")
                .attr("font-size", "10")
                .attr("font-family", "Arial")
                .attr("id", column_val)

        })
    }


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

    param1_select.addEventListener("change", reload_attributes);
    param2_select.addEventListener("change", reload_attributes);

    reload_attributes();
}

buildGraph();

const x_categories = ["Platform", "Publisher", "Genre"]
const y_categories = ["Genre", "Year", "Publisher", "Platform"]


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