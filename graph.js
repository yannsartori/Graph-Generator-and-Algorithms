let dumbconsole = function(obj) { //debugging purposes
    console.log(JSON.parse(JSON.stringify(obj)));
};
/**The following below just deals with creating and drawing a graph. **/

//the following below deals with graph operations (model)
const PRIMARY_VERTEX = 0; const SOURCE = 1; const SINK = 2; // for special vertices 
let vertices = [];
let lastVertexLabel = ""; //for creating new vertices
let removedLabels = [];
let specialVertices = [null, null, null];
let graph = []; //adjacency matrix representation because JS is b l a z i n g f a s t with arrays.

function Edge(weight, directed, marked) {
  this.weight = weight;
  this.directed = directed;
}
function Vertex(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 14;
    this.label = determineLabel();
    vertices.push(this);
    if (graph.length === 0) graph = [[null]];
    else {
      for (let i = 0; i < graph.length; i++) graph[i].push(null); //adds column for vertex
      graph.push([]);
      for (let i = 0; i < graph[0].length; i++) graph[graph.length - 1].push(null); //adds row
    }
    
    this.visited = false;
}
function determineLabel() { // allows for 27 * 26 vertices... Code could be more robust but I doubt that case will be hit...
  if (vertices.length === 0) { 
    removedLabels = []; 
    return (lastVertexLabel = 'A'); 
  }
  if (removedLabels.length !== 0) return removedLabels.shift(); //takes from vertices removed first, if any
  if (lastVertexLabel.length === 1 && lastVertexLabel !== 'Z') return (lastVertexLabel = String.fromCharCode(lastVertexLabel.charCodeAt(0) + 1));
  if (lastVertexLabel.length === 1 && lastVertexLabel === 'Z') return (lastVertexLabel = "AA");
  if (lastVertexLabel[1] !== 'Z') return (lastVertexLabel = String.fromCharCode(lastVertexLabel.charCodeAt(0) + 1) + 'A'); 
        
}
function removeVertex(label) {
  removedLabels.push(label);
  let i = 0;
  for (i; i < vertices.length; i++) {
    if (vertices[i].label === label) {
      vertices.splice(i, 1);
      for (let j = 0; j < specialVertices.length; j++) {
        if (specialVertices[j] && specialVertices[j].label === label) specialVertices.splice(j--, 1);
      } 
      break;
    }
  }
  graph.splice(i, 1); //vertices are pushed in the same order as graph, so indicies are the same
  for (let elem of graph) elem.splice(i, 1);
}
function addEdge(fromLabel, toLabel, weight, directed) {
  let i = -1, j = -1;
  for (let k = 0; k < graph.length; k++) {
    if (vertices[k].label === fromLabel) i = k;
    else if (vertices[k].label === toLabel) j = k;
    if (i > -1 && j > -1) break;
  }
  if (!directed) graph[j][i] = new Edge(weight, directed); //adds vu
  graph[i][j] = new Edge(weight, directed); //adds uv
}
function removeEdge(fromLabel, toLabel) {
  addEdge(fromLabel, toLabel, 0, true);
}
function clearAll() {
  vertices = [];
  graph = [];
  lastVertexLabel = "";
  removedVertexLabel = [];
  draw();
}

//the following below deals with drawing (view)
let canvas = document.getElementById("mainCanvas");
let ctx = canvas.getContext("2d");
function graphicalSetUp() {
  canvas.width = parseInt(window.getComputedStyle(document.getElementsByTagName("section")[0]).width);
  canvas.height = canvas.width * 0.50;
  draw();
}
function draw() {
  pauseRequest = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  for (let i = 0; i < graph.length; i++) {
    for (let j = 0; j < graph[0].length; j++) {
      if (graph[i][j] !== null && graph[i][j].weight !== 0 && graph[j][i] !== null && graph[j][i].weight !== 0) { //edge isn't blank
        if (i > j) {
          drawEdge(vertices[i], vertices[j], graph[i][j].weight, graph[j][i].weight, graph[i][j].directed, true); //we'll have to loop the edges
        }
      } //the edge isn't blank
      else if (graph[i][j] !== null && graph[i][j].weight !== 0) drawEdge(vertices[i], vertices[j], graph[i][j].weight, NaN, graph[i][j].directed, false);
    }
  }
  
  for (let vertex of vertices) { //for dfs
    if (vertex.visited) drawVertex(vertex, "blue"); 
    else drawVertex(vertex);
  }
  ctx.save();
  if (specialVertices[SOURCE]) drawVertex(specialVertices[SOURCE], "green");
  else if (specialVertices[PRIMARY_VERTEX]) drawVertex(specialVertices[PRIMARY_VERTEX], "green");
  if (specialVertices[SINK]) drawVertex(specialVertices[SINK], "red");
  clearVisited(); //next time we draw, dfs isn't showing
  ctx.restore();
}
function drawFlows(graph) {
  pauseRequest = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  for (let i = 0; i < graph.length; i++) {
    for (let j = 0; j < graph[0].length; j++) {
      if (graph[i][j] !== 0 && graph[j][i] !== 0) { //edge isn't blank
        if (i > j) {
          drawEdge(vertices[i], vertices[j], graph[i][j], graph[j][i], true, true); //we'll have to loop the edges
        }
      } //the edge isn't blank
      else if (graph[i][j] !== 0) drawEdge(vertices[i], vertices[j], graph[i][j], NaN, true, false);
    }
  }
  
  for (let vertex of vertices) drawVertex(vertex);
  ctx.save();
  if (specialVertices[SOURCE]) drawVertex(specialVertices[SOURCE], "green");
  else if (specialVertices[PRIMARY_VERTEX]) drawVertex(specialVertices[PRIMARY_VERTEX], "green");
  if (specialVertices[SINK]) drawVertex(specialVertices[SINK], "red");
  ctx.restore();
}
function drawVertex(vertex, colour, label) {
  ctx.save();
  ctx.fillStyle = (colour) ? colour : "black";
  ctx.strokeStyle = (colour) ? colour : "black";
  ctx.moveTo(vertex.x, vertex.y);
  ctx.beginPath();
  ctx.arc(vertex.x, vertex.y, vertex.radius, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.moveTo(vertex.x, vertex.y);
  ctx.fillStyle = "white";
  ctx.font = "15px Lucida Console";
  ctx.textAllign = "center";
  let toWrite = (typeof label !== "undefined") ? label : vertex.label;
  ctx.fillText(toWrite, vertex.x - 5 * (toWrite + "").length, vertex.y + 5);
  ctx.restore();
}
function drawDijkstra(labels) {
  pauseRequest = true;
  let vertexLabels = labels[0];
  let predLabels = labels[1];
  console.log(vertexLabels);
  console.log(predLabels);
  for (let i = 1; i < vertices.length; i++) {
    if (graph[i][predLabels[i]] !== null && graph[i][predLabels[i]].weight !== 0)
      drawEdge(vertices[predLabels[i]], vertices[i], graph[predLabels[i]][i].weight, graph[i][predLabels[i]].weight, graph[predLabels[i]][i].directed, true, "green");
    else
      drawEdge(vertices[predLabels[i]], vertices[i], graph[predLabels[i]][i].weight, NaN, graph[predLabels[i]][i].directed, false, "green");
  }
  for (let i = 0; i < vertices.length; i++) drawVertex(vertices[i], "black", vertexLabels[i].value);
}
function drawFW(retVal) {
  pauseRequest = true;
  let distances = retVal[0];
  let negativeCycle = retVal[1];
  let cellSize = 50;
  let top = (canvas.height - (distances.length + 1) * cellSize) / 2; //centers it
  let left = (canvas.width - (distances.length + 1) * cellSize) / 2;
  
  ctx.save();
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = ctx.fillStyle = "black";
  ctx.font = "15px Lucida Console";
  ctx.textAllign = "center";
  ctx.lineWidth = 6;
  for (let i = 0; i < distances.length + 1; i++) {
    for (let j = 0; j < distances.length + 1; j++) {
      ctx.beginPath();
      ctx.moveTo(left + (j * cellSize), top + (i * cellSize));
      ctx.rect(left + (j * cellSize), top + (i * cellSize), cellSize, cellSize);
      let toWrite = "";
      if (i === 0 && j === 0) ;      
      else if (i === 0) toWrite = vertices[j - 1].label;
      else if (j === 0) toWrite = vertices[i - 1].label;
      else toWrite = (distances[i - 1][j - 1] === Infinity) ? "\u221E" : distances[i - 1][j - 1];
      ctx.fillText(toWrite, left + (j * cellSize) + ctx.lineWidth, top + (i * cellSize) + cellSize / 2 + ctx.lineWidth);
      ctx.stroke();
    }
  }
  ctx.restore();
  if (negativeCycle) alert("A negative cycle was detected!");
}

let mousePos = []; //used for dynamic drawing of edge uv
function drawEdge(fromVertex, toVertex, fromWeight, toWeight, directed, looped, style) {
  ctx.save();
  ctx.lineWidth = 6;
  let colour = (style) ? style : "blue";
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  let distance = Math.sqrt(Math.pow(fromVertex.x - toVertex.x, 2) + Math.pow(fromVertex.y - toVertex.y, 2));
  let dx = (toVertex.x-fromVertex.x) / distance; //used for placing edge weights
  let dy = (toVertex.y - fromVertex.y) / distance;
  if (!directed) { //don't have to deal with loops because that wouldn't make sense for unweighted
    ctx.beginPath();
    ctx.moveTo(fromVertex.x, fromVertex.y); //simple line
    ctx.lineTo(toVertex.x, toVertex.y);
    ctx.stroke();
  } else {
    if (looped) {
      ctx.save();
      ctx.beginPath();
      ctx.translate(fromVertex.x + dx * 0.5 * distance, fromVertex.y + dy * 0.5 * distance); //midpoint
      if (dx > 0) ctx.rotate(Math.atan(dy/dx) - Math.PI); //for quadrants
      else ctx.rotate(Math.atan(dy/dx));
      ctx.ellipse(0,0, distance * 0.5, distance * 0.1, 0, 0, 2*Math.PI, true);
      ctx.stroke();
      
      ctx.save();//deals with from->to
      //the trig terms is to deal with the ellipse having different curvatures at different distance (i.e. scaling factors)
      //translates to where the ellipse intersects to 
      ctx.translate(0.5 * distance -toVertex.radius * Math.sin(Math.PI * (1-distance*.001)/2), -toVertex.radius * Math.cos(Math.PI * (1-distance*.001)/2)); 
      ctx.rotate(-Math.PI/12);
      ctx.beginPath();
      ctx.moveTo(0, 0); //draws arrow head
      ctx.lineTo(0,  - 1.5 * toVertex.radius);
      ctx.lineTo(- 1.5*toVertex.radius, 0);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.restore();
      
      ctx.save();//deals with to->from
      ctx.translate(-0.5 * distance +toVertex.radius * Math.sin(Math.PI * (1-distance*.001)/2), fromVertex.radius * Math.cos(Math.PI * (1-distance*.001)/2));
      ctx.rotate(Math.PI/12);
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.lineTo(1.5 * fromVertex.radius, 0);
      ctx.lineTo(0, 1.5 * fromVertex.radius);
      ctx.lineTo(0,0);
      ctx.fill();
      ctx.restore();
      
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.moveTo(fromVertex.x, fromVertex.y);
      ctx.lineTo(toVertex.x - (dx * (toVertex.radius*1.1)), toVertex.y - (dy * (toVertex.radius*1.1))); //draws the line just a bit before the edge of the vertex
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(toVertex.x - (dx * (toVertex.radius)), toVertex.y - (dy * (toVertex.radius)));
      let posOfInterest = [toVertex.x - 1.5* (dx * toVertex.radius), toVertex.y - 1.5 * (dy * toVertex.radius)];
      ctx.lineTo(posOfInterest[0] + 0.25*(-dy)*toVertex.radius,  posOfInterest[1] + 0.25*(dx)*toVertex.radius);
      ctx.lineTo(posOfInterest[0] - 0.25*(-dy)*toVertex.radius,  posOfInterest[1] - 0.25*(dx)*toVertex.radius);
      ctx.lineTo(toVertex.x - (dx * toVertex.radius*.86), toVertex.y - (dy * toVertex.radius*.86));
      ctx.fill();
      ctx.stroke();
    }
  }
  
  ctx.fillStyle = "white";
  ctx.font = "15px Lucida Console";
  ctx.textAllign = "center"
  let posOfInterest = [dx * distance * .5 + fromVertex.x, dy * distance * .5 + fromVertex.y]; //midway
  ctx.moveTo(posOfInterest[0], posOfInterest[1]);
  ctx.translate(posOfInterest[0], posOfInterest[1]);
  ctx.rotate(Math.atan(dy/dx)); //x axis is now the edge
  if (looped && directed) {
    ctx.fillRect(-15, distance * 0.1 - 15, 30, 30);
    ctx.fillRect(-15, -distance * 0.1 - 15, 30, 30);
    ctx.fillStyle = "black";
    ctx.fillText(fromWeight, -5, 2 + distance * 0.1);
    ctx.fillText(toWeight, -5, 2 - distance * 0.1);
  } else {
    ctx.fillRect(-15, -15, 30, 30);
    ctx.fillStyle = "black";
    ctx.fillText(fromWeight, -5, 2);
  }
  ctx.restore();
}
let pauseRequest = false;
window.requestAnimationFrame(function callback() {
  console.log(pauseRequest);
  if (pauseRequest) {
    window.requestAnimationFrame(callback);
    return;
  }
  draw(); //so we don't have stray edges
  if (vertexUPos === -1) window.requestAnimationFrame(callback);
  else {
    let rad = 12; //It's "hardcoded" in the sense that its an "arbritray number" but it is the vertex radius. I didn't do vertices[0].radius in case I ever want to have different sized vertices
    if (keyDown !== "u") {
      //used so that the arrow head is always directly below mouse (due to how it is drawn)
      let distance = Math.sqrt(Math.pow(vertices[vertexUPos].x - mousePos[0], 2) + Math.pow(vertices[vertexUPos].y - mousePos[1], 2));
      let dx = (mousePos[0]-vertices[vertexUPos].x) / distance;
      let dy = (mousePos[1] - vertices[vertexUPos].y) / distance;
      drawEdge(vertices[vertexUPos], {x: mousePos[0] + dx*rad, y: mousePos[1] + dy*rad, radius: rad},0 ,0, true, false);
    }
    else drawEdge(vertices[vertexUPos], {x: mousePos[0], y: mousePos[1], radius: rad},0 ,0, false, false);
    window.requestAnimationFrame(callback);
  }
});

//The following deals with input (control)

//registers which key is used
let keyDown = null;
let vertexUPos = -1; //used for creating edges. Since u, v have to be clicked, anything else resets vertexUPos
let vertexBeingDragged = null;
function getVertexFromMouse(event) { //returns the index at which the vertex was found
    let mouseX = event.clientX - parseInt(canvas.getBoundingClientRect().left);
    let mouseY = event.clientY - parseInt(canvas.getBoundingClientRect().top);
    let i = 0;
    for (i; i < vertices.length; i++) {
      if (Math.abs(vertices[i].x - mouseX) <= vertices[i].radius && Math.abs(vertices[i].y - mouseY) <= vertices[i].radius) {
        return i;
      }
    }
}
//for the dynamic drawing
canvas.addEventListener("mousemove", event => mousePos = [event.clientX - parseInt(canvas.getBoundingClientRect().left), event.clientY - parseInt(canvas.getBoundingClientRect().top)]);
//double click on blank space adds a vertex. double click on vertex or edge deletes it
canvas.addEventListener("click", function(event) {
  if (event.detail === 2) {//double-click
    vertexUPos = -1;
    let i = getVertexFromMouse(event);
    if (i < vertices.length) removeVertex(vertices[i].label);
    else new Vertex(mousePos[0], mousePos[1]); //there was no vertex under the mouse found
    draw();
  }
});
//adds vertex as PRIMARY_VERTEX, and SOURCE if valid, if "s" is pressed
canvas.addEventListener("click", function(event) {
  if (keyDown === "s") {
    vertexUPos = -1;
    let i = getVertexFromMouse(event);
    if (i < vertices.length) { //was found
      if (specialVertices[PRIMARY_VERTEX] === vertices[i]) { //removes as vertex if already selected
        specialVertices[PRIMARY_VERTEX] = null;
        draw();
        return;
      }
      specialVertices[PRIMARY_VERTEX] = vertices[i];
      if (specialVertices[PRIMARY_VERTEX] === specialVertices[SINK]) specialVertices[SINK] = null; //can't be both
      let validSource = true;
      for (let j = 0; j < graph.length; j++) {
        if (graph[j][i] && graph[j][i].weight > 0) { //make sure no edges are entering the source
          validSource = false
          break;
        }
      }
      if (validSource) {
        for (let j = 0; j < graph[0].length; j++) {
          if (graph[i][j] && graph[i][j].weight < 0) { //make sure no negative edges are leaving the source
            validSource = false;
            break;
          }
        }
        if (validSource) {
          if (specialVertices[SOURCE] === vertices[i]) specialVertices[SOURCE] = null;
          else specialVertices[SOURCE] = vertices[i];
        }
      }
    }
    draw();
  }
});
//adds vertex as SINK, if valid, if "t" is pressed
canvas.addEventListener("click", function(event) {
  if (keyDown === "t") {
    vertexUPos = -1;
    let i = getVertexFromMouse(event); //pretty much the same logic as source
    if (i < vertices.length) {
      let validSink = true;
      for (let j = 0; j < graph.length; j++) {
        if (graph[j][i] && graph[j][i].weight < 0) {
          validSink = false
          break;
        }
      }
      if (validSink) {
        for (let j = 0; j < graph[0].length; j++) {
          if (graph[i][j] && graph[i][j].weight > 0) {
            validSink = false;
            break;
          }
        }
        if (validSink) {
          if (specialVertices[SINK] === vertices[i]) specialVertices[SINK] = null;
          else specialVertices[SINK] = vertices[i];
          if (specialVertices[SINK] === specialVertices[SOURCE]) specialVertices[PRIMARY_VERTEX] = specialVertices[SOURCE] = null;
          draw();
        }
      }
    }
  }
});
//connects vertexU to vertexV
canvas.addEventListener("click", function(event) {
  if (event.detail === 1 && !vertexBeingDragged && (keyDown !== "s" && keyDown !== "t" && !(+keyDown > 0))) { //single click, not conflicting with anything
    let i = getVertexFromMouse(event);
    if (i < vertices.length) {
      if (vertexUPos === -1) vertexUPos = i; //u wasn't selected
      else { //u has been selected
        let directed = (keyDown !== "u");
        if (vertexUPos === i) {
          vertexUPos = -1;
          return;
        }
        let weight = +prompt("What weight do you wish to give?");
        if (weight === null || isNaN(weight)) return;
        addEdge(vertices[vertexUPos].label, vertices[i].label, weight, directed);
        draw();
        vertexUPos = -1;
      }
    } else vertexUPos = -1; //click else where, cancels
  }
});
let clearDrag = false;
canvas.addEventListener("mousedown", event => {
  clearDrag = false;
  setTimeout(() => { //makes a "click and hold" effect
    if (!clearDrag) {
      vertexBeingDragged = vertices[getVertexFromMouse(event)]
    }
  }, 100);
});
canvas.addEventListener("mouseup", () => {
  clearDrag = true;
  setTimeout(() => vertexBeingDragged = null, 50); //since click (which controls the uv edge thing) gets triggered after mouse up
});
canvas.addEventListener("mousemove", event => moveFunction(event));
let moveFunction = function(event) { //there was a reason this couldn't be anyonomous... I forgot the reason  
  let mouseX = event.clientX - parseInt(canvas.getBoundingClientRect().left);
  let mouseY = event.clientY - parseInt(canvas.getBoundingClientRect().top);
  if (vertexBeingDragged) {
    vertexUPos = -1;
    vertexBeingDragged.x = mouseX;
    vertexBeingDragged.y = mouseY;
    draw();
  }
}
canvas.addEventListener("keydown", event => keyDown = event.key);
canvas.addEventListener("keyup", () => {keyDown = null;});

canvas.addEventListener("keydown", event => { //DFS listener
  if (event.key !== "1") return;
  if (!specialVertices[PRIMARY_VERTEX]) {alert("Choose a primary vertex"); return;}
  depthFirstSearch(specialVertices[PRIMARY_VERTEX]);
});

canvas.addEventListener("keydown", event => { //dijkstraAlgorithm listener
  if (event.key !== "2") return;
  if (!specialVertices[PRIMARY_VERTEX]) {alert("Choose a primary vertex"); return;}
  dijkstraAlgorithm(specialVertices[PRIMARY_VERTEX]);
});

canvas.addEventListener("keydown", event => { //kruskal listener
  if (event.key !== "3") return;
  let kGraph = kruskalsAlgorithm();
  for (let i = 0; i < kGraph.length; i++) {
    for (let j = 0; j < kGraph[i].length; j++) {
      pauseRequest = true;
      if (kGraph[i][j]) {
        drawEdge(vertices[i], vertices[j], kGraph[i][j].weight, NaN, false, false, "green");
      }
    }
  }
  for (let elem of vertices) drawVertex(elem);  
});

canvas.addEventListener("keydown", event => {
  if (event.key !== "4") return;
  let retVal = floydWarshall();
  drawFW(retVal);
});
canvas.addEventListener("keydown", event => {
  if (event.key !== "5") return;
  if (!specialVertices[SOURCE] || !specialVertices[SINK]) {alert("Choose a source and sink vertex"); return;}
  alert(`The max flow in this graph is ${edmondsKarp()} units and can be sent in the following manner`);
});
graphicalSetUp();

//The following below deal with graph algorithms

//Clears visited for search algorithms
function clearVisited() {
  for (let elem of vertices) elem.visited = false;
}
function depthFirstSearch(vertex) {
  for (let i = 0; i < vertices.length; i++) { 
    if (vertices[i] === vertex) {
      _depthFirstSearch(i); //makes the recursion quicker
      draw();
      pauseRequest = true;
    }
  }
}
function _depthFirstSearch(vertexIndex) {
  vertices[vertexIndex].visited = true;
  for (let j = 0; j < graph[vertexIndex].length; j++) {
    if (graph[vertexIndex][j] && !vertices[j].visited) _depthFirstSearch(j);
  }
  return;
}
function dijkstraAlgorithm(vertex) {
  for (let i = 0; i < vertices.length; i++) { 
    if (vertices[i] === vertex) {
      let labels = _dijkstraAlgorithm(i); //makes stuff easier
      drawDijkstra(labels);
    }
  }
}
function _dijkstraAlgorithm(vertexIndex) {
  let vertexLabels = [];
  let predLabels = [];
  let minIndex = vertexIndex;
  for (let i = 0; i < vertices.length; i++) { //initalizes the list of vertices with value 0 if source, inf otherwise
    predLabels.push(0);
    vertexLabels.push(new Object());
    vertexLabels[i].done = false;
    if (i === vertexIndex) vertexLabels[i].value = 0;
    else vertexLabels[i].value = Infinity;
  }
  for (let vertexCount = 0; vertexCount < vertices.length; vertexCount++) {
    let i = minIndex;
    let minVal = Infinity;
    vertexLabels[i].done = true;
    for (let j = 0; j < graph[i].length; j++) {//goes through neighbours of min vertex
      if (graph[i][j] && !vertexLabels[j].done) {
        if (vertexLabels[i].value + graph[i][j].weight < vertexLabels[j].value) { //if it's cheaper to go min->v than what was u->v, update
          vertexLabels[j].value = vertexLabels[i].value + graph[i][j].weight;
          predLabels[j] = i;
        }
      } 
    }
    for (let j = 0; j < vertexLabels.length; j++) { //find minVal
      if (!vertexLabels[j].done && vertexLabels[j].value < minVal) {
        minVal = vertexLabels[j].value;
        minIndex = j;
      }
    }
  }
  return [vertexLabels, predLabels];
}
function kruskalsAlgorithm() {
  let kGraph = []; //blank graph
  let orderedEdges = []; //for adding edges
  for (let i = 0; i < vertices.length; i++) {
    kGraph.push([]);
    for (let j = 0; j < vertices.length; j++) {
      kGraph[i].push(null);
      if (graph[i][j]) {
    	if (graph[i][j].directed) {
              alert("Edges must be undirected");
    	  return;
    	}
      orderedEdges.push(new Object());
      orderedEdges[orderedEdges.length - 1].from = i;
	    orderedEdges[orderedEdges.length - 1].to = j;
	    orderedEdges[orderedEdges.length - 1].weight = graph[i][j].weight;
      }
    }
  }
  orderedEdges.sort((a, b) => a.weight - b.weight);
  let edgeCount = 0;
	
  for (let i = 0; i < orderedEdges.length; i++) { //goes through the list of edges in increasing weight
    kGraph[orderedEdges[i].from][orderedEdges[i].to] = new Edge(orderedEdges[i].weight, false);
    if (containsCycle(kGraph, orderedEdges[i].from)) kGraph[orderedEdges[i].from][orderedEdges[i].to] = null; //violates tree property
    else {
      edgeCount++;
      if ((edgeCount / 2) + 1 === vertices.length) return kGraph; //we built a spanning tree
    }
  }
}
function containsCycle(adjMatrix, vertexIndex) {
  let hasACycle = false;
  let _containsCycle = function(_adjMatrix, _vertexIndex, _parentNode) { //recursive dfs with pointers
    if (hasACycle) return;
    vertices[_vertexIndex].visited = true;
    for (let j = 0; j < _adjMatrix[_vertexIndex].length; j++) {
      if (_adjMatrix[_vertexIndex][j] && !vertices[j].visited) _containsCycle(_adjMatrix, j, _vertexIndex);
      else if (_adjMatrix[_vertexIndex][j] && vertices[j].visited && j !== _parentNode) { //we have accessed a repeat edge not the parent i.e. cycle
        hasACycle = true;
	      return;
      }
    }
  }
  _containsCycle(adjMatrix, vertexIndex, null);
  clearVisited();
  return hasACycle;
}
function floydWarshall() {
  let distances = [];
  for (let i = 0; i < vertices.length; i++) {
    distances.push([]);
    for (let j = 0; j < vertices.length; j++) {
      if (graph[i][j]) distances[i].push(graph[i][j].weight);
      else if (i === j) distances[i].push(0);
      else distances[i].push(Infinity);
    }
  }
  for (let k = 0; k < vertices.length; k++) {
    for (let i = 0; i < vertices.length; i++) {
      for (let j = 0; j < vertices.length; j++) {
        if (distances[i][j] > distances[i][k] + distances[k][j]) { //if it is cheaper to go i->k->j than i->j update
      	  distances[i][j] = distances[i][k] + distances[k][j];
      	}
      }
    }
  }
  let negativeCycle = false;
  for (let i = 0; i< vertices.length; i++) {
    if (distances[i][i] < 0) {
      negativeCycle = true;
      break;
    }
  }
  return [distances, negativeCycle];
}
function edmondsKarp() {
  let residualEdgesGraph = [];
  let sIndex = -1; let tIndex = -1;
  let maxFlow = 0;
  for (let i = 0; i < vertices.length; i++) {
    if (sIndex === -1 && specialVertices[SOURCE] === vertices[i]) sIndex = i;
    else if (tIndex === -1 && specialVertices[SINK] === vertices[i]) tIndex = i;
  }
  for (let i = 0; i < vertices.length; i++) {
    residualEdgesGraph.push([]);
    for (let j = 0; j < vertices.length; j++) {
      if (graph[i][j]) residualEdgesGraph[i].push(graph[i][j].weight);
      else residualEdgesGraph[i].push(0);
    }
  }
  let breadthFirstSearch = function(graph, startingPointIndex, endingPointIndex) { //bfs that always starts at @param startingPointIndex and ends at @param endingPointIndex
    let bfsQueue = [];
    let pointers = new Array(vertices.length);
    pointers[startingPointIndex] = -1;
    bfsQueue.push(startingPointIndex);
    while (bfsQueue.length > 0) {
      let cur = bfsQueue.shift();
      vertices[cur].visited = true;
      for (j = 0; j < graph[cur].length; j++) {
        if (graph[cur][j] > 0 && !vertices[j].visited) {
          pointers[j] = cur;
          bfsQueue.push(j);
          if (j === endingPointIndex) {
            bfsQueue = [];
            break;
          }
        }
      }
    }
    clearVisited();
    return pointers;
  }
  
  
  while (true) {
    let stPath = breadthFirstSearch(residualEdgesGraph, sIndex, tIndex);
    let minFlowVal = Infinity;
    if (!stPath[tIndex]) break;
    
    let i = tIndex;
    while (stPath[i] !== -1) { //in bfs, t has a valid parent
      minFlowVal = Math.min(residualEdgesGraph[stPath[i]][i], minFlowVal);
      i = stPath[i]; //we trace back to s by following the parent pointers
    }
    maxFlow += minFlowVal;
    i = tIndex;
    while (stPath[i] !== -1) {
      residualEdgesGraph[stPath[i]][i] -= minFlowVal; //decreases forward edge
      residualEdgesGraph[i][stPath[i]] += minFlowVal; //increases back edge (i.e. we can push back the flow we pushed forward)
      i = stPath[i];
    }
  }
  drawFlows(residualEdgesGraph);
  return maxFlow;
}
