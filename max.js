//this first part is just code I found online to get an idea of what to do

// set the dimensions and margins of the graph

const svg = d3.select("svg#graph");
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

    var options = {
        keys: ['name'],
        id: 'id'
    };

    const fuse_data = await d3.json("fuse.json");
    const id_to_data = await d3.json("id_to_data.json");

    var fuse = new Fuse(fuse_data, options)
    console.log(fuse.search("old"))

    var body = d3.select('body')

    var input = d3.select("input#textInput");
    var label = svg.append("text").attr("id", "label");

    input.on("keypress", function () {
            titleSearch(this.value);
            console.log(this.value)
            console.log("input")
        })
        .on("change", function (d, i) {
            console.log("change")
            console.log(this)
            console.log(this.game_id)
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
        console.log(titles)

        results_dict = {}
        removeOptions();

        titles.forEach(function (item) {
            // Create a new <option> element.

            let result_text = item["name"] // + " --- " + item["platform"] + " --- " +  item["year"] 
            results_dict[result_text] = item["id"]

            d3.select(dataList)
                .append("option")
                .attr("value", result_text)
                .attr("game_id", item["id"])
            // .on("select", console.log("hi"))

            // var option = document.createElement('option');
            // // Set the value using the item in the JSON array.
            // option.value = item;
            // option.attr("onclick", function(d) {
            //     console.log("hi")
            // }) 
            // // Add the <option> element to the <datalist>.
            // dataList.appendChild(option);
        });


        // update_force_graph(results[0]);
    }

    /////////////////////////////////////////////////////////////////

    function empty_info_box() {
        document.getElementById("game-info").innerHTML = ""

    }

    function update_info_box(game_id) {

        // while (game_info_box.firstChild) {
        //     game_info_box.removeChild(dataList.firstChild);
        // }

        empty_info_box();

        let attributes = ["name", "genre", "platforms", "url", "summary"]
        attributes.forEach(d => {
            if (d == "url") {
                game_info_box.append("div")
                    .append("a")
                    .text(id_to_data[game_id][d])
                    .attr("href", id_to_data[game_id][d])
                    .attr("target", "_blank")
            } else {
                game_info_box.append("div")
                    .text(id_to_data[game_id][d])
            }
        })
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
        // .force("radial", d3.forceRadial().radius(d => {
        //     return 80 * d.level 
        // }).x(width / 2.0).y(height / 2.0).strength(10))
        .force("center", d3.forceCenter())
        // .alphaTarget(1)
        .on("tick", ticked);

    var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),
        link = g.append("g").attr("stroke", "#000").attr("stroke-width", 1.5).selectAll(".link"),
        node = g.append("g").attr("stroke", "#fff").attr("stroke-width", 1.5).selectAll(".node");



    // d3.timeout(function () {
    //     links.push({
    //         source: a,
    //         target: b
    //     }); // Add a-b.
    //     links.push({
    //         source: b,
    //         target: c
    //     }); // Add b-c.
    //     links.push({
    //         source: c,
    //         target: a
    //     }); // Add c-a.
    //     restart();
    // }, 1000);

    // d3.interval(function () {
    //     nodes.pop(); // Remove c.
    //     links.pop(); // Remove c-a.
    //     links.pop(); // Remove b-c.
    //     restart();
    // }, 2000, d3.now());

    // d3.interval(function () {
    //     nodes.push(c); // Re-add c.
    //     links.push({
    //         source: b,
    //         target: c
    //     }); // Re-add b-c.
    //     links.push({
    //         source: c,
    //         target: a
    //     }); // Re-add c-a.
    //     restart();
    // }, 2000, d3.now() + 1000);

    var added;

    function update_force_graph(game_id) {

        nodes = []
        links = []

        const num_layers = 4;

        added = [game_id];

        add_similar(game_id, num_layers);

        // let i = 0;

        function add_similar(game_id, level) {
            game_id = parseInt(game_id);
            // console.log("I: " + String(i) + " level: " + level)
            // i += 1;
            game_data = id_to_data[game_id];
            // console.log(game_data)
            if (game_data) { // && !added.includes(game_id)
                nodes.push(Object.create({
                    id: game_id,
                    name: id_to_data[game_id]["name"],
                    level: level
                }))


                // console.log("Added:")
                // console.log(added)
                nodes.forEach(d => {
                    // console.log(d.name)
                })

                if (level - 1 > 0 && "similar_games" in game_data) {
                    console.log(game_data["name"])
                    similar_games = game_data["similar_games"].filter(d => {
                        let key_in = d in id_to_data;
                        let not_already_added = !added.includes(d)
                        let truth_val = key_in && not_already_added;

                        console.log(added)
                        console.log("d_type: " + typeof (d) + " d:'" + String(d) + "' key_in:" + String(key_in) + " not_already_in:" + String(not_already_added));
                        return truth_val;
                    });
                    console.log(similar_games)
                    similar_games.forEach(d => {
                        console.log("Adding: " + id_to_data[game_id]["name"] + "---" + id_to_data[d]["name"] + " connection")
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

        console.log(links)
        console.log(nodes)

        // nodes = similar_game_ids.filter(d => d in id_to_data).map(d => {
        //     console.log("This: " + id_to_data[d]["name"]);
        //     return Object.create({

        //     })
        // });
        // nodes.push(Object.create({
        //     id: game_id,
        //     name: id_to_data[game_id]["name"]
        // }));
        // links = similar_game_ids.filter(d => d in id_to_data).map(d => Object.create({
        //     source: game_id,
        //     target: d
        // }))

        // Apply the general update pattern to the nodes.

        const default_radius = 15;
        let drag = d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        // label = d3.select(label);

        node = node.data(nodes, function (d) {
            return d.id;
        });
        node.exit().remove();
        node = node.enter().append("circle").attr("fill", function (d) {
                return color(d.id);
            })
            // .attr("r", d => {
            //     if (d.id == game_id) return default_radius * 2.0;
            //     else return default_radius;
            // })
            .call(drag)
            .merge(node)
            .attr("r", d => d.id == game_id ? default_radius * 3.0 : default_radius)
            .attr("cursor", "pointer")
            .on("mouseover", function (d, i) {
                let self = d3.select(this)
                console.log(d)
                label.text(d.name);
                update_info_box(d.id)
                console.log(this)
                console.log(typeof (self.attr("cx")))
                console.log(typeof (width / 2.0))
                console.log("x: " + (parseInt(self.attr("cx")) + (width / 2.0) + 20))
                console.log("y: " + (parseInt(self.attr("cy")) + height / 2.0 - 20))
                label.attr("x", parseInt(self.attr("cx")) + width / 2.0 + 20).attr("y", parseInt(self.attr("cy")) + height / 2.0 - 20);
            })
            .on("mouseout", function (d, i) {
                label.text("")
                update_info_box(game_id);
            })
            .on("click", function (d, i) {
                console.log("Clicked")
                if (d.id != game_id) update_force_graph(d.id);
            });

        // Apply the general update pattern to the links.
        link = link.data(links, function (d) {
            return d.source.id + "-" + d.target.id;
        });
        link.exit().remove();
        link = link.enter().append("line").merge(link);

        // Update and restart the simulation.
        simulation.nodes(nodes);
        simulation.force("link").links(links);
        simulation.alpha(1).restart();

        
        update_info_box(game_id);
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        console.log(this.label)
        label.text(d.name);
        label.attr("x", d3.event.x + width / 2.0 + 20).attr("y", d3.event.y + height / 2.0 - 20);
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
        console.log(label)
        label.attr("x", d3.event.x + width / 2.0 + 20).attr("y", d3.event.y + height / 2.0 - 20);
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        label.text("");
    }


    update_force_graph(979);

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