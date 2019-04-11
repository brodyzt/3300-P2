

// let text_space = info_div.append("span")

// console.log(info_div)

let help_boxes = d3.selectAll(".help-box")
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseOut)


const barGraphDescription = "This is a bar"

const networkDescription = "This is a network"

function mouseOver() {
    let self = d3.select(this);

    self.transition()
    .duration(300)
    .style("background", self.attr("color"))
    .select("span")
    .style("color","black")

    console.log(self.attr("id"))
    console.log(self.attr("x"))

    if(self.attr("id") == "bar-graph-help") {
        console.log(barGraphDescription)
    } else {
        console.log(networkDescription)
    }

    // let info_div = d3.select("body")
    // .append("div")
    // .attr("background", "red")

    lity('<html><body><span style="color:red">' + (self.attr("id") == "bar-graph-help" ? barGraphDescription : networkDescription) + '</span></body></html>')

    
    // .attr("")

    // console.log(this)
    // console.log(d)

}

function mouseOut(d) {
    let self = d3.select(this);
    
    self.transition()
    .duration(300)
    .style("background", "black")
    .select("span")
    .style("color",self.attr("color"))
    console.log("leaving")
}