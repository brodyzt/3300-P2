const buildGraph = async () => {
    const data = await d3.csv("games.csv");

    blockbustersData = data;

    console.log(blockbustersData)

        // Part A (preprocessing data)

        var minYear,
            maxYear,
            minRating,
            maxRating,
            minGross,
            maxGross;



        // Format data for easy use
        // blockbustersData.forEach(elem => {
        //     // Worldwide Gross - Remove formatting and convert to float
        //     let currency_string = elem["worldwide_gross"];
        //     elem["worldwide_gross"] = parseFloat(currency_string.replace(/[^0-9\.]/g, ""));

        //     // Length - Converting to Int
        //     elem["length"] = parseInt(elem["length"]);

        //     // Year - Convert to Number
        //     elem["year"] = parseInt(elem["year"]);

        //     // Rank - Convert to Number
        //     elem["rank_in_year"] = parseInt(elem["rank_in_year"]);

        //     // IMDB Rating - Convert to Number
        //     elem["imdb_rating"] = parseFloat(elem["imdb_rating"])
        // });

        var genre_set = new Set([]);

        // Remove any invalid data
        // blockbustersData = blockbustersData.filter((elem, index) => {
        //     let rating = elem["imdb_rating"],
        //         genre = elem["Main_Genre"],
        //         gross = elem["worldwide_gross"],
        //         year = elem["year"],
        //         length = elem["length"],
        //         year_rank = elem["rank_in_year"];

        //     /*  Remove movies with impossible worldwide_gross values
        //         Avatar was highest ever with $2,787,965,087
        //      */
        //     if (gross > 2787965087 || gross <= 0) return false;

        //     // Remove movies supposedly released outside of defined range
        //     if (year < 1975 || year > 2018) return false;

        //     // Remove movies with invalid length
        //     if (isNaN(length)) return false;

        //     // Remove movies with invalid rank
        //     if (isNaN(year_rank) || year_rank < 1 || year_rank > 10) return false;

        //     // Remove movies with invalid rating
        //     if (isNaN(rating) || rating > 10 || rating < 0) return false;

        //     // Calculate max and min values
        //     if (!minYear || year < minYear) minYear = year;
        //     if (!maxYear || year > maxYear) maxYear = year;

        //     if (!minRating || rating < minRating) minRating = rating;
        //     if (!maxRating || rating > maxRating) maxRating = rating;

        //     if (!minGross || gross < minGross) minGross = gross;
        //     if (!maxGross || gross > maxGross) maxGross = gross;

        //     genre_set.add(genre)

        //     return true;
        // });

        // Part B Scales and Axes

        var svg = d3.select("svg#graphsvg")

        let padding = {
            top: 20,
            right: 100,
            bottom: 20,
            left: 40
        }

        var width = svg.attr("width") - padding.right - padding.left;
        var height = svg.attr("height") - padding.top - padding.bottom;

        var graph =
            svg.append("g")
            .attr("transform", "translate(" + padding.left + "," + padding.top + ")");

        // Round bounds for axes
        minYear = 1980
        maxYear = 2020 

        var x = d3.scaleLinear()
            .domain([minYear, maxYear])
            .range([0, width]);
        var y = d3.scaleLinear()
            .domain([0, 50])
            .range([height, 0]);

        var xTickValues = [...Array((maxYear - minYear + 1)).keys()]
            .map(x => x + minYear);

        var xAxis =
            graph.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
                .tickSize(-height)
                .tickValues(xTickValues)
                .tickFormat(val => (val - minYear) % 5 == 0 ? val : "")
            );

        let divisor = 50000000

        var yAxis =
            graph.append("g")
            .call(d3.axisRight(y)
                .tickSize(width)
                .ticks(10)
                .tickFormat(val => val % 5 == 0 ? d3.format(",.2s")(val) : "")
            );

        xAxis.select(".domain").remove()
        yAxis.select(".domain").remove()

        xAxis.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr('stroke-width',
            '.25px')
        xAxis.selectAll(".tick text").attr("y", 10).attr("dx", 0);

        yAxis.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr('stroke-width',
            '.25px')
        yAxis.selectAll(".tick text").attr("x", -30).attr("dy", 0);


        var ratingScale = d3.scalePow()
            .exponent(4)
            .domain([minRating, maxRating])
            .range([3, 12]);


        var genre_list = Array.from(genre_set);
        let color_scale = ["#ff0029", "#377eb8", "#66a61e", "#984ea3", "#00d2d5", "#ff7f00", "#af8d00",
            "#7f80cd", "#b3e900", "#c42e60", "#a65628", "#f781bf", "#8dd3c7", "#bebada", "#fb8072",
            "#80b1d3"
        ]
        let color_dict = {};

        for (let i = 0; i < genre_list.length; i++) {
            color_dict[genre_list[i]] = color_scale[i];
        }

        let legend_height = 30;

        blockbustersData.forEach(function (d, i) {
            let xVal = Math.floor(x(d["Year"]));
            let yVal = d["Global_Sales"];
            let radius = 5
            let genre = d["Main_Genre"];
            let fill = color_dict[genre];
            let circle = graph.append("circle")
                .attr("r", radius)
                .attr("standard-radius", radius)
                .attr("cx", xVal)
                .attr("cy", yVal)
                .attr("opacity", 0.4)
                .attr("class", genre)
                .style("fill", fill);

            circle.on("mouseover", function () {
                    let textElement = graph.append("text")
                        .attr("x", xVal + 20)
                        .attr("y", yVal + 20)
                        .attr("id", "dataLabel")
                        .attr("font-size", "25")
                        .style("background-color", "red")
                        .text(d["title"]);

                    circle.raise()

                    // enlarge circle
                    circle.transition()
                        .duration(100)
                        .attr("opacity", 1.0)
                        .attr("r", radius * 2)

                    d3.select("rect#" + genre).transition()
                        .duration(100)
                        .attr("width", 30)

                    d3.select("text#" + genre + "_label").transition()
                        .duration(100)
                        .attr("dx", 35)
                        .attr("font-weight", "bold")

                    

                })
                .on("mouseout", function () {
                    document.getElementById("dataLabel").remove();

                    // shrink circle to original size
                    circle.transition()
                        .duration(100)
                        .attr("r", radius)
                        .attr("opacity", 0.4)

                    d3.select("rect#" + genre).transition()
                        .duration(100)
                        .attr("width", 20)

                    d3.select("text#" + genre + "_label").transition()
                        .duration(100)
                        .attr("dx", 25)
                        .attr("font-weight", "normal")
                });
        });

        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("width", width)
            .attr("height", padding.bottom)
            .attr("transform", "translate(" + (padding.left + width + 5) + "," + (padding.top) +
                ")");

        genre_list.forEach((genre, index) => {
            let current_item = legend.append("g")
                .attr("class", "legend-item")
                .attr("width", width / (genre_set.size * 1.0))
                .attr("transform", "translate(0," +
                    (index * height / (genre_set.size * 1.0)) +
                    ")");


            current_item.append("rect")
                .attr("width", "20")
                .attr("height", "20")
                .attr("id", genre_list[index])
                .style("fill", color_scale[index])
                .on("mouseover", function () {
                    let genre_circles = d3.selectAll("circle." + genre);
                    genre_circles.call(d => {
                        d.transition()
                            .duration(100)
                            .attr("r", d.attr("standard-radius") * 4.0);
                    })
                })
                .on("mouseout", function () {
                    let genre_circles = d3.selectAll("circle." + genre);
                    genre_circles.call(d => {
                        d.transition()
                            .duration(100)
                            .attr("r", d.attr("standard-radius"));
                    })
                });

            current_item.append("text")
                .text(genre)
                .attr("dx", "25")
                .attr("dy", "15")
                .attr("font-size", "10")
                .attr("font-family", "Arial")
                .attr("id", genre_list[index] + "_label")

        })
}

buildGraph();