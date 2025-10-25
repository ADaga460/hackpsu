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
  const [graphData, setGraphData] = useState({ nodes: initialNodes, links: initialLinks });
  const [selectedNode, setSelectedNode] = useState(null);
  const [score, setScore] = useState(null);

  const handleNodeClick = (node) => {
    if (!node.unlocked) return alert("Locked. Finish previous quizzes.");
    setSelectedNode(node);
    setScore(null);
  };

  const handleQuizSubmit = () => {
    const newScore = Math.floor(Math.random() * 11);
    setScore(newScore);
    unlockNodes(selectedNode, newScore);
  };

  const unlockNodes = (parent, score) => {
    //const threshold = parent.level === 0 ? 8 : 9;
    const threshold  = 0;; // for testing
    // collect child ids
    const childIds = graphData.links
      .filter(l => (l.source.id || l.source) === parent.id)
      .map(l => l.target.id || l.target);
  
    // clone each node into a new object (drop force-graph's internal props)
    const updatedNodes = graphData.nodes.map(n => {
      const isChild = childIds.includes(n.id);
      const shouldUnlock = isChild && !n.unlocked && score >= threshold;
      return {
        id: n.id,
        label: n.label,
        level: n.level,
        unlocked: shouldUnlock ? true : n.unlocked, // update flag
      };
    });
  
    // rebuild links to plain {source, target} so force-graph refreshes positions safely
    const cleanedLinks = graphData.links.map(l => ({
      source: l.source.id || l.source,
      target: l.target.id || l.target,
    }));
  
    // new object breaks reference chain -> triggers re-render
    setGraphData({
      nodes: updatedNodes,
      links: cleanedLinks,
    });
  };
  

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="label"
        nodeAutoColorBy={n => (n.unlocked ? "unlocked" : "locked")}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.label;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = node.unlocked ? "#1A659E" : "#98A2AB";
          ctx.beginPath();
          ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
          ctx.fill();
          ctx.fillText(label, node.x + 8, node.y + 4);
        }}
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
            Placeholder info about {selectedNode.label}. Click "Take Quiz" to simulate quiz completion.
          </p>
          <button onClick={handleQuizSubmit}>Take Quiz</button>
          {score !== null && <p>Score: {score}/10</p>}
        </div>
      )}
    </div>
  );
}
