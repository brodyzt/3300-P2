//this first part is just code I found online to get an idea of what to do

// set the dimensions and margins of the graph
var margin = {
        top: 10,
        right: 30,
        bottom: 30,
        left: 40
    },
    width = 400 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;


const getNetwork = async () => {

    const data = await d3.json("testNodes.json");

    let svg = d3.select("svg#graph")

        // Initialize the links
        var link = svg
            .selectAll("line")
            .data(data.links)
            .enter()
            .append("line")
            .style("stroke", "#aaa")

    // Initialize the nodes
    var node = svg
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", 20)
        .style("fill", "#69b3a2")

    console.log(node)

    // Let's list the force we wanna apply on the network
    var simulation = d3.forceSimulation(data.nodes) // Force algorithm is applied to data.nodes
        .force("link", d3.forceLink() // This force provides links between nodes
            .id(function (d) {
                return d.id;
            }) // This provide  the id of a node
            .links(data.links) // and this the list of links
        )
        .force("charge", d3.forceManyBody().strength(-
            400)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
        .force("center", d3.forceCenter(width / 2, height /
            2)) // This force attracts nodes to the center of the svg area
        .on("end", ticked);

    // This function is run at each iteration of the force algorithm, updating the nodes position.
    function ticked() {
        link
            .attr("x1", function (d) {
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

        node
            .attr("cx", function (d) {
                return d.x + 6;
            })
            .attr("cy", function (d) {
                return d.y - 6;
            });
    }

};

getNetwork();



var options = {
    keys: ['title'],
    id: 'title'
};


const getInput = async () => {

    const data = await d3.json("testSearch.json");

    var fuse = new Fuse(data, options)
    console.log(fuse.search("old"))

    var body = d3.select('body')

    body.append('input')
        .attr('type', 'text')
        .attr('name', 'textInput')
        .on("input", function () {
            titleSearch(this.value);
        });

    function titleSearch(title) {
        console.log(fuse.search(title));
    }
};

getInput();




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