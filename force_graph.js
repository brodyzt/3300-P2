const svg = d3.select("svg#force-graph");
var margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    },
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;




const startup = async () => {

    var dataList = document.getElementById('datalist');
    var is_dragging = false;

    var options = {
        keys: ['name'],
        id: 'id'
    };

    const fuse_data = await d3.json("fuse.json");
    const id_to_data = await d3.json("id_to_data.json");
    const genre_data = await d3.json("genres_data.json");
    const platform_data = await d3.json("platforms_data.json");

    var fuse = new Fuse(fuse_data, options)

    var body = d3.select('body')

    var input = d3.select("input#textInput");

    input.on("keypress", function () {
            titleSearch(this.value);
        })
        .on("change", function (d, i) {
            let result_text = this.value;
            let game_id = results_dict[result_text];

            update_force_graph(game_id)
        });

    function removeOptions() {

        while (dataList.firstChild) {
            dataList.removeChild(dataList.firstChild);
        }
    }

    var results_dict = {}

    function titleSearch(title) {
        const results = fuse.search(title).slice(0, 10);
        const titles = results.map(id => id_to_data[id]);

        results_dict = {}
        removeOptions();

        titles.forEach(function (item) {
            // Create a new <option> element.

            let result_text = item["name"]
            results_dict[result_text] = item["id"]

            d3.select(dataList)
                .append("option")
                .attr("value", result_text)
                .attr("game_id", item["id"])
        });

    }

    /////////////////////////////////////////////////////////////////

    document.getElementById("game-info").setAttribute("style", "")

    function empty_info_box() {
        document.getElementById("game-info").innerHTML = ""

    }

    function update_info_box(game_id) {
        if (is_dragging) return;

        empty_info_box();

        // Add title
        game_info_box.append("div")
            .attr("class", "demo-card__primary")
            .append("h1")
            .attr("class", "demo-card__title mdc-typography mdc-typography--headline6")
            .text(id_to_data[game_id]["name"])
            .style("font-size", "30px");

        game_info_box.append("hr")

        // Add Genre Chips
        let genre_chip_div = game_info_box.append("div");
        genre_chip_div.attr("class", "mdc-chip-set");

        genre_chip_div.append("span")
            .text("Genres")
            .attr("style", "margin-right:10px;")

        let genres = id_to_data[game_id]["genres"];
        genres.forEach(d => {
            genre_chip_div.append("div")
                .attr("class", "mdc-chip")
                .append("div")
                .attr("class", "mdc-chip__text")
                .text(genre_data[d]["name"])
                .on("mouseover", function () {
                    let circles = d3.selectAll("circle." + "Genre_" + d);
                    circles.transition()
                        .duration(200)
                        .attr("r", function () {
                            return d3.select(this).attr("original_radius") * 1.5
                        })
                })
                .on("mouseout", function () {
                    let circles = d3.selectAll("circle." + "Genre_" + d);
                    circles.transition()
                        .duration(200)
                        .attr("r", function () {
                            return d3.select(this).attr("original_radius")
                        })
                })
        })

        game_info_box.append("hr")

        // Add Platform Chips
        let platform_chip_div = game_info_box.append("div");
        platform_chip_div.attr("class", "mdc-chip-set");
        platform_chip_div.append("span")
            .text("Platforms")
            .attr("style", "margin-right:10px;")

        if ("platforms" in id_to_data[game_id]) {
            let platforms = id_to_data[game_id]["platforms"];
            platforms.forEach(d => {
                platform_chip_div.append("div")
                    .attr("class", "mdc-chip")
                    .append("div")
                    .attr("class", "mdc-chip__text")
                    .text(platform_data[d]["name"])
                    .on("mouseover", function () {
                        let circles = d3.selectAll("circle." + "Platform_" + d);
                        circles.transition()
                            .duration(200)
                            .attr("r", function () {
                                return d3.select(this).attr("original_radius") * 1.5
                            })
                    })
                    .on("mouseout", function () {
                        let circles = d3.selectAll("circle." + "Platform_" + d);
                        circles.transition()
                            .duration(200)
                            .attr("r", function () {
                                return d3.select(this).attr("original_radius")
                            })
                    })
            })
        } else {
            platform_chip_div.append("span")
                .text("None found")
        }


        game_info_box.append("hr")

        let rating_div = game_info_box.append("div")

        rating_div.append("span")
            .text("Rating: ")
            .attr("style", "margin-right:10px;")

        rating_div.append("span")
            .text(function () {
                if ("rating" in id_to_data[game_id]) {
                    let raw_rating = id_to_data[game_id]["rating"]
                    return String(Math.round(raw_rating)) + "%"
                } else {
                    return "Not Found"
                }
            })
            .attr("style", "margin-right:10px;")

        game_info_box.append("hr")

        // Add Summary
        game_info_box.append("div")
            .attr("class", "demo-card__secondary mdc-typography mdc-typography--body2 summary-box")
            .text(id_to_data[game_id]["summary"])

        game_info_box.append("hr")


        // Add Videos
        let videos_div = game_info_box.append("div")
        videos_div.append("span")
            .text("Gameplay Videos:")
        videos_div.append("div")
            .html('<iframe width="560" height="315" src="https://www.youtube.com/embed/uD4izuDMUQA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>')


        // Add Buttons
        let action_button_div = game_info_box.append("div")
            .attr("class", "mdc-card__actions")
            .append("div")
            .attr("class", "mdc-card__action-buttons")
            .attr("style", "text-align:center; margin: auto;")
            .append("a")
            .attr("href", id_to_data[game_id]["url"])
            .attr("target", "_blank")
            .append("button")
            .attr("class", "mdc-button mdc-button--raised")
            .text("View Game on IGDB")
    }


    //////////////////////////////////////////////////////////////////



    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var game_info_box = d3.select("div#game-info")

    var nodes = [],
        links = [];


    var simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-500))
        .force("link", d3.forceLink(links).distance(75).id(d => d.id))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("center", d3.forceCenter())
        .on("tick", ticked);

    var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),
        link = g.append("g").attr("stroke", "#000").attr("stroke-width", 1.5).selectAll(".link"),
        node = g.append("g").attr("stroke", "#fff").attr("stroke-width", 1.5).selectAll(".node");

    var added;

    function update_force_graph(game_id) {
        input.attr("placeholder", id_to_data[game_id]["name"])

        nodes = []
        links = []

        const num_layers = 4;

        added = [game_id];

        add_similar(game_id, num_layers);

        // let i = 0;

        function add_similar(game_id, level) {
            game_id = parseInt(game_id);
            game_data = id_to_data[game_id];

            if (game_data) {
                nodes.push(Object.create({
                    id: game_id,
                    name: id_to_data[game_id]["name"],
                    level: level
                }))

                if (level - 1 > 0 && "similar_games" in game_data) {
                    similar_games = game_data["similar_games"].filter(d => {
                        let key_in = d in id_to_data;
                        let not_already_added = !added.includes(d)
                        let truth_val = key_in && not_already_added;

                        return truth_val;
                    });
                    similar_games.forEach(d => {
                        links.push(Object.create({
                            source: game_id,
                            target: d
                        }));
                        added.push(d);
                    })
                    similar_games.forEach(d => add_similar(d, level - 1));
                }
            }
        }


        // Apply the general update pattern to the nodes.
        const default_radius = 15;
        let drag = d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)

        node = node.data(nodes, function (d) {
            return d.id;
        });
        node.exit().remove();

        let rating_scale = d3.scalePow()
            .exponent(4)
            .domain([0, 100])
            .range([5, 30]);

        node = node.enter().append("circle")
            .call(drag)
            .merge(node)
            .attr("fill", function (d) {
                return d.id == game_id ? "white" : color(id_to_data[d.id]["genres"][0]);
            })
            .attr("r", function (d) {
                if ("rating" in id_to_data[d.id]) {
                    return rating_scale(id_to_data[d.id].rating)
                } else {
                    return 20;
                }
            })
            .attr("original_radius", function (d) {
                if ("rating" in id_to_data[d.id]) {
                    return rating_scale(id_to_data[d.id].rating)
                } else {
                    return 20;
                }
            })
            .attr("cursor", "pointer")
            .attr("class", node => {
                let class_string = "";

                if ("genres" in id_to_data[node.id]) {
                    let genre_classes = id_to_data[node.id].genres.map(d => "Genre_" + d).join(" ")
                    class_string = class_string + genre_classes;

                    class_string = class_string + " ";
                }

                if ("platforms" in id_to_data[node.id]) {
                    let platform_classes = id_to_data[node.id].platforms.map(d => "Platform_" + d).join(" ")
                    class_string = class_string + platform_classes;
                }

                return class_string;
            })
            .on("mouseover", function (d, i) {
                let self = d3.select(this)
                update_info_box(d.id)
            })
            .on("mouseout", function (d, i) {
                update_info_box(game_id);
            })
            .on("click", function (d, i) {
                if (d.id != game_id) update_force_graph(d.id);
            });

        // Apply the general update pattern to the links.
        link = link.data(links, function (d) {
            return d.source.id + "-" + d.target.id;
        });
        link.exit().remove();
        link = link.enter().append("line").merge(link)
            .classed("link", true);

        // Update and restart the simulation.
        simulation.nodes(nodes);
        simulation.force("link").links(links);
        simulation.alpha(1).restart();


        update_info_box(game_id);
    }

    function dragstarted(d) {
        is_dragging = true;
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        is_dragging = false;
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }


    update_force_graph(1078);

    function ticked() {
        const radius = 15;

        node.attr("cx", function (d) {
                return d.x = Math.max(radius - width / 2.0, Math.min(width / 2.0 - radius, d.x));
            })
            .attr("cy", function (d) {
                return d.y = Math.max(radius - height / 2.0, Math.min(height / 2.0 - radius, d.y));
            })

        link.attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });
    }

};

startup();