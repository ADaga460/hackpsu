import React, { useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

const initialNodes = [
  { id: "AI", label: "Artificial Intelligence", level: 0, unlocked: true },
  { id: "ML", label: "Machine Learning", level: 1, unlocked: true },
  { id: "DL", label: "Deep Learning", level: 2, unlocked: false },
  { id: "NLP", label: "Natural Language Processing", level: 2, unlocked: false },
];

const initialLinks = [
  { source: "AI", target: "ML" },
  { source: "ML", target: "DL" },
  { source: "ML", target: "NLP" },
];

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [selectedNode, setSelectedNode] = useState(null);
  const [score, setScore] = useState(null);

  const handleNodeClick = (node) => {
    if (!node.unlocked) return alert("Locked. Finish previous quizzes.");
    setSelectedNode(node);
    setScore(null);
  };

  const handleQuizSubmit = () => {
    const newScore = Math.floor(Math.random() * 11); // simulate quiz result 0–10
    setScore(newScore);
    unlockNodes(selectedNode, newScore);
  };

  const unlockNodes = (parent, score) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (initialLinks.some((l) => l.source === parent.id && l.target === n.id)) {
          //const threshold = parent.level === 0 ? 10 : parent.level === 1 ? 9 : 8;
          const threshold = -1; // For testing, set threshold to -1 to always unlock
          if (score >= threshold) { n.unlocked = true; console.log(`Unlocked ${n.label}`);  }
        }
        return n;
      })
    );
  };

  return (
    <div style={{ height: "100vh", width: "1000vw" }}>
      <ForceGraph2D
        graphData={{ nodes, links: initialLinks }}
        nodeLabel="label"
        nodeAutoColorBy="level"
        onNodeClick={handleNodeClick}
      />
      {selectedNode && (
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            width: 300,
            padding: 20,
            background: "#111",
            color: "#fff",
            borderRadius: 12,
          }}
        >
          <h3>{selectedNode.label}</h3>
          <p>
            Placeholder info about {selectedNode.label}. Click "Take Quiz" to simulate
            quiz completion.
          </p>
          <button onClick={handleQuizSubmit}>Take Quiz</button>
          {score !== null && <p>Score: {score}/10</p>}
        </div>
      )}
    </div>
  );
}
