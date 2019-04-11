const buildGraph = async () => {


    const game_data = await d3.csv("games.csv");
    const bar_graph_data = await d3.json("stacked_bar_data.json");

    /* Configure padding around graph */
    let stackBarPadding = {
        top: 100,
        bottom: 100,
        left: 150,
        right: 25,
        legendPadding: 50,
        legendWidth: 250
    }


    let stackBarContainerSvgWidth = 1400;
    let stackBarContainerSvgHeight = 700;


    let stackBarWidth = stackBarContainerSvgWidth - stackBarPadding.left - stackBarPadding.right - stackBarPadding.legendWidth - stackBarPadding.legendPadding;
    let stackBarHeight = stackBarContainerSvgHeight - stackBarPadding.top - stackBarPadding.bottom;

    let stackBarContainerSvg = d3.select("svg#stackedBar")
        .attr("viewBox", "0 0 " + stackBarContainerSvgWidth + " " + stackBarContainerSvgHeight)
        .classed("svg-content", true);

    stackBarContainerSvg.append("text")
        .attr("transform", "translate(" + (stackBarPadding.left + stackBarWidth / 2.0) + "," + (stackBarPadding.top + stackBarHeight + stackBarPadding.bottom / 2.0 + 20) + ")")
        .style("text-anchor", "middle")
        .attr("class", "axesLabel")
        .text("Year")
        .style("font-family", "sans-serif")
        .style("font-size", "30px");


    let stackBarSvg = stackBarContainerSvg.append("g")
        .attr("transform", "translate(" + stackBarPadding.left + "," + stackBarPadding.top + ")");

    let stackBarContentsSVG = stackBarSvg.append("g");

    let stackBarXAxisSVGComponent = stackBarSvg.append("g");
    let stackBarYAxisSVGComponent = stackBarSvg.append("g");

    function reload_attributes() {
        const x_category = param2_select.value;
        const y_category = param1_select.value;

        if (x_category == y_category) {
            return;
        }

        const data_key = y_category + "_" + x_category;

        const graph_data = bar_graph_data[data_key][1];
        const columns = bar_graph_data[data_key][0].slice(0, 10);

        const x_vals = graph_data.map(x => x[x_category]);

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
            .tickFormat(d => {
                d = d * 100;
                return String(d) + "%"
            })

        let stackBarStack = d3.stack()
            .keys(columns);

        let series = stackBarStack(graph_data)
        series = series.map((d, i) => {
            return d.map(d2 => {
                d2["category"] = columns[i];
                return d2;
            });
        })


        /********************************* Create X and Y axes for graph *****************************/

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
        stackBarXAxisSVGComponent.selectAll(".tick text").attr("y", 20).attr("dx", 0).attr("font-size", "20px");


        stackBarYAxisSVGComponent.selectAll(".tick:not(first-of-type) line")
            .attr("stroke", "#000000")
            .attr('stroke-width', '2px')
            .attr("transform", "translate(0,-0.5)")
        stackBarYAxisSVGComponent.selectAll(".tick text").attr("y", 0).attr("dx", -5).attr("font-size", "20px");


        /* Add axes labels */
        stackBarContainerSvg.select("text").text(x_category);

        stackBarContainerSvg.append("text")
            .attr("transform", "translate(" + (stackBarPadding.left / 2.0 - 10) + "," + (stackBarHeight / 2.0 + stackBarPadding.top) + ")rotate(270)")
            .style("text-anchor", "middle")
            .attr("class", "axesLabel")
            .text("Percentage In Category")
            .style("font-family", "sans-serif")
            .style("font-size", "30px");


        /* Remove domain components garbage */
        d3.selectAll("path.domain").remove();

        /*******************************************************************************/

        /************************** Create functions to indicate which value is being hovered over *********************************/

        /* Modifies elements to highlight the selected category */
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

            d3.selectAll("rect." + category)
                .transition()
                .duration(100)
                .attr("width", stackBarXScale.bandwidth() * 1.1)
                .attr("transform", "translate(-" + (stackBarXScale.bandwidth() * 0.05) + ",0)")
                .attr("opacity", 1);
        }

        /* Resets elements back to normal after mouse leaves */
        function mouseOutCategory(category) {
            d3.select("rect#" + category)
                .transition()
                .duration(100)
                .attr("width", 20)
                .attr("opacity", 0.75)

            d3.select("text#" + category)
                .transition()
                .duration(100)
                .attr("dx", 25)
                .attr("font-weight", "normal")

            d3.selectAll("rect." + category)
                .transition()
                .duration(100)
                .attr("width", Math.round(stackBarXScale.bandwidth()))
                .attr("transform", "translate(0,0)")
                .attr("opacity", .75);
        }
        /************************************************************************************************/

        
        let stackBarColorScale = ["#ff0029", "#377eb8", "#66a61e", "#984ea3", "#00d2d5", "#ff7f00", "#af8d00",
            "#7f80cd", "#b3e900", "#c42e60", "#a65628", "#f781bf", "#8dd3c7", "#bebada", "#fb8072",
            "#80b1d3"
        ]

        stackBarContentsSVG
            .selectAll("g")
            .data(series)
            .join("g")
            .attr("fill", (_, i) => stackBarColorScale[i])
            .selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("class", function (d, i) {
                return "_" + d["category"].replace(/\ /g, "");
            })
            .on("mouseover", d => mouseOverCategory("_" + d["category"].replace(/\ /g, "")))
            .on("mouseout", d => mouseOutCategory("_" + d["category"].replace(/\ /g, "")))
            .transition()
            .duration(500)
            .attr("x", function (d) {
                return Math.round(stackBarXScale(d.data[x_category]));
            })
            .attr("y", function (d) {
                return stackBarYScale(d[1])
            })
            .attr("height", d => stackBarYScale(d[0]) - stackBarYScale(d[1]))
            .attr("width", Math.round(stackBarXScale.bandwidth()))
            .attr("opacity", 0.75);



        /**************** Update legend with new values ***************/
        let legendYOffset = 200;

        let legend_items = legend.selectAll("g")
            .data(columns)

        legend_items.exit().remove();

        let enter = legend_items.enter()
            .append("g")

        enter.append("rect")
            .attr("width", "20")
            .attr("height", "20")
            .attr("opacity", 0.8)
            .style("fill", function (d, index) {
                return stackBarColorScale[columns.length - 1 - index]
            })

        enter.append("text")
            .text(column_val => column_val)
            .style("font-size", "15px")
            .attr("dx", "25")
            .attr("dy", "15")
            .attr("font-size", "10")
            .attr("font-family", "Arial")
            .attr("id", column_val => "_" + column_val.replace(/\ /g, ""))

        let merged = legend_items.merge(enter)
        merged.attr("class", "legend-item")
            .attr("id", column_val => "_" + column_val.replace(/\ /g, ""))
            .on("mouseover", column_val => mouseOverCategory("_" + column_val.replace(/\ /g, "")))
            .on("mouseleave", column_val => mouseOutCategory("_" + column_val.replace(/\ /g, "")))
            .attr("width", width / (series.length * 1.0))
            .attr("transform", function (d, index) {
                return "translate(-50," +
                    (legendYOffset + index * stackBarHeight / (series.length * 2.0)) +
                    ")"
            })
            .each(function (d, index) {
                let self = d3.select(this);

                self.select("text")
                    .text(column_val => d)
                    .attr("id", column_val => "_" + column_val.replace(/\ /g, ""))

                self.select("rect")
                    .attr("id", column_val => "_" + column_val.replace(/\ /g, ""))
                    .style("fill", stackBarColorScale[columns.length - 1 - index])
            })

        /**********************************************************************/

        /******************************* Rebuilding Select Elements****************************/

        /* Remove all existing Options from select elements */
        param1_select.innerHTML = ""
        param2_select.innerHTML = ""

        /* Repopulate options for attriubutes to graph on x axis,
           making sure not to include the attribute already selected for y axis */
        x_categories.filter(x => x != y_category).forEach(category => {
            const option = document.createElement("option");
            option.text = category;
            if (category == x_category) option.setAttribute("selected", "selected");
            param2_select.add(option);
        })

        /* Repopulate options for attriubutes to graph on y axis,
           making sure not to include the attribute already selected for x axis */
        y_categories.filter(y => y != x_category).forEach(category => {
            const option = document.createElement("option");
            option.text = category;
            if (category == y_category) option.setAttribute("selected", "selected");
            param1_select.add(option);
        })

        /*****************************************************************************************/


        stackBarXAxisSVGComponent.selectAll(".tick text").attr("y", 20).attr("dx", 0).attr("font-size", "10px");

        legend.select("text")
            .text(y_category);
    }


    /* Add left edge for x axis */
    stackBarSvg.append("line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", stackBarHeight)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", "2px")
        .attr("class", "yAxisBoundary")

    /* Add left edge for y axis */
    stackBarSvg.append("line")
        .attr("x1", 0)
        .attr("x2", stackBarWidth)
        .attr("y1", stackBarHeight)
        .attr("y2", stackBarHeight)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", "2px")
        .attr("class", "yAxisBoundary")

    /*********** Create Legend Framework From Scratch **************/
    let stackBarLegendHeight = stackBarHeight / 4;
    let stackBarLegendWidth = stackBarPadding.legendWidth;
    let stackBarLegendInset = 1400 - stackBarLegendWidth;


    var legend = stackBarContainerSvg.append("g")
        .attr("class", "legend")
        .attr("width", stackBarLegendWidth)
        .attr("height", stackBarLegendHeight)
        .attr("transform", "translate(" + stackBarLegendInset + "," + (0) +
            ")");

    legend.append("text")
        .attr("class", "label")
        .attr("x", -50)
        .attr("y", 180)
        .text("Platform")
        .style("font-family", "sans-serif")
        .style("font-size", "25px");
    /**************************************/

    /* Rebuild graph when settings are changed */
    param1_select.addEventListener("change", reload_attributes);
    param2_select.addEventListener("change", reload_attributes);

    /* Rebuild graph given new settings */
    reload_attributes();
}

/* List possible values for attributes */
var y_categories = ["Platform", "Publisher", "Genre"]
var x_categories = ["Genre", "Year", "Publisher", "Platform"]

var param1_select = document.getElementById("graph1param1");
var param2_select = document.getElementById("graph1param2");


/* Add possible values to select HTML elements */
x_categories.filter(x => x != y_categories[0]).forEach(category => {
    const option = document.createElement("option");
    option.text = category;
    param2_select.add(option);
})

y_categories.filter(y => y != x_categories[0]).forEach(category => {
    const option = document.createElement("option");
    option.text = category;
    param1_select.add(option);
})

/* Initialize the graph */
buildGraph();