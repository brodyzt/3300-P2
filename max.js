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

    var options = {
        keys: ['name'],
        id: 'id'
    };

    const fuse_data = await d3.json("fuse.json");
    const id_to_data = await d3.json("id_to_data.json");

    var fuse = new Fuse(fuse_data, options)
    console.log(fuse.search("old"))

    var body = d3.select('body')

    d3.select("input#textInput")
        .on("input", function () {
            titleSearch(this.value);
        });

    function titleSearch(title) {
        const results = fuse.search(title);
        console.log(id_to_data[results[0]])
        update_force_graph(results[0]);
    }


    //////////////////////////////////////////////////////////////////



    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var nodes = [],
        links = [];


    var simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-1000))
        .force("link", d3.forceLink(links).distance(200).id(d => d.id))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .alphaTarget(1)
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

        const num_layers = 3;
        const max_per_layer = 7;

        added = {};

        add_similar(game_id, num_layers);

        // let i = 0;

        function add_similar(game_id, level) {
            game_id = parseInt(game_id);
            // console.log("I: " + String(i) + " level: " + level)
            // i += 1;
            game_data = id_to_data[game_id];
            // console.log(game_data)
            if (game_data && !added.hasOwnProperty(game_id)) {
                added[game_id] = undefined;
                nodes.push(Object.create({
                    id: game_id,
                    name: id_to_data[game_id]["name"]
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
                        let not_already_added = !added.hasOwnProperty(d)
                        let truth_val = key_in && not_already_added;

                        console.log(added)
                        console.log("d_type: " + typeof(d) + " d:'" + String(d) + "' key_in:" + String(key_in) + " not_already_in:" + String(not_already_added));
                        return truth_val;
                    });
                    console.log(similar_games)
                    similar_games.forEach(d => {
                        console.log("Adding: " + id_to_data[game_id]["name"] + "---" + id_to_data[d]["name"] + " connection")
                        links.push(Object.create({
                            source: game_id,
                            target: d
                        }));
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
        node = node.data(nodes, function (d) {
            return d.id;
        });
        node.exit().remove();
        node = node.enter().append("circle").attr("fill", function (d) {
                return color(d.id);
            }).attr("r", 8)
            .call(drag(simulation))
            .merge(node)
            .on("mouseover", function (d, i) {
                console.log(d.name)
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
    }

    function drag(simulation) {
        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    update_force_graph(979);

    function ticked() {
        node.attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
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
















    // let default_radius = 15;
    // let initial_game_id = "979";
    // let game_data = id_to_data[initial_game_id];
    // let similar_game_ids = game_data["similar_games"];

    // var links = []
    // var nodes = []

    // var simulation = d3.forceSimulation(nodes)
    //     .force("link", d3.forceLink(links).id(d => d.id).distance(100))
    //     .force("charge", d3.forceManyBody())
    //     .force("center", d3.forceCenter(width / 2, height / 2))



    // var linkg = svg.append("g");
    // // var link = linkg.attr("stroke", "#999")
    // //     .attr("stroke-opacity", 0.6)
    // //     .selectAll("line")
    // //     .data(links)
    // //     .join("line")
    // //     .attr("stroke-width", d => Math.sqrt(d.value));


    // var nodeg = svg.append("g");
    // // var node = nodeg.attr("stroke", "#fff")
    // //     .attr("stroke-width", 2)
    // //     .selectAll("circle")
    // //     .data(nodes)
    // //     .join("circle")
    // //     .attr("r", default_radius)
    // //     .on("mouseover", function (d, i) {
    // //         const circle = d3.select(this);
    // //         console.log(circle.attr("r"));

    // //         let textElement = d3.select(this).append("text")
    // //             .attr("x", circle.attr("cx") + 20)
    // //             .attr("y", circle.attr("cy") + 20)
    // //             .attr("id", "dataLabel")
    // //             .attr("font-size", "25")
    // //             .style("background-color", "red")
    // //             .text(d => d.name);

    // //         // enlarge circle
    // //         circle.transition()
    // //             .duration(50)
    // //             .attr("r", default_radius * 2)


    // //     })
    // //     .on("mouseout", function () {
    // //         document.getElementById("dataLabel").remove();
    // //         const circle = d3.select(this);

    // //         // shrink circle to original size
    // //         circle.transition()
    // //             .duration(50)
    // //             .attr("r", default_radius)

    // //     })
    // // .call(d3.drag()
    // //     // .on("start", function (d) {
    // //     //     if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    // //     //     d.fx = d.x;
    // //     //     d.fy = d.y;
    // //     // })
    // //     // .on("drag", function (d) {
    // //     //     d.fx = d3.event.x;
    // //     //     d.fy = d3.event.y;
    // //     // })
    // //     .on("end", d => {
    // //         if (!d3.event.active) simulation.alphaTarget(0);
    // //         d.fx = null;
    // //         d.fy = null;
    // //     })
    // //     (simulation));
    // // .call(drag(simulation));


    // // node.append("title")
    // //     .text(d => d.name);

    // // simulation.on("tick", () => {
    // //     link
    // //         .attr("x1", d => d.source.x)
    // //         .attr("y1", d => d.source.y)
    // //         .attr("x2", d => d.target.x)
    // //         .attr("y2", d => d.target.y);

    // //     node
    // //         .attr("cx", d => d.x)
    // //         .attr("cy", d => d.y);
    // // });


    // function update_force_graph(game_id) {
    //     console.log("updating to: " + game_id)

    //     let game_data = id_to_data[game_id];
    //     let similar_game_ids = game_data["similar_games"];

    //     links = similar_game_ids.filter(d => d in id_to_data).map(d => Object.create({
    //         source: game_id,
    //         target: d
    //     }))
    //     nodes = similar_game_ids.filter(d => d in id_to_data).map(d => {
    //         console.log("This: " + id_to_data[d]["name"]);
    //         return Object.create({
    //             id: d,
    //             name: id_to_data[d]["name"]
    //         })
    //     });
    //     nodes.push(Object.create({
    //         id: game_id,
    //         name: id_to_data[game_id]["name"]
    //     }));

    //     // console.log(node.selectAll("circle"))

    //     // console.log(node)

    //     let node = nodeg.selectAll("circle")
    //         .data(nodes);

    //     node.enter()
    //         .append("circle")
    //         .attr("cx", 0)
    //         .attr("cy", 0)
    //         .attr("r", default_radius)
    //         // .attr("test", d => console.log(d))
    //         // .select("title")
    //         // .text(d => d.name)
    //         // .on("mouseover", function (d, i) {
    //         //     const circle = d3.select(this);
    //         //     console.log(circle.attr("r"));

    //         //     let textElement = d3.select(this).append("text")
    //         //         .attr("x", circle.attr("cx") + 20)
    //         //         .attr("y", circle.attr("cy") + 20)
    //         //         .attr("id", "dataLabel")
    //         //         .attr("font-size", "25")
    //         //         .style("background-color", "red")
    //         //         .text(d => d.name);

    //         //     // enlarge circle
    //         //     circle.transition()
    //         //         .duration(50)
    //         //         .attr("r", default_radius * 2)


    //         // })
    //         // .on("mouseout", function () {
    //         //     document.getElementById("dataLabel").remove();
    //         //     const circle = d3.select(this);

    //         //     // shrink circle to original size
    //         //     circle.transition()
    //         //         .duration(50)
    //         //         .attr("r", default_radius)

    //         // })
    //         .merge(node)
    //         .attr("transform", d => "translate(" + d.x + "," + console.log("here") + d.y + ")")
    //         // .call(d3.drag()
    //         //     // .on("start", function (d) {
    //         //     //     if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    //         //     //     d.fx = d.x;
    //         //     //     d.fy = d.y;
    //         //     // })
    //         //     // .on("drag", function (d) {
    //         //     //     d.fx = d3.event.x;
    //         //     //     d.fy = d3.event.y;
    //         //     // })
    //         //     .on("end", d => {
    //         //         if (!d3.event.active) simulation.alphaTarget(0);
    //         //         d.fx = null;
    //         //         d.fy = null;
    //         //     })
    //         //     (simulation));
    //         .call(drag(simulation))

    //     node.exit()
    //         .remove();

    //     let link = linkg.selectAll("line").data(links);

    //     link.exit()
    //         .remove();

    //     link.data(links)
    //         .attr("x1", d => console.log(d.source.x))
    //         .enter()
    //         .append("line")
    //         .merge(link)
    //         .attr("x2", d => d.target.x)
    //         .attr("y1", d => d.source.y)
    //         .attr("y2", d => d.target.y)

    //     console.log(nodes)
    //     console.log(link)
    //     simulation.nodes(nodes);
    //     simulation.force("link").links(links);
    //     simulation.restart();
    // }

    // // Initial Value


    // function drag(simulation) {
    //     function dragstarted(d) {
    //         if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    //         d.fx = d.x;
    //         d.fy = d.y;
    //     }

    //     function dragged(d) {
    //         d.fx = d3.event.x;
    //         d.fy = d3.event.y;
    //     }

    //     function dragended(d) {
    //         if (!d3.event.active) simulation.alphaTarget(0);
    //         d.fx = null;
    //         d.fy = null;
    //     }

    //     return d3.drag()
    //         .on("start", dragstarted)
    //         .on("drag", dragged)
    //         .on("end", dragended);
    // }

    // update_force_graph(initial_game_id);

    // invalidation.then(() => simulation.stop());

    // return svg.node();

};

startup();




//this is just code from lecture that for some reason doesn't work for me

/*
// Layer for drawing
 const layer = d3.select("#graph").append("g");
 const width = d3.select("#graph").attr("width");
 const height = d3.select("#graph").attr("height");
 const colorScale = d3.scaleOrdinal(d3.schemeSet1);

 // (turn on to get circle indicators for later in the demo)
 // for (let i=0; i<=4; i++) {
 //   layer.append("circle").attr("cx",width/2).attr("cy",height/2).attr("fill","none").attr("stroke","#AAA").attr("r",i*80);
 // }

 let svg = d3.select("#graph")

 const requestData = async () => {

   // Load dataset of CIS classes (note, I made this by hand so there probably will be tons of errors)
   const classes = await d3.json("testNodes.json");
   //console.log(classes);

   //Assemble data structures for a graph
   var nodes = classes; // nodes can be just plain objects
   var links = []; // links must have source,target as edge list

   // Loop through nodes to build edges
   Array.from(nodes).forEach( node => {
     // add course level and prefix using regex
     node.id = parseInt(/[A-Z]+(\d)/.exec(node.course)[1]);
     node.prefix = /([A-Z]+)/.exec(node.course)[1];

     // One edge per pre-requisite course
     node['pre-reqs'].forEach( req => {
       // have to deal with crosslisting
       let candidate = nodes.find( d => {
         return (d.course === req) || (d.crosslist.indexOf(req) !== -1);
       });

       links.push( { source: node.course, target: candidate.course } );

     });

     // Set initial positions with a bit of noise
     node.x = width/2.0 + d3.randomUniform(-200,200)();
     node.y = height/2.0 + d3.randomUniform(-200,200)();

   });



   // Build a simulation for the graph
   var sim = d3.forceSimulation()
               .nodes(nodes)
               .force("links", d3.forceLink()   // Keep nodes that are connected near each other
                                       .links(links)           // give the force an array of source/target objects
                                       .id( d => d.course ) )
                                              // if source and target don't provide array indices for nodes, .id will tell the force what to look for in the nodes when it is trying to connect things together. Provide a getter function for _node elements_
               .force("repulse", d3.forceManyBody().strength(-30) ) // electrostatic repulsion between all nodes to space them out
               .force("center", d3.forceCenter(width/2.0, height/2.0)) // centering force to make sure points don't fly away completely
               .on("tick", render);


   console.log(" Nodes and links ");
   console.log(nodes);
   console.log(links);
   // Notice how after building the d3.forceLink the source/target pointers in links have been changed to point to elements in nodes. This will allow us to draw the edges very easily

   // Do any pre-computing of ticks to smooth the animation?


   // Update the chart for a new tick of the simulation
   function render() {

     // Edges
     let lines = layer.selectAll("line.link").data(links)
     lines.enter().append("line").attr("class","link")
          .attr("stroke","#333")
          .merge(lines)
          .attr("x1", d => d.source.x).attr("x2", d => d.target.x)   // Using the pointers d3.forceLink provides to access node x and y coords
          .attr("y1", d => d.source.y).attr("y2", d => d.target.y);

     // Nodes
     let circles = layer.selectAll("circle.node").data(nodes); // (returns nothing the first time render is called, then returns all circles)
     circles.enter() // get a list of new circles to add (full the first time we call render, empty from then on)
            .append("circle")
            .attr("class","node")
            .attr("fill", d => colorScale(d.prefix))
            .attr("stroke", "#333")
            .attr("r", 6)
            .attr("cx", 0)
            .attr("cy", 0)
            .merge(circles) // brings circles that were found by layer.selectAll back in so that we can edit BOTH the new stuff AND existing stuff
            .attr("transform", d => "translate("+d.x+","+d.y+")");


      // We are using a transform to move circles around rather than cx and cy
      //  This occasionally does have performance implications -- some browsers/GPUs can "cache" the circles drawn and then just paint the same circle over again if you use transform (technically: store the image in a frame buffer and then blit it somewhere), but might have to redraw the pixels if you change r, cx, cy, etc.
      //  This isn't at all guaranteed, and is still pretty rare. That said, this can be a good practice to get into if you are scaling up
      //    (Though if you really need to scale up, then SVG will quickly stop performing)

   }

   render();  // Call render once to make sure we draw circles even if simulation stops


 };

 requestData();
*/