import { useState, useCallback, useEffect } from "react";
import ReactFlow, { MiniMap, Controls, Background, addEdge, applyNodeChanges, applyEdgeChanges } from "reactflow";
import "reactflow/dist/style.css";

function LessonEditor() {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [availableIntents, setAvailableIntents] = useState([]); // Intents from Rasa

    // Fetch intents from Rasa API
    useEffect(() => {
        async function fetchIntents() {
        try {
            const response = await fetch("http://localhost:5005/domain", {
                headers: {
                    "Accept" : "application/json"
                }
            });

            if(!response.ok){
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.intents) {
                setAvailableIntents(data.intents);
            }
        } catch (error) {
            console.error("Error fetching intents:", error);
        }
        }

        fetchIntents();
    }, []);

const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
const onConnect = useCallback((connection) => setEdges((eds) => addEdge(connection, eds)), []);

const onDrop = (event) => {
    event.preventDefault();
    const intentName = event.dataTransfer.getData("application/reactflow");

    if (!intentName) return; // If no intent was dragged, ignore

    const newNode = {
      id: intentName,
      position: { x: Math.random() * 400, y: Math.random() * 400 }, // Random position
      data: { label: intentName },
      type: "default"
    };

    setNodes((nds) => [...nds, newNode]); // Add to flowchart
  };

  const onDragOver = (event) => {
    event.preventDefault(); // Allow drop
    event.dataTransfer.dropEffect = "move";
  };

  // Handle dragging intents from selection box
  const onDragStart = (event, intentName) => {
    event.dataTransfer.setData("application/reactflow", intentName);
    event.dataTransfer.effectAllowed = "move";
  };

return (
    <div style={{ width: "100vw", height: "100vh", display:"flex", flexDirection:"column"}}>
        <h2>Lesson Editor</h2>

        {/* Flowchart area */}
        <div style={{ flex: 1, position: "relative", border: "1px solid #ccc" }} onDrop={onDrop}
        onDragOver={onDragOver}>
            <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            >
            <MiniMap />
            <Controls />
            <Background />
            </ReactFlow>
        </div>

        {/* Bottom Panel: Available Intents */}
        <div style={{
            display: "flex",
            overflowX: "auto",
            padding: "10px",
            background: "#f0f0f0",
            borderTop: "1px solid #ccc"
        }}>
            {availableIntents.map((intent) => (
          <div
            key={intent}
            draggable
            onDragStart={(event) => onDragStart(event, intent)}
            style={{
              padding: "10px",
              margin: "5px",
              background: "#007bff",
              color: "#fff",
              cursor: "grab",
              borderRadius: "5px"
            }}
          >
            {intent}
        </div>
        ))}
        </div>
    /</div>
    );
}

export default LessonEditor;