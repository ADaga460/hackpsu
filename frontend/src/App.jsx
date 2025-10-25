import React, { useState, useMemo, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";

// Import the JSON data - place graphData.json in the same directory as this file
// For local development, you can use: import graphDataJson from './graphData.json';
// Or fetch it from a URL

function solarSystemLayout(nodes, links) {
  const levelRadius = {
    0: 0,      // Center (sun)
    1: 250,    // First orbit
    2: 500,    // Second orbit
    3: 750,    // Third orbit
    4: 1000    // Fourth orbit
  };

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

  const levelNodes = {};
  nodes.forEach(node => {
    if (!levelNodes[node.level]) {
      levelNodes[node.level] = [];
    }
    levelNodes[node.level].push(node);
  });

  Object.keys(levelNodes).forEach(level => {
    levelNodes[level].sort((a, b) => {
      const aDeps = inDegree[a.id];
      const bDeps = inDegree[b.id];
      if (aDeps !== bDeps) return aDeps - bDeps;
      return a.id.localeCompare(b.id);
    });
  });

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
    const angle = (nodeIndex / totalNodesAtLevel) * 2 * Math.PI - Math.PI / 2;

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
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [nodeContent, setNodeContent] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [score, setScore] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Load the JSON data on component mount
  useEffect(() => {
    const loadGraphData = async () => {
      try {
        // Option 1: Fetch from a URL (e.g., if hosted on your server)
        // const response = await fetch('/graphData.json');
        // const data = await response.json();
        
        // Option 2: For now, we'll use the hardcoded fallback
        // Replace this with actual fetch when you have the JSON file accessible
        const data = await fetchGraphDataFallback();
        
        const laidOut = solarSystemLayout(data.nodes, data.links);
        setGraphData({ nodes: laidOut, links: data.links });
        setNodeContent(data.nodeContent);
      } catch (error) {
        console.error('Error loading graph data:', error);
        alert('Failed to load graph data. Please refresh the page.');
      }
    };

    loadGraphData();
  }, []);

  // Fallback function - replace with actual fetch
  const fetchGraphDataFallback = async () => {
    // This simulates loading from JSON
    // In production, replace this with: const response = await fetch('/graphData.json');
    console.log("Using fallback graph data");
    return {
      nodes: [
        { id: "AI", label: "Artificial Intelligence", level: 0, unlocked: true, quiz_completed: false },
        { id: "ML", label: "Machine Learning", level: 1, unlocked: true, quiz_completed: false },
        { id: "Stats", label: "Statistics & Probability", level: 1, unlocked: false, quiz_completed: false },
        { id: "DL", label: "Deep Learning", level: 2, unlocked: false, quiz_completed: false },
        { id: "DS", label: "Data Structures & Algos", level: 2, unlocked: false, quiz_completed: false },
        { id: "Clust", label: "Clustering & Regressions", level: 2, unlocked: false, quiz_completed: false },
        { id: "NN", label: "Neural Networks", level: 3, unlocked: false, quiz_completed: false },
        { id: "CV", label: "Computer Vision", level: 3, unlocked: false, quiz_completed: false },
        { id: "NLP", label: "Natural Language Processing", level: 3, unlocked: false, quiz_completed: false },
        { id: "RL", label: "Reinforcement Learning", level: 3, unlocked: false, quiz_completed: false },
        { id: "GAN", label: "Generative Adversarial Nets", level: 4, unlocked: false, quiz_completed: false },
        { id: "CNN", label: "Convolutional Networks", level: 4, unlocked: false, quiz_completed: false },
        { id: "RNN", label: "Recurrent Networks", level: 4, unlocked: false, quiz_completed: false },
        { id: "Transf", label: "Transformers (Attention)", level: 4, unlocked: false, quiz_completed: false },
        { id: "Agent", label: "AI Agents & Planning", level: 4, unlocked: false, quiz_completed: false },
        { id: "Ethics", label: "AI Ethics & Governance", level: 4, unlocked: false, quiz_completed: false },
      ],
      links: [
        { source: "AI", target: "ML" },
        { source: "AI", target: "Stats" },
        { source: "ML", target: "DL" },
        { source: "Stats", target: "DL" },
        { source: "ML", target: "DS" },
        { source: "DL", target: "NN" },
        { source: "DL", target: "CV" },
        { source: "DL", target: "NLP" },
        { source: "DL", target: "RL" },
        { source: "ML", target: "Clust" },
        { source: "NN", target: "GAN" },
        { source: "CV", target: "CNN" },
        { source: "NLP", target: "RNN" },
        { source: "RNN", target: "Transf" },
        { source: "RL", target: "Agent" },
        { source: "Agent", target: "Ethics" },
        { source: "Transf", target: "Ethics" },
        { source: "GAN", target: "Ethics" }
      ],
      nodeContent: {
        AI: {
          content: "Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think and learn. AI encompasses various approaches including rule-based systems, machine learning, and neural networks.",
          quiz: {
            question: "What is Artificial Intelligence?",
            options: [
              "A system that performs logical reasoning only",
              "A system that mimics human-like decision making",
              "A program that runs only on quantum computers",
              "A database for large-scale analytics"
            ],
            answer: 1
          }
        },
        ML: {
          content: "Machine Learning is a subset of AI that focuses on the development of algorithms and statistical models that enable computers to improve their performance on tasks through experience. Instead of being explicitly programmed, ML systems learn patterns from data.",
          quiz: {
            question: "Which of the following best describes Machine Learning?",
            options: [
              "Manually programmed rule-based systems",
              "A subset of AI that learns from data",
              "A branch of physics studying motion",
              "A graphics rendering technique"
            ],
            answer: 1
          }
        },
        DL: {
          content: "Deep Learning is a specialized subset of machine learning that uses neural networks with multiple layers (deep neural networks) to learn hierarchical representations of data. Deep learning has revolutionized fields like computer vision and natural language processing.",
          quiz: {
            question: "Deep Learning mainly uses:",
            options: [
              "Linear regression models",
              "Neural networks with many layers",
              "Genetic algorithms",
              "Symbolic logic"
            ],
            answer: 1
          }
        }
      }
    };
  };

  const handleStartLearning = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    
    try {
      // TODO: When connecting to backend, replace with:
      // const response = await fetch('https://your-app.vercel.app/api/generate-graph', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ topic: topic })
      // });
      // const data = await response.json();
      // const laidOut = solarSystemLayout(data.nodes, data.links);
      // setGraphData({ nodes: laidOut, links: data.links });
      // setNodeContent(data.nodeContent);
      
      setView("graph");
      
    } catch (error) {
      console.error('Error generating graph:', error);
      alert('Failed to generate graph. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (node) => {
    if (!node.unlocked) return alert("🔒 Locked. Finish previous quizzes.");
    setSelectedNode(node);
    setScore(null);
    setSelectedAnswer(null);
  };

  const handleQuizSubmit = () => {
    if (selectedAnswer === null) {
      alert("Please select an answer!");
      return;
    }
    
    const currentQuiz = nodeContent[selectedNode.id]?.quiz;
    const isCorrect = currentQuiz && selectedAnswer === currentQuiz.answer;
    
    setScore(isCorrect ? 10 : 0);
    
    if (isCorrect) {
      unlockNodes(selectedNode, 10);
    }
  };

  const unlockNodes = (parent, score) => {
    const threshold = 0;
    
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
    
    const nodesWithCompletion = graphData.nodes.map(n => ({
      ...n,
      quiz_completed: n.id === parent.id ? true : n.quiz_completed
    }));
    
    const childIds = graphData.links
      .filter(l => (l.source.id || l.source) === parent.id)
      .map(l => l.target.id || l.target);

    const updatedNodes = nodesWithCompletion.map(n => {
      const isChild = childIds.includes(n.id);
      
      let shouldUnlock = false;
      if (isChild && !n.unlocked && score >= threshold) {
        const parents = nodeParents[n.id];
        
        const allParentsCompleted = parents.every(parentId => {
          const parentNode = nodesWithCompletion.find(node => node.id === parentId);
          return parentNode && parentNode.quiz_completed;
        });
        
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
            Knowledge Graph Explorer
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
              disabled={!topic.trim() || loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Generating..." : "Generate Learning Path"}
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
          disabled={!topic.trim() || loading}
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
          {loading ? "..." : "Generate"}
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
          const nodeRadius = 20 - (node.level * 3);
          ctx.font = `${fontSize}px Sans-Serif`;
          
          let fillColor;
          if (node.quiz_completed) {
            fillColor = "#22C55E";
          } else if (node.unlocked) {
            fillColor = "#1A659E";
          } else {
            fillColor = "#98A2AB";
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
            maxHeight: "80vh",
            overflowY: "auto"
          }}
        >
          <h3>{selectedNode.label}</h3>
          <p style={{ marginTop: "10px", lineHeight: "1.6" }}>
            {nodeContent[selectedNode.id]?.content || "Loading content..."}
          </p>
          {nodeContent[selectedNode.id]?.quiz && (
            <>
              <p style={{ marginTop: "15px" }}><strong>Quiz:</strong> {nodeContent[selectedNode.id].quiz.question}</p>
              {nodeContent[selectedNode.id].quiz.options.map((opt, idx) => (
                <div key={idx} style={{ marginTop: "8px" }}>
                  <label>
                    <input
                      type="radio"
                      name="quiz"
                      value={idx}
                      checked={selectedAnswer === idx}
                      onChange={() => setSelectedAnswer(idx)}
                      disabled={score !== null}
                    /> {opt}
                  </label>
                </div>
              ))}
            </>
          )}
          
          {score === null ? (
            <button onClick={handleQuizSubmit} style={{ marginTop: "15px", padding: "10px 20px", background: "#3b82f6", border: "none", borderRadius: "6px", color: "#fff", cursor: "pointer", fontWeight: "600" }}>Submit Quiz</button>
          ) : score === 10 ? (
            <div style={{ marginTop: "15px", padding: "10px", background: "rgba(34, 197, 94, 0.2)", borderRadius: "6px" }}>
              <p style={{ color: "#22C55E", fontWeight: "bold", margin: 0 }}>
                ✓ Correct! Move on to {
                  graphData.links
                    .filter(l => (l.source.id || l.source) === selectedNode.id)
                    .map(l => {
                      const targetId = l.target.id || l.target;
                      const targetNode = graphData.nodes.find(n => n.id === targetId);
                      return targetNode?.label;
                    })
                    .filter(Boolean)
                    .join(", ") || "the next topics"
                }
              </p>
            </div>
          ) : (
            <div style={{ marginTop: "15px" }}>
              <p style={{ color: "#EF4444", fontWeight: "bold", marginBottom: "10px" }}>
                ✗ Incorrect! Try again.
              </p>
              <button 
                onClick={() => {
                  setScore(null);
                  setSelectedAnswer(null);
                }}
                style={{ padding: "10px 20px", background: "#ef4444", border: "none", borderRadius: "6px", color: "#fff", cursor: "pointer", fontWeight: "600" }}
              >
                Retry Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}