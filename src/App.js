import { useState } from "react";
import { dijkstras } from "./algorithms/dijkstras";

import "milligram";
import "./PathGrid.css";

const START_ROW = 15;
const START_COLUMN = 25;
const FINISH_ROW = 10;
const FINISH_COLUMN = 30;
const NUM_ROWS = 25;
const NUM_COLUMNS = 50;

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
  });

  //Convenience [nodes, setNodes]
  const nodes = state.nodes;
  const setNodes = (newNodes) => {
    setState({ nodes: newNodes, isMousePressed: state.isMousePressed });
  };

  //Mouse Handlers

  //Pressing the mouse
  function handleMouseDown(row, column) {
    //Update the node at (row, column) with !isWall
    const updatedNodes = toggleWallForNode(row, column);

    //Update state with new nodes and isMousePressed = true
    setState({
      nodes: updatedNodes,
      isMousePressed: true,
    });
  }

  //Hovering
  function handleMouseEnter(row, column) {
    //If hovering but mouse isn't pressed then don't do anything
    if (!state.isMousePressed) return;

    //Update the node at (row, column) with !isWall
    const updatedNodes = toggleWallForNode(row, column);

    //Update state with new nodes
    setNodes(updatedNodes);
  }

  //Releasing Mouse
  function handleMouseUp() {
    //Update mousepressed state to be false
    setState({
      nodes: state.nodes,
      isMousePressed: false,
    });
  }

  //Toggle the isWall property for the node at the given row and column
  //And return the updated 2D array of nodes
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
    const visitedNodesInOrder = dijkstras(nodes);

    //Iterate through visited nodes in order and update state to animate
    for (let i = 0; i < visitedNodesInOrder.length; i++) {
      setTimeout(() => {
        const currNode = visitedNodesInOrder[i];
        const updatedNodes = nodes.slice();

        //Create new node with isVisited as true
        const updatedNode = {
          ...currNode,
          isVisited: true,
        };

        //Update node in nodes
        updatedNodes[currNode.row][currNode.column] = updatedNode;

        //Update state
        setNodes(updatedNodes);
      }, 0.0025 * i);
    }
  }

  return (
    <div>
      <div className="container container-small">
        <div className="row">
          <div className="column column-100">
            <button onClick={visualizeDijkstras}>Visualize</button>
          </div>
        </div>
      </div>
      <div className="container">
        {nodes.map((row, rowIdx) => {
          return (
            <div key={rowIdx} className="row">
              {row.map((node, nodeIdx) => (
                <Node
                  key={nodeIdx}
                  isStart={node.isStart}
                  isFinish={node.isFinish}
                  isVisited={node.isVisited}
                  isWall={node.isWall}
                  handleMouseUp={handleMouseUp}
                  handleMouseDown={handleMouseDown}
                  handleMouseEnter={handleMouseEnter}
                />
              ))}
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
  };

  return currNode;
}

//Represents a single node/grid square in the grid
function Node(props) {
  const {
    isStart,
    isFinish,
    isVisited,
    isWall,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
  } = props;
  const nodeTypeClass = isStart ? "start-node" : isFinish ? "end-node" : "";
  const visitedClass = isVisited ? "visited" : "";
  const className = "column-2 node " + nodeTypeClass + " " + visitedClass;
  return <div className={className}></div>;
}

export default App;
