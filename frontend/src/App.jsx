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
  { id: "DS", label: "Data Structures & Algos", level: 2, unlocked: false, quiz_completed: false },
  { id: "Clust", label: "Clustering & Regressions", level: 2, unlocked: false, quiz_completed: false },

  // Level 3: Specialized Topics
  { id: "NN", label: "Neural Networks", level: 3, unlocked: false, quiz_completed: false },
  { id: "CV", label: "Computer Vision", level: 3, unlocked: false, quiz_completed: false },
  { id: "NLP", label: "Natural Language Processing", level: 3, unlocked: false, quiz_completed: false },
  { id: "RL", label: "Reinforcement Learning", level: 3, unlocked: false, quiz_completed: false },

  // Level 4: Cutting-Edge & Context
  { id: "GAN", label: "Generative Adversarial Nets", level: 4, unlocked: false, quiz_completed: false },
  { id: "CNN", label: "Convolutional Networks", level: 4, unlocked: false, quiz_completed: false },
  { id: "RNN", label: "Recurrent Networks", level: 4, unlocked: false, quiz_completed: false },
  { id: "Transf", label: "Transformers (Attention)", level: 4, unlocked: false, quiz_completed: false },
  { id: "Agent", label: "AI Agents & Planning", level: 4, unlocked: false, quiz_completed: false },
  { id: "Ethics", label: "AI Ethics & Governance", level: 4, unlocked: false, quiz_completed: false },
];

const initialLinks = [
  // --- Level 0 to Level 1 ---
  { source: "AI", target: "ML" },
  { source: "AI", target: "Stats" },

  // --- Level 1 to Level 2 ---
  { source: "ML", target: "DL" },
  { source: "Stats", target: "DL" }, // DL requires both ML and Stats
  { source: "ML", target: "DS" },

  // --- Level 2 to Level 3 ---
  { source: "DL", target: "NN" },
  { source: "DL", target: "CV" },
  { source: "DL", target: "NLP" },
  { source: "DL", target: "RL" },
  { source: "ML", target: "Clust" }, // Clustering is fundamental ML, not from DL

  // --- Level 3 to Level 4 ---
  { source: "NN", target: "GAN" },
  { source: "CV", target: "CNN" },
  { source: "NLP", target: "RNN" },
  { source: "RNN", target: "Transf" },
  { source: "RL", target: "Agent" },

  // --- Ethics connections ---
  { source: "Agent", target: "Ethics" },
  { source: "Transf", target: "Ethics" },
  { source: "GAN", target: "Ethics" },
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

function solarSystemLayout(nodes, links) {
  // Calculate node radius for collision detection
  const getNodeRadius = (level) => 50 - (level * 6);
  
  const levelRadius = {
    0: 0,      // Center (sun)
    1: 250,    // First orbit
    2: 500,    // Second orbit
    3: 750,    // Third orbit
    4: 1000    // Fourth orbit
  };

  // Build adjacency list for topological sorting
  const adjacency = {};
  const inDegree = {};
  nodes.forEach(node => {
    adjacency[node.id] = [];
    inDegree[node.id] = 0;
  });
  
  links.forEach(link => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    adjacency[sourceId].push(targetId);
    inDegree[targetId]++;
  });

  // Topological sort within each level to determine ordering
  const levelNodes = {};
  nodes.forEach(node => {
    if (!levelNodes[node.level]) {
      levelNodes[node.level] = [];
    }
    levelNodes[node.level].push(node);
  });

  // Sort nodes within each level by their dependencies
  Object.keys(levelNodes).forEach(level => {
    levelNodes[level].sort((a, b) => {
      // Sort by number of incoming connections, then by id for consistency
      const aDeps = inDegree[a.id];
      const bDeps = inDegree[b.id];
      if (aDeps !== bDeps) return aDeps - bDeps;
      return a.id.localeCompare(b.id);
    });
  });

  // Position nodes
  return nodes.map(node => {
    if (node.level === 0) {
      return {
        ...node,
        fx: 0,
        fy: 0
      };
    }

    const nodesAtLevel = levelNodes[node.level];
    const nodeIndex = nodesAtLevel.indexOf(node);
    const totalNodesAtLevel = nodesAtLevel.length;
    const radius = levelRadius[node.level];

    // Evenly distribute nodes around the circle
    const angle = (nodeIndex / totalNodesAtLevel) * 2 * Math.PI - Math.PI / 2; // Start at top

    return {
      ...node,
      fx: radius * Math.cos(angle),
      fy: radius * Math.sin(angle)
    };
  });
}

export default function App() {
  const [view, setView] = useState("intro");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  
  const laidOutNodes = useMemo(() => solarSystemLayout(initialNodes, initialLinks), []);
  const [graphData, setGraphData] = useState({ nodes: laidOutNodes, links: initialLinks });
  const [nodeInfo, setNodeInfo] = useState({}); // Store node content and quizzes
  const [selectedNode, setSelectedNode] = useState(null);
  const [score, setScore] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Function to generate graph from topic
  const handleStartLearning = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    
    try {
      // TODO: Replace with  actual Vercel backend URL
      // const response = await fetch('url/api/data', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ topic: topic })
      // });
      // 
      // const data = await response.json();
      // 
      // Expected response format:
      // {
      //   nodes: [
      //     { id: "node1", label: "Topic Name", level: 0, unlocked: true, quiz_completed: false },
      //     ...
      //   ],
      //   links: [
      //     { source: "node1", target: "node2" },
      //     ...
      //   ]
      // }
      //
      // const laidOut = solarSystemLayout(data.nodes, data.links);
      // setGraphData({ nodes: laidOut, links: data.links });
      
      // For now, use hardcoded data
      const laidOut = solarSystemLayout(initialNodes, initialLinks);
      setGraphData({ nodes: laidOut, links: initialLinks });
      setView("graph");
      
    } catch (error) {
      console.error('Error generating graph:', error);
      alert('Failed to generate graph. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (node) => {
    if (!node.unlocked) return alert("Locked. Finish previous quizzes.");
    setSelectedNode(node);
    setScore(null);
    setSelectedAnswer(null);
  };

  const handleQuizSubmit = () => {
    const newScore = Math.floor(Math.random() * 11);
    setScore(newScore);
    unlockNodes(selectedNode, newScore);
  };

  const unlockNodes = (parent, score) => {
    const threshold = 0; // for testing
    
    // Build a map of which nodes have which parents
    const nodeParents = {};
    graphData.nodes.forEach(n => {
      nodeParents[n.id] = [];
    });
    
    graphData.links.forEach(l => {
      const sourceId = l.source.id || l.source;
      const targetId = l.target.id || l.target;
      if (!nodeParents[targetId].includes(sourceId)) {
        nodeParents[targetId].push(sourceId);
      }
    });
    
    // First pass: mark current node as completed
    const nodesWithCompletion = graphData.nodes.map(n => ({
      ...n,
      quiz_completed: n.id === parent.id ? true : n.quiz_completed
    }));
    
    // collect child ids of the current parent
    const childIds = graphData.links
      .filter(l => (l.source.id || l.source) === parent.id)
      .map(l => l.target.id || l.target);

    // Second pass: check which children can be unlocked
    const updatedNodes = nodesWithCompletion.map(n => {
      const isChild = childIds.includes(n.id);
      
      // Check if ALL parents of this child node are completed
      let shouldUnlock = false;
      if (isChild && !n.unlocked && score >= threshold) {
        const parents = nodeParents[n.id];
        console.log(`Checking ${n.id}, parents:`, parents);
        
        const allParentsCompleted = parents.every(parentId => {
          const parentNode = nodesWithCompletion.find(node => node.id === parentId);
          console.log(`  Parent ${parentId} completed:`, parentNode?.quiz_completed);
          return parentNode && parentNode.quiz_completed;
        });
        
        console.log(`${n.id} all parents completed:`, allParentsCompleted);
        shouldUnlock = allParentsCompleted;
      }
      
      return {
        id: n.id,
        label: n.label,
        level: n.level,
        unlocked: shouldUnlock ? true : n.unlocked,
        quiz_completed: n.quiz_completed,
        fx: n.fx,
        fy: n.fy
      };
    });

    // rebuild links
    const cleanedLinks = graphData.links.map(l => ({
      source: l.source.id || l.source,
      target: l.target.id || l.target,
    }));

    setGraphData({
      nodes: updatedNodes,
      links: cleanedLinks,
    });
  };

  if (view === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-2 text-center">
            StudySphere
          </h1>
          <p className="text-white/80 mb-6 text-center">
            Enter any topic to generate an interactive learning path!
          </p>
          <div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && topic.trim() && handleStartLearning()}
              placeholder="e.g., Machine Learning, Quantum Physics..."
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 mb-4"
            />
            <button
              onClick={handleStartLearning}
              disabled={!topic.trim()}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Generate Learning Path
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      <div style={{
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 10,
        background: "rgba(17, 17, 17, 0.9)",
        padding: "12px",
        borderRadius: "8px",
        display: "flex",
        gap: "8px"
      }}>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && topic.trim() && handleStartLearning()}
          placeholder="Enter new topic..."
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #444",
            background: "#222",
            color: "#fff",
            outline: "none",
            width: "200px"
          }}
        />
        <button
          onClick={handleStartLearning}
          disabled={!topic.trim()}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            background: topic.trim() ? "linear-gradient(to right, #06b6d4, #3b82f6)" : "#444",
            color: "#fff",
            cursor: topic.trim() ? "pointer" : "not-allowed",
            fontWeight: "600"
          }}
        >
          Generate
        </button>
      </div>
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="label"
        nodeAutoColorBy={n => (n.unlocked ? "unlocked" : "locked")}
        cooldownTicks={1}
        d3VelocityDecay={4.75}
        linkWidth={3}
        linkColor={() => "#4A5568"}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        nodeRelSize={10}
        nodeVal={node => {
          const nodeRadius = 50 - (node.level * 6);
          return nodeRadius;
        }}
        nodeCanvasObjectMode={() => 'replace'}
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
                      checked={selectedAnswer === idx}
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