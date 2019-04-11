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

    /* load datasets */
    const fuse_data = await d3.json("Datasets/fuse.json");
    const id_to_data = await d3.json("Datasets/id_to_data.json");
    const genre_data = await d3.json("Datasets/genres_data.json");
    const platform_data = await d3.json("Datasets/platforms_data.json");
    const videos_data = await d3.json("Datasets/videos_data.json");

    /* initialize fuze library used to search datasets */
    var fuse = new Fuse(fuse_data, options)

    var body = d3.select('body')

    var input = d3.select("input#textInput");

    /* update search options when input element text changes 
       and update graph when autosuggest element is selected */
    input.on("keypress", function () {
            titleSearch(this.value);
        })
        .on("change", function (d, i) {
            let result_text = this.value;
            let game_id = results_dict[result_text];

            update_force_graph(game_id)
        });

    /* remove all old options from autosuggest list */
    function removeOptions() {
        while (dataList.firstChild) {
            dataList.removeChild(dataList.firstChild);
        }
    }

    var results_dict = {}

    /* populate autosuggest list with search results from Fuse */
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

    document.getElementById("game-info").setAttribute("style", "")

    /* remove all elements from info box */
    function empty_info_box() {
        document.getElementById("game-info").innerHTML = ""

    }

    function update_info_box(game_id) {

        /* if in the process of draggin, don't ever update info box */
        if (is_dragging) return;

        /* remove previous data from info box */
        empty_info_box();

        /* scroll info box to top when new game info is displayed */
        document.getElementById("game-info").scrollTop = 0;

        /* Add title section to info box */
        game_info_box.append("div")
            .attr("class", "demo-card__primary")
            .append("h1")
            .attr("class", "demo-card__title mdc-typography mdc-typography--headline6")
            .text(id_to_data[game_id]["name"])
            .style("font-size", "30px");
        game_info_box.append("hr")


        /* Add genres section to info box */
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

        /* Add platforms section to info box */
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

        /* Add rating section to info box */
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

        /* Add summary category to info box */
        game_info_box.append("div")
            .attr("class", "demo-card__secondary mdc-typography mdc-typography--body2 summary-box")
            .text(id_to_data[game_id]["summary"])
        game_info_box.append("hr")


        /* Add videos category to info box */
        let videos_div = game_info_box.append("div")
        videos_div.append("span")
            .text("Gameplay Videos: ")
        if ("videos" in id_to_data[game_id]) {
            id_to_data[game_id].videos.forEach((video_id, i) => {
                videos_div
                    .append("a")
                    .attr("data-lity", "")
                    .attr("href", "https://www.youtube.com/watch?v=" + videos_data[video_id]["video_id"] + "?autoplay=1")
                    .attr("target", "_blank")
                    .append("button")
                    .attr("class", "outlined-button mdc-button mdc-button--outlined")
                    // .attr("class", "mdc-button mdc-button--raised")
                    .text("Video " + String(i + 1))
            })
        } else {
            videos_div.append("span")
                .text("Not found")
        }
        game_info_box.append("hr");

        /* Add Button Linking to IGDB Page */
        let action_button_div = game_info_box.append("div")
            .attr("class", "mdc-card__actions")
            .append("div")
            .attr("class", "mdc-card__action-buttons")
            .attr("style", "text-align:center; margin: auto;")
            .append("a")
            .attr("href", id_to_data[game_id]["url"])
            .attr("target", "_blank")
            .append("button")
            .attr("class", "outlined-button mdc-button mdc-button--outlined")
            .text("Visit Game's IGDB")
    }



    var color = d3.scaleOrdinal(d3.schemeCategory10);

    /* retrieve game info box element*/
    var game_info_box = d3.select("div#game-info")

    var nodes = [],
        links = [];


    /* build d3 force simulation */
    var simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-500))
        .force("link", d3.forceLink(links).distance(75).id(d => d.id))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("center", d3.forceCenter())
        .on("tick", ticked);

    /* create svg groups to contain nodes and links */
    var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),
        link = g.append("g").attr("stroke", "#000").attr("stroke-width", 1.5).selectAll(".link"),
        node = g.append("g").attr("stroke", "#fff").attr("stroke-width", 1.5).selectAll(".node");

    var added;

    function update_force_graph(game_id) {
        /* update placeholder of search box to be current selected game */
        input.attr("placeholder", id_to_data[game_id]["name"])
            .attr("text", "")

        nodes = []
        links = []

        /* max depth of similarity graph starting from central (selected) game */
        const num_layers = 4;

        /* list of games already in the graph */
        added = [game_id];

        /* recursive function for finding related games and adding them to graph */
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

        add_similar(game_id, num_layers);


        /************************* Graph data joins on nodes and links *********************************/

        const default_radius = 15;

        let drag = d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)

        node = node.data(nodes, function (d) {
            return d.id;
        });

        /* remove nodes no longer needed from graph */
        node.exit().remove();

        /* create scale to generate radius from rating */
        let rating_scale = d3.scalePow()
            .exponent(4)
            .domain([0, 100])
            .range([5, 30]);

        /* create new nodes to add to graph and update reused nodes with new data */
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
                self.transition()
                    .duration(200)
                    .attr("r", self.attr("original_radius") * 1.5)
                update_info_box(d.id)
            })
            .on("mouseout", function (d, i) {
                let self = d3.select(this)
                self.transition()
                    .duration(200)
                    .attr("r", self.attr("original_radius"))
                update_info_box(game_id);
            })
            .on("click", function (d, i) {
                if (d.id != game_id) update_force_graph(d.id);
            });

        /* apply the general update pattern to the links. */
        link = link.data(links, function (d) {
            return d.source.id + "-" + d.target.id;
        });

        /* remove links that are no longer needed from the graph */
        link.exit().remove();

        /* add new links to graph and add class 'link' to all links */
        link = link.enter()
            .append("line")
            .merge(link)
            .classed("link", true);

        /* update and restart the simulation */
        simulation.nodes(nodes);
        simulation.force("link").links(links);
        simulation.alpha(1).restart();

        /********************************************************************/

        /* reload information box with information for selected game */
        update_info_box(game_id);
    }

    /* function to run when circle starts being dragged */
    function dragstarted(d) {
        is_dragging = true;
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    /* function to run each time circle center changes while being dragged */
    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    /* function to run once circle is done being dragged */
    function dragended(d) {
        is_dragging = false;
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    /* indicates how to animate elements of force graph during each animation frame */
    function ticked() {
        const radius = 15;

        /* update the node center */
        node.attr("cx", function (d) {
                return d.x = Math.max(radius - width / 2.0, Math.min(width / 2.0 - radius, d.x));
            })
            .attr("cy", function (d) {
                return d.y = Math.max(radius - height / 2.0, Math.min(height / 2.0 - radius, d.y));
            })

        /* update link locations */
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

    /* Initialize graph with game_id 1078 being the central node */
    update_force_graph(1078);

};

startup();