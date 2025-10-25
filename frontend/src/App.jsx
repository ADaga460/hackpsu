import React, { useState, useMemo } from "react";
import ForceGraph2D from "react-force-graph-2d";

const initialNodes = [
  // Level 0
  { id: "AI", label: "Artificial Intelligence", level: 0, unlocked: true, quiz_completed: false },

  // Level 1: Core Fundamentals
  { id: "ML", label: "Machine Learning", level: 1, unlocked: true, quiz_completed: false },
  { id: "Stats", label: "Statistics & Probability", level: 1, unlocked: false, quiz_completed: false },

  // Level 2: Main Branches
  { id: "DL", label: "Deep Learning", level: 2, unlocked: false, quiz_completed: false },
  { id: "CV", label: "Computer Vision", level: 2, unlocked: false, quiz_completed: false },
  { id: "NLP", label: "Natural Language Processing", level: 2, unlocked: false, quiz_completed: false },
  { id: "RL", label: "Reinforcement Learning", level: 2, unlocked: false, quiz_completed: false },
  { id: "DS", label: "Data Structures & Algos", level: 2, unlocked: false, quiz_completed: false },

  // Level 3: Specialized Topics
  { id: "NN", label: "Neural Networks", level: 3, unlocked: false, quiz_completed: false },
  { id: "CNN", label: "Convolutional Networks", level: 3, unlocked: false, quiz_completed: false },
  { id: "RNN", label: "Recurrent Networks", level: 3, unlocked: false, quiz_completed: false },
  { id: "GAN", label: "Generative Adversarial Nets", level: 3, unlocked: false, quiz_completed: false },
  { id: "Clust", label: "Clustering & Regressions", level: 3, unlocked: false, quiz_completed: false },

  // Level 4: Cutting-Edge & Context
  { id: "Transf", label: "Transformers (Attention)", level: 4, unlocked: false, quiz_completed: false },
  { id: "Agent", label: "AI Agents & Planning", level: 4, unlocked: false, quiz_completed: false },
  { id: "Ethics", label: "AI Ethics & Governance", level: 4, unlocked: false, quiz_completed: false },
];

const initialLinks = [
  // --- Core Path ---
  { source: "AI", target: "ML" },
  { source: "AI", target: "Stats" },
  { source: "AI", target: "DS" },

  // --- Core ML to Deep Learning (Dual Requirement) ---
  { source: "ML", target: "DL" },
  { source: "Stats", target: "DL" }, // DL requires Stat foundation

  // --- ML Fundamentals ---
  { source: "ML", target: "Clust" },

  // --- Deep Learning Core & Advanced ---
  { source: "DL", target: "NN" },
  { source: "NN", target: "GAN" },

  // --- Applications ---
  { source: "DL", target: "CV" },
  { source: "DL", target: "NLP" },
  { source: "DL", target: "RL" }, // RL needs DL foundation

  // --- Computer Vision Track ---
  { source: "CV", target: "CNN" },

  // --- NLP Track ---
  { source: "NLP", target: "RNN" },
  { source: "RNN", target: "Transf" }, // SOTA NLP

  // --- Reinforcement Learning Track ---
  { source: "RL", target: "Agent" },

  // --- Contextual Nodes ---
  { source: "Agent", target: "Ethics" },
  { source: "Transf", target: "Ethics" },
];

const quizData = {
  "AI": {
    question: "What is Artificial Intelligence?",
    options: [
      "A system that performs logical reasoning only",
      "A system that mimics human-like decision making",
      "A program that runs only on quantum computers",
      "A database for large-scale analytics"
    ],
    answer: 1
  },
  "ML": {
    question: "Which of the following best describes Machine Learning?",
    options: [
      "Manually programmed rule-based systems",
      "A subset of AI that learns from data",
      "A branch of physics studying motion",
      "A graphics rendering technique"
    ],
    answer: 1
  },
  "DL": {
    question: "Deep Learning mainly uses:",
    options: [
      "Linear regression models",
      "Neural networks with many layers",
      "Genetic algorithms",
      "Symbolic logic"
    ],
    answer: 1
  }
};

function solarSystemLayout(nodes) {
  // Calculate node radius for collision detection
  const getNodeRadius = (level) => 50 - (level * 6);
  
  const levelRadius = {
    0: 0,      // Center (sun)
    1: 250,    // First orbit (increased)
    2: 500,    // Second orbit (increased)
    3: 750,    // Third orbit (increased)
    4: 1000    // Fourth orbit (increased)
  };

  // Group nodes by level
  const nodesByLevel = {};
  nodes.forEach(node => {
    if (!nodesByLevel[node.level]) {
      nodesByLevel[node.level] = [];
    }
    nodesByLevel[node.level].push(node);
  });

  // Position nodes
  return nodes.map(node => {
    if (node.level === 0) {
      // Center node
      return {
        ...node,
        fx: 0,
        fy: 0
      };
    }

    // Get all nodes at this level
    const levelNodes = nodesByLevel[node.level];
    const nodeIndex = levelNodes.indexOf(node);
    const totalNodesAtLevel = levelNodes.length;
    const radius = levelRadius[node.level];
    const nodeRadius = getNodeRadius(node.level);

    // Calculate minimum angular spacing to prevent overlap
    // Arc length = radius * angle, need at least 2 * nodeRadius + padding
    const minArcLength = (nodeRadius * 2) + 40; // 40px padding between nodes
    const minAngle = minArcLength / radius;
    
    // Use the larger of: evenly distributed or minimum spacing needed
    const evenAngle = (2 * Math.PI) / totalNodesAtLevel;
    const angleSpacing = Math.max(evenAngle, minAngle);
    
    // If we need more space than available, increase the spacing
    const totalNeededAngle = angleSpacing * totalNodesAtLevel;
    const scale = totalNeededAngle > (2 * Math.PI) ? totalNeededAngle / (2 * Math.PI) : 1;
    
    // Calculate angle with proper spacing
    const min = -30;
    const max = 30;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    const angle = (nodeIndex * angleSpacing) + randomNumber / scale;

    return {
      ...node,
      fx: radius * Math.cos(angle),
      fy: radius * Math.sin(angle)
    };
  });
}

export default function App() {
  const laidOutNodes = useMemo(() => solarSystemLayout(initialNodes), []);
  const [graphData, setGraphData] = useState({ nodes: laidOutNodes, links: initialLinks });
  const [selectedNode, setSelectedNode] = useState(null);
  const [score, setScore] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

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
    const threshold = 0; // for testing
    
    // collect child ids
    const childIds = graphData.links
      .filter(l => (l.source.id || l.source) === parent.id)
      .map(l => l.target.id || l.target);

    // clone each node into a new object (drop force-graph's internal props)
    const updatedNodes = graphData.nodes.map(n => {
      const isChild = childIds.includes(n.id);
      const shouldUnlock = isChild && !n.unlocked && score >= threshold;
      const isCurrentNode = n.id === parent.id;
      
      return {
        id: n.id,
        label: n.label,
        level: n.level,
        unlocked: shouldUnlock ? true : n.unlocked,
        quiz_completed: isCurrentNode ? true : n.quiz_completed,
        fx: n.fx, // preserve fixed positions
        fy: n.fy
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
        cooldownTicks={1}
        d3VelocityDecay={4.75}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.label;
          const fontSize = 12 / globalScale;
          // Larger nodes for lower levels (level 0 is largest)
          const nodeRadius = 20 - (node.level * 3);
          ctx.font = `${fontSize}px Sans-Serif`;
          
          // Determine color based on quiz completion and unlock status
          let fillColor;
          if (node.quiz_completed) {
            fillColor = "#22C55E"; // Green for completed
          } else if (node.unlocked) {
            fillColor = "#1A659E"; // Blue for unlocked
          } else {
            fillColor = "#98A2AB"; // Gray for locked
          }
          
          ctx.fillStyle = fillColor;
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
          ctx.fill();
          ctx.fillText(label, node.x + nodeRadius + 2, node.y + 4);
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
          {quizData[selectedNode.id] && (
            <>
              <p><strong>Quiz:</strong> {quizData[selectedNode.id].question}</p>
              {quizData[selectedNode.id].options.map((opt, idx) => (
                <div key={idx}>
                  <label>
                    <input
                      type="radio"
                      name="quiz"
                      value={idx}
                      onChange={() => setSelectedAnswer(idx)}
                    /> {opt}
                  </label>
                </div>
              ))}
            </>
          )}
          <button onClick={handleQuizSubmit}>Submit Quiz</button>
          {score !== null && <p>Score: {score}/10</p>}
        </div>
      )}
    </div>
  );
}