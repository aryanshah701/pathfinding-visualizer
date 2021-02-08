//Run dijkstras and return the order in which nodes were visited
export function dijkstras(nodes) {
  //Working on a copy to keep render functions pure
  const nodesCopy = createDeepCopy(nodes);
  const nodesYetToVisit = nodesCopy.flat();
  const startNode = getNode(nodesCopy, true, false);
  const endNode = getNode(nodesCopy, false, true);

  //Set distance of start node to 0
  startNode.distance = 0;

  //Keeping track of visited nodes
  let visitedNodesInOrder = [];

  //Visit nodes till no more nodes left to visit
  //or till the finish node is found
  while (nodesYetToVisit.length > 0) {
    //Sort the nodes left to visited by distance and get the smallest value
    const closestNode = sortNodesByDistance(nodesYetToVisit).shift();

    //If closest node is at Infinity(impossible to get to final node), just break
    if (closestNode.distance === Infinity) break;

    //If closest node is a wall, ignore
    if (closestNode.isWall) continue;

    //Visit closest node
    closestNode.visited = true;
    visitedNodesInOrder.push(closestNode);

    //Finished
    if (closestNode === endNode) break;

    //Explore the closest node(update neighbours)
    exploreNode(closestNode, nodesCopy);
  }

  //Return the order in which nodes are visited and the shortest path sequence
  return {
    visitedNodesInOrder: visitedNodesInOrder,
    shortestPathSequence: getShortestPath(nodesCopy),
  };
}

//Backtracking to get the sequence of nodes in the shortest path
function getShortestPath(nodes) {
  const startNode = getNode(nodes, true, false);
  const endNode = getNode(nodes, false, true);
  let currNode = createNodeCopy(endNode);
  let shortestPath = [];

  //Backtrack till we reach the start node
  while (currNode && !areEqualNodes(currNode, startNode)) {
    console.log("in");
    //Add currNode into the path
    shortestPath.push(currNode);

    //Update current node(go back)
    currNode = createNodeCopy(currNode.previousNode);
  }

  //Sequence is reverse so returning the reverse
  return shortestPath.reverse();
}

//Whether or not the 2 nodes are equal based on their row and column
function areEqualNodes(node1, node2) {
  return node1.row === node2.row && node1.column === node2.column;
}

//Updates the distance of the neighbours of the given node
function exploreNode(node, nodesCopy) {
  const neighbours = getNeighbours(node, nodesCopy);
  for (let neighbour of neighbours) {
    neighbour.distance = node.distance + 1;
    neighbour.previousNode = createNodeCopy(node);
  }
}

//Provides the neighbours of the given node
function getNeighbours(node, nodesCopy) {
  let neighbours = [];
  const numRows = nodesCopy.length;
  const numColumns = nodesCopy[0].length;

  const { row, column } = node;
  if (row > 0) neighbours.push(nodesCopy[row - 1][column]);
  if (column > 0) neighbours.push(nodesCopy[row][column - 1]);
  if (row < numRows - 1) neighbours.push(nodesCopy[row + 1][column]);
  if (column < numColumns - 1) neighbours.push(nodesCopy[row][column + 1]);

  return neighbours.filter((node) => !node.isVisited);
}

//Sorts nodes based on the distance
function sortNodesByDistance(nodes) {
  return nodes.sort((node1, node2) => node1.distance - node2.distance);
}

//Searches for the node with the given start and finish booleans
function getNode(nodes, start, finish) {
  let filterdNodes = nodes.map((row) => {
    return row.filter((node) => {
      return node.isStart === start && node.isFinish === finish;
    });
  });

  return filterdNodes.filter((row) => row.length > 0)[0][0];
}

//Creates a deep copy of the nodes
function createDeepCopy(nodes) {
  const deepCopy = [];
  for (const row of nodes) {
    const copyRow = [];
    for (const node of row) {
      let copyNode = createNodeCopy(node);
      copyRow.push(copyNode);
    }
    deepCopy.push(copyRow);
  }

  return deepCopy;
}

//Creates a copy of a node
function createNodeCopy(node) {
  const copyNode = {
    row: node.row,
    column: node.column,
    isStart: node.isStart,
    isFinish: node.isFinish,
    distance: node.distance,
    isVisited: node.isVisited,
    isWall: node.isWall,
    previousNode: node.previousNode,
  };

  return copyNode;
}
