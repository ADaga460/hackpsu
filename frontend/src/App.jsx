import React, { useState, useMemo, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";

// Animated Brain Component for Intro Screen
function AnimatedBrain() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 0.02);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Create brain-like node pattern
  const brainNodes = useMemo(() => {
    const nodes = [];
    const nodeCount = 40;
    
    // Create nodes in a brain-like elliptical pattern
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const layer = Math.floor(i / 8);
      const radius = 80 + layer * 30;
      
      // Make it brain-shaped (elliptical, wider than tall)
      const x = Math.cos(angle) * radius * 1.3;
      const y = Math.sin(angle) * radius * 0.8;
      
      nodes.push({
        id: i,
        baseX: x,
        baseY: y,
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 0.4
      });
    }
    return nodes;
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
      <svg width="400" height="300" viewBox="-250 -150 500 300">
        {brainNodes.map((node, idx) => {
          // Sinusoidal motion for spinning effect
          const offsetX = Math.sin(time * node.speed + node.phase) * 15;
          const offsetY = Math.cos(time * node.speed * 0.7 + node.phase) * 10;
          const x = node.baseX + offsetX;
          const y = node.baseY + offsetY;
          
          // Opacity varies with motion
          const opacity = 0.4 + Math.sin(time * node.speed + node.phase) * 0.3;
          
          return (
            <circle
              key={node.id}
              cx={x}
              cy={y}
              r={3 + Math.sin(time + node.phase) * 1}
              fill="#1A659E"
              opacity={opacity}
            />
          );
        })}
        
        {/* Optional: Add connecting lines between nearby nodes */}
        {brainNodes.map((node, idx) => {
          if (idx % 3 !== 0) return null; // Only draw some connections
          const nextNode = brainNodes[(idx + 1) % brainNodes.length];
          
          const x1 = node.baseX + Math.sin(time * node.speed + node.phase) * 15;
          const y1 = node.baseY + Math.cos(time * node.speed * 0.7 + node.phase) * 10;
          const x2 = nextNode.baseX + Math.sin(time * nextNode.speed + nextNode.phase) * 15;
          const y2 = nextNode.baseY + Math.cos(time * nextNode.speed * 0.7 + nextNode.phase) * 10;
          
          return (
            <line
              key={`line-${idx}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#1A659E"
              strokeWidth="1"
              opacity="0.15"
            />
          );
        })}
      </svg>
    </div>
  );
}

function solarSystemLayout(nodes, links) {
  const levelRadius = {
    0: 0,
    1: 250,
    2: 500,
    3: 750,
    4: 1000
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

  useEffect(() => {
    const loadGraphData = async () => {
      try {
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

  const fetchGraphDataFallback = async () => {
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

  const calculateNodeDistances = () => {
    const distances = {};

    graphData.nodes.forEach(node => {
      if (node.unlocked) {
        distances[node.id] = 0;
      } else {
        distances[node.id] = Infinity;
      }
    });

    let changed = true;
    while (changed) {
      changed = false;
      graphData.links.forEach(link => {
        const sourceId = link.source.id || link.source;
        const targetId = link.target.id || link.target;

        if (distances[sourceId] + 1 < distances[targetId]) {
          distances[targetId] = distances[sourceId] + 1;
          changed = true;
        }
        if (distances[targetId] + 1 < distances[sourceId]) {
          distances[sourceId] = distances[targetId] + 1;
          changed = true;
        }
      });
    }

    return distances;
  };

  const nodeDistances = useMemo(() => calculateNodeDistances(), [graphData]);

  if (view === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4 relative overflow-hidden">
        <AnimatedBrain />
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20 relative z-10">
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
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";

          let opacity = 1;
          if (!node.unlocked && !node.quiz_completed) {
            const distance = nodeDistances[node.id] || 0;
            opacity = Math.max(0.2, 1 - (distance * 0.25));
          }

          let fillColor;
          if (node.quiz_completed) {
            fillColor = "#22C55E";
          } else if (node.unlocked) {
            fillColor = "#1A659E";
          } else {
            fillColor = "#98A2AB";
          }

          ctx.globalAlpha = opacity;
          ctx.fillStyle = fillColor;
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
          ctx.fill();

          ctx.fillStyle = "#fff";
          ctx.fillText(label, node.x + nodeRadius + 2, node.y + 4);
          ctx.globalAlpha = 1;
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