import { useState } from "react";
import { dijkstras } from "./algorithms/dijkstras";

import "milligram";
import "./PathGrid.css";

const START_ROW = 15;
const START_COLUMN = 25;
const FINISH_ROW = 15;
const FINISH_COLUMN = 40;
const NUM_ROWS = 25;
const NUM_COLUMNS = 50;
const TIMER_DELAY = 10;

function App() {
  return (
    <div>
      <h1>Dijkstra's Visualizer</h1>
      <PathGrid />
    </div>
  );
}

//The entire grid component as a collection of nodes
function PathGrid() {
  //State hook
  const [state, setState] = useState({
    nodes: setInitialNodesState(),
    isMousePressed: false,
    animationBegun: false,
  });

  //Convenience [nodes, setNodes]
  const nodes = state.nodes;
  const setNodes = (newNodes) => {
    console.log("From set nodes" + state.animationBegun);
    setState({
      nodes: newNodes,
      isMousePressed: state.isMousePressed,
      animationBegun: state.animationBegun,
    });
  };

  //Mouse Handlers

  //Handles the case when a node at row, col is pressed down on
  function handleMouseDown(row, column) {
    //Only allowed if animation hasn't begun
    if (state.animationBegun) return;

    console.log(state.animationBegun);

    //Update the node at (row, column) with !isWall
    const updatedNodes = toggleWallForNode(row, column);

    //Update state with new nodes and isMousePressed = true
    setState({
      nodes: updatedNodes,
      isMousePressed: true,
      animationBegun: state.animationBegun,
    });
  }

  //Handles the case when a node at row, col is hovered on
  function handleMouseEnter(row, column) {
    //Only allowed if animation hasn't begun
    if (state.animationBegun) return;

    //If hovering but mouse isn't pressed then don't do anything
    if (!state.isMousePressed) return;

    //Update the node at (row, column) with !isWall
    const updatedNodes = toggleWallForNode(row, column);

    //Update state with new nodes
    setNodes(updatedNodes);
  }

  //Handles the case when the mouse is let go off
  function handleMouseUp() {
    //Only allowed if animation hasn't begun
    if (state.animationBegun) return;

    //Update mousepressed state to be false
    setState({
      nodes: state.nodes,
      isMousePressed: false,
      animationBegun: state.animationBegun,
    });
  }

  /* Toggle the isWall property for the node at the given row and column
  And return the updated 2D array of nodes */
  function toggleWallForNode(row, column) {
    //Update the node at (row, column) with !isWall
    const updatedNodes = nodes.slice();
    const currNode = updatedNodes[row][column];
    const newNode = {
      ...currNode,
      isWall: !currNode.isWall,
    };

    updatedNodes[row][column] = newNode;

    return updatedNodes;
  }

  //Visualize Dijkstras function
  function visualizeDijkstras() {
    //Do nothing if already animated
    if (state.animationBegun) return;

    //Set animationBegun to true
    setState({
      ...state,
      animationBegun: true,
    });

    const { visitedNodesInOrder, shortestPathSequence } = dijkstras(nodes);

    //Iterate through visited nodes in order and update state to animate
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      //Animate shortest path sequence at the end
      if (i === visitedNodesInOrder.length) {
        setTimeout(
          () => animateShortestPathSequence(shortestPathSequence),
          TIMER_DELAY * i
        );
        return;
      }

      //Updating node to a visited node at a delay
      setTimeout(() => visitNode(visitedNodesInOrder, i), TIMER_DELAY * i);
    }
  }

  //Animate shortest path sequence
  function animateShortestPathSequence(shortestPathSequence) {
    for (let i = 0; i < shortestPathSequence.length; i++) {
      //Update node to a shortestPath node at a delay
      setTimeout(
        () => visitShortestPathNode(shortestPathSequence, i),
        TIMER_DELAY * 10 * i
      );
    }
  }

  //Visit a single node at the given index
  function visitNode(visitedNodesInOrder, index) {
    const currNode = visitedNodesInOrder[index];

    //Update state(having to access dom for performance issues)
    const nodeId = "row-" + currNode.row + "-column" + currNode.column;
    document.getElementById(nodeId).classList.add("visited");
  }

  //Visit a shortest path node at the given index
  function visitShortestPathNode(shortestPathSequence, index) {
    const currNode = shortestPathSequence[index];
    let updatedNodes = state.nodes.slice();

    //Create new and updated state with node marked as shortest path node
    const updatedNode = {
      ...currNode,
      isShortestPathNode: true,
      animationBegun: true,
    };
    updatedNodes[currNode.row][currNode.column] = updatedNode;

    //Update state
    setState({
      nodes: updatedNodes,
      isMousePressed: false,
      animationBegun: true,
    });
  }

  //Reset the grid to allow for new visualization
  function resetGrid() {
    //Reset the manual classes added(through the dom)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes[i].length; j++) {
        const nodeId = "row-" + i + "-column" + j;
        if (nodes[i][j].isStart) {
          document.getElementById(nodeId).className =
            "column-2 node start-node";
        } else if (nodes[i][j].isEnd) {
          document.getElementById(nodeId).className = "column-2 node end-node";
        } else {
          document.getElementById(nodeId).className = "column-2 node";
        }
      }
    }

    setState({
      nodes: setInitialNodesState(),
      isMousePressed: false,
      animationBegun: false,
    });
  }

  return (
    <div>
      <UserInput
        visualizeDijkstras={visualizeDijkstras}
        resetGrid={resetGrid}
      />
      <div className="container">
        {nodes.map((row, rowIdx) => {
          return (
            <div key={rowIdx} className="row">
              {row.map((node, nodeIdx) => {
                return (
                  <Node
                    key={nodeIdx}
                    isStart={node.isStart}
                    isFinish={node.isFinish}
                    isVisited={node.isVisited}
                    isWall={node.isWall}
                    isShortestPathNode={node.isShortestPathNode}
                    row={node.row}
                    column={node.column}
                    handleMouseUp={handleMouseUp}
                    handleMouseDown={handleMouseDown}
                    handleMouseEnter={handleMouseEnter}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

//Create the intial 2D shape of the grid
function setInitialNodesState() {
  let nodes = [];

  for (let i = 0; i < NUM_ROWS; i++) {
    let row = [];
    for (let j = 0; j < NUM_COLUMNS; j++) {
      let currNode = createNode(i, j);
      row.push(currNode);
    }
    nodes.push(row);
  }

  return nodes;
}

//Create a single node with initial properties
function createNode(row, col) {
  let currNode = {
    row: row,
    column: col,
    isStart: row === START_ROW && col === START_COLUMN,
    isFinish: row === FINISH_ROW && col === FINISH_COLUMN,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
    isShortestPathNode: false,
  };

  return currNode;
}

//Component for user input buttons
function UserInput(props) {
  const { visualizeDijkstras, resetGrid } = props;
  return (
    <div className="container container-small">
      <div className="row">
        <div className="column column-50">
          <button onClick={visualizeDijkstras}>Visualize</button>
        </div>
        <div className="column column-50">
          <button onClick={resetGrid}>Reset</button>
        </div>
      </div>
    </div>
  );
}

//Represents a single node/grid square in the grid
function Node(props) {
  //Props passed down
  const {
    isStart,
    isFinish,
    isVisited,
    row,
    column,
    isWall,
    isShortestPathNode,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
  } = props;

  //Figure out node's css class based on which type of node it is
  const nodeTypeClass = isStart
    ? "start-node"
    : isFinish
    ? "end-node"
    : isWall
    ? "wall-node"
    : "";

  //Add on the visited css class if node has been visited(during animation)
  const visitedClass = isShortestPathNode
    ? "shortest-path-node"
    : isVisited
    ? "visited"
    : "";
  const className = "column-2 node " + nodeTypeClass + " " + visitedClass;

  //Id of the node
  const nodeId = "row-" + row + "-column" + column;

  //Render node
  return (
    <div
      id={nodeId}
      className={className}
      onMouseDown={() => handleMouseDown(row, column)}
      onMouseEnter={() => handleMouseEnter(row, column)}
      onMouseUp={() => handleMouseUp(row, column)}
    ></div>
  );
}

export default App;
