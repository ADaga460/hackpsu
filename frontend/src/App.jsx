import React, { useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

const initialNodes = [
  // Level 0
  { id: "AI", label: "Artificial Intelligence", level: 0, unlocked: true },

  // Level 1: Core Fundamentals
  { id: "ML", label: "Machine Learning", level: 1, unlocked: true },
  { id: "Stats", label: "Statistics & Probability", level: 1, unlocked: false },

  // Level 2: Main Branches
  { id: "DL", label: "Deep Learning", level: 2, unlocked: false },
  { id: "CV", label: "Computer Vision", level: 2, unlocked: false },
  { id: "NLP", label: "Natural Language Processing", level: 2, unlocked: false },
  { id: "RL", label: "Reinforcement Learning", level: 2, unlocked: false },
  { id: "DS", label: "Data Structures & Algos", level: 2, unlocked: false },

  // Level 3: Specialized Topics
  { id: "NN", label: "Neural Networks", level: 3, unlocked: false },
  { id: "CNN", label: "Convolutional Networks", level: 3, unlocked: false },
  { id: "RNN", label: "Recurrent Networks", level: 3, unlocked: false },
  { id: "GAN", label: "Generative Adversarial Nets", level: 3, unlocked: false },
  { id: "Clust", label: "Clustering & Regressions", level: 3, unlocked: false },

  // Level 4: Cutting-Edge & Context
  { id: "Transf", label: "Transformers (Attention)", level: 4, unlocked: false },
  { id: "Agent", label: "AI Agents & Planning", level: 4, unlocked: false },
  { id: "Ethics", label: "AI Ethics & Governance", level: 4, unlocked: false },
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
  AI: {
    question: "What is Artificial Intelligence?",
    options: [
      "A system that performs logical reasoning only",
      "A system that mimics human-like decision making",
      "A program that runs only on quantum computers",
      "A database for large-scale analytics"
    ],
    answer: 1
  },
  ML: {
    question: "Which of the following best describes Machine Learning?",
    options: [
      "Manually programmed rule-based systems",
      "A subset of AI that learns from data",
      "A branch of physics studying motion",
      "A graphics rendering technique"
    ],
    answer: 1
  },
  DL: {
    question: "Deep Learning mainly uses:",
    options: [
      "Linear regression models",
      "Neural networks with many layers",
      "Genetic algorithms",
      "Symbolic logic"
    ],
    answer: 1
  }
  // Add more nodes as needed
};


export default function App() {
  const [graphData, setGraphData] = useState({ nodes: initialNodes, links: initialLinks });
  const [selectedNode, setSelectedNode] = useState(null);
  const [score, setScore] = useState(null);

  const handleNodeClick = (node) => {
    if (!node.unlocked) return alert("Locked. Finish previous quizzes.");
    setSelectedNode(node);
    setScore(null);
  };

  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleQuizSubmit = () => {
    const correct = selectedAnswer === quizData[selectedNode.id]?.answer;
    const newScore = correct ? 10 : Math.floor(Math.random() * 9);
    setScore(newScore);
    unlockNodes(selectedNode, newScore);
  };
  

  const unlockNodes = (parent, score) => {
    //const threshold = parent.level === 0 ? 8 : 9;
    const threshold = 0;; // for testing
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
