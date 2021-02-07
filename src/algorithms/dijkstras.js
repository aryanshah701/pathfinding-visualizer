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

    //Finished
    if (closestNode === endNode) {
      console.log("Success");
      console.log(endNode);
      console.log(visitedNodesInOrder);
      return visitedNodesInOrder;
    }

    //Visit closest node
    closestNode.visited = true;
    visitedNodesInOrder.push(closestNode);

    //Explore the closest node(update neighbours)
    exploreNode(closestNode, nodesCopy);
  }

  return nodes;
}

//Updates the distance of the neighbours of the given node
function exploreNode(node, nodesCopy) {
  const neighbours = getNeighbours(node, nodesCopy);
  for (let neighbour of neighbours) {
    neighbour.distance = node.distance + 1;
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

  return neighbours;
}

//Sorts nodes based on the distance
function sortNodesByDistance(nodes) {
  return nodes.sort((node1, node2) => node1.distance - node2.distance);
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

//Searches for the node with the given start and finish booleans
function getNode(nodes, start, finish) {
  let filterdNodes = nodes.map((row) => {
    return row.filter((node) => {
      return node.isStart === start && node.isFinish === finish;
    });
  });

  return filterdNodes.filter((row) => row.length > 0)[0][0];
}
