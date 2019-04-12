let info_buttons = d3.selectAll(".info-button")
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseOut)
    .on("click", clicked)


const barGraphDescription = "On this graph you are able to select that attributes that are being compared. Using the two dropdowns on the right, the categories on both the axes can be changed and the graph will automatically reload. If hovered over, a category will be highlighted both on the graph itself and within the legend. This tool can be used to analyze the trend of a specific category."

const networkDescription = "This is a network"


function clicked() {
    let self = d3.select(this);

    let popup_html = '<html><body><span style="color:white;font-size:30px;">' + (self.attr("id") == "bar-graph-help" ? barGraphDescription : networkDescription) + '</span></body></html>';

    lity("bar_graph_description.html")

}

function mouseOver() {
    let self = d3.select(this);

    self.transition()
        .duration(300)
        .style("background", self.attr("color"))
        .style("color", "black")
}

function mouseOut(d) {
    let self = d3.select(this);

    self.transition()
        .duration(300)
        .style("background", "black")
        .style("color", self.attr("color"))
}