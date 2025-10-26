import React, { useState, useMemo, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";

// Error Toast Component
function ErrorToast({ message, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed",
      top: isVisible ? "20px" : "-100px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 1000,
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
      color: "#fff",
      padding: "16px 24px",
      borderRadius: "12px",
      boxShadow: "0 10px 40px rgba(239, 68, 68, 0.4)",
      fontSize: "15px",
      fontWeight: "500",
      transition: "top 0.3s ease-out",
      maxWidth: "90vw",
      textAlign: "center"
    }}>
      ⚠️ {message}
    </div>
  );
}

// Animated Globe Component for Intro Screen
function AnimatedGlobe() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(r => r + 0.5);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const globeData = useMemo(() => {
    const nodes = [];
    const connections = [];
    const radius = 150;
    const latitudes = 8;
    const longitudes = 12;
    let nodeId = 0;
    
    for (let lat = 0; lat <= latitudes; lat++) {
      const theta = (lat / latitudes) * Math.PI;
      const y = -radius * Math.cos(theta);
      const ringRadius = radius * Math.sin(theta);
      
      for (let lon = 0; lon < longitudes; lon++) {
        const phi = (lon / longitudes) * 2 * Math.PI;
        const x = ringRadius * Math.cos(phi);
        const z = ringRadius * Math.sin(phi);
        nodes.push({ id: nodeId++, x, y, z, lat, lon });
      }
    }

    nodes.forEach((node, i) => {
      const nextLon = nodes.find(n => n.lat === node.lat && n.lon === (node.lon + 1) % longitudes);
      if (nextLon) connections.push({ from: i, to: nextLon.id });
      
      if (node.lat < latitudes) {
        const nextLat = nodes.find(n => n.lat === node.lat + 1 && n.lon === node.lon);
        if (nextLat) connections.push({ from: i, to: nextLat.id });
      }
    });

    return { nodes, connections };
  }, []);

  const rotatedNodes = globeData.nodes.map(node => {
    const rad = (rotation * Math.PI) / 180;
    const cosR = Math.cos(rad);
    const sinR = Math.sin(rad);
    const rotatedX = node.x * cosR + node.z * sinR;
    const rotatedZ = -node.x * sinR + node.z * cosR;
    const perspective = 1200;
    const scale = perspective / (perspective + rotatedZ);
    return { ...node, screenX: rotatedX * scale, screenY: node.y * scale, scale, z: rotatedZ };
  });

  const sortedNodes = [...rotatedNodes].sort((a, b) => a.z - b.z);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg width="100%" height="120%" viewBox="-500 -400 1000 900" className="opacity-30">
        {globeData.connections.map((conn, idx) => {
          const from = rotatedNodes[conn.from];
          const to = rotatedNodes[conn.to];
          if (from.z > -150 && to.z > -150) {
            const avgZ = (from.z + to.z) / 2;
            const depthFactor = (avgZ + 150) / 300;
            const opacity = 0.25 + depthFactor * 0.45;
            const strokeWidth = 1.5 + depthFactor * 1.5;
            return (
              <line
                key={`conn-${idx}`}
                x1={from.screenX}
                y1={from.screenY}
                x2={to.screenX}
                y2={to.screenY}
                stroke="#1A659E"
                strokeWidth={strokeWidth}
                opacity={opacity}
                strokeLinecap="round"
              />
            );
          }
          return null;
        })}
        {sortedNodes.map(node => {
          if (node.z < -100) return null;
          const depthFactor = (node.z + 150) / 300;
          const depthOpacity = 0.4 + depthFactor * 0.6;
          const size = 3 + node.scale * 2.5;
          const brightness = 0.7 + depthFactor * 0.3;
          return (
            <g key={node.id}>
              <circle cx={node.screenX} cy={node.screenY} r={size + 1.2} fill="#1A659E" opacity={depthOpacity * 0.25} />
              <circle cx={node.screenX} cy={node.screenY} r={size} fill="#1A659E" opacity={depthOpacity}
                style={{ filter: `brightness(${brightness})` }} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function solarSystemLayout(nodes, links) {
  const levelRadius = { 0: 0, 1: 250, 2: 500, 3: 750, 4: 1000 };
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
    if (!levelNodes[node.level]) levelNodes[node.level] = [];
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
    if (node.level === 0) return { ...node, fx: 0, fy: 0 };
    const nodesAtLevel = levelNodes[node.level];
    const nodeIndex = nodesAtLevel.indexOf(node);
    const totalNodesAtLevel = nodesAtLevel.length;
    const radius = levelRadius[node.level];
    const angle = (nodeIndex / totalNodesAtLevel) * 2 * Math.PI - Math.PI / 2;
    return { ...node, fx: radius * Math.cos(angle), fy: radius * Math.sin(angle) };
  });
}

export default function App() {
  const [view, setView] = useState("intro");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedGraphs, setSavedGraphs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [nodeContent, setNodeContent] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [score, setScore] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isStorageAvailable = () => typeof window !== 'undefined' && window.storage;

  useEffect(() => {
    if (isStorageAvailable()) loadSavedGraphs();
  }, []);

  const loadSavedGraphs = async () => {
    if (!isStorageAvailable()) return;
    try {
      const result = await window.storage.list('graph:');
      if (result && result.keys) {
        const graphs = [];
        for (const key of result.keys) {
          try {
            const data = await window.storage.get(key);
            if (data && data.value) graphs.push(JSON.parse(data.value));
          } catch (err) {
            console.error(`Error loading graph ${key}:`, err);
          }
        }
        setSavedGraphs(graphs.sort((a, b) => b.timestamp - a.timestamp));
      }
    } catch (error) {
      setSavedGraphs([]);
    }
  };

  const saveCurrentGraph = async (topicName) => {
    const graphId = `graph:${Date.now()}`;
    const graphState = {
      id: graphId,
      topic: topicName,
      timestamp: Date.now(),
      nodes: graphData.nodes,
      links: graphData.links,
      nodeContent: nodeContent
    };

    if (!isStorageAvailable()) {
      setActiveTabId(graphId);
      setSavedGraphs(prev => [graphState, ...prev]);
      return;
    }

    try {
      await window.storage.set(graphId, JSON.stringify(graphState));
      await loadSavedGraphs();
      setActiveTabId(graphId);
    } catch (error) {
      console.error('Error saving graph:', error);
      setActiveTabId(graphId);
      setSavedGraphs(prev => [graphState, ...prev]);
    }
  };

  const loadGraph = async (graphId) => {
    if (!isStorageAvailable()) {
      const graph = savedGraphs.find(g => g.id === graphId);
      if (graph) {
        setGraphData({ nodes: graph.nodes, links: graph.links });
        setNodeContent(graph.nodeContent);
        setTopic(graph.topic);
        setActiveTabId(graphId);
        setView("graph");
      }
      return;
    }

    try {
      const result = await window.storage.get(graphId);
      if (result && result.value) {
        const graphState = JSON.parse(result.value);
        setGraphData({ nodes: graphState.nodes, links: graphState.links });
        setNodeContent(graphState.nodeContent);
        setTopic(graphState.topic);
        setActiveTabId(graphId);
        setView("graph");
      }
    } catch (error) {
      console.error('Error loading graph:', error);
      const graph = savedGraphs.find(g => g.id === graphId);
      if (graph) {
        setGraphData({ nodes: graph.nodes, links: graph.links });
        setNodeContent(graph.nodeContent);
        setTopic(graph.topic);
        setActiveTabId(graphId);
        setView("graph");
      }
    }
  };

  const deleteGraph = async (graphId) => {
    if (!isStorageAvailable()) {
      setSavedGraphs(prev => prev.filter(g => g.id !== graphId));
      if (activeTabId === graphId) {
        setActiveTabId(null);
        setView("intro");
      }
      return;
    }

    try {
      await window.storage.delete(graphId);
      await loadSavedGraphs();
      if (activeTabId === graphId) {
        setActiveTabId(null);
        setView("intro");
      }
    } catch (error) {
      console.error('Error deleting graph:', error);
      setSavedGraphs(prev => prev.filter(g => g.id !== graphId));
      if (activeTabId === graphId) {
        setActiveTabId(null);
        setView("intro");
      }
    }
  };

  const fetchGraphDataFromAPI = async (topicName) => {
    try {
      const response = await fetch('https://sphere-backend-gsoo.onrender.com/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: topicName })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      
      // The API should return data with nodes, links, and nodeContent
      // Transform the quiz format from array to single quiz object for compatibility
      const transformedNodeContent = {};
      if (result.nodeContent) {
        Object.keys(result.nodeContent).forEach(nodeId => {
          const nodeData = result.nodeContent[nodeId];
          transformedNodeContent[nodeId] = {
            content: nodeData.content,
            quiz: nodeData.quiz && nodeData.quiz.length > 0 ? nodeData.quiz[0] : null
          };
        });
      }

      return {
        nodes: result.nodes || [],
        links: result.links || [],
        nodeContent: transformedNodeContent
      };
    } catch (error) {
      console.error('Error fetching from API:', error);
      throw error;
    }
  };

  const handleStartLearning = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchGraphDataFromAPI(topic);
      
      if (!data.nodes || data.nodes.length === 0) {
        throw new Error('No data received from API');
      }

      const laidOut = solarSystemLayout(data.nodes, data.links);
      setGraphData({ nodes: laidOut, links: data.links });
      setNodeContent(data.nodeContent);
      await saveCurrentGraph(topic);
      setView("graph");
    } catch (error) {
      console.error('Error generating graph:', error);
      setError(`Failed to generate graph: ${error.message}. Please try again.`);
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

  const unlockNodes = async (parent, score) => {
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

    const newGraphData = {
      nodes: updatedNodes,
      links: cleanedLinks,
    };

    setGraphData(newGraphData);

    if (activeTabId && isStorageAvailable()) {
      try {
        const result = await window.storage.get(activeTabId);
        if (result && result.value) {
          const graphState = JSON.parse(result.value);
          graphState.nodes = updatedNodes;
          graphState.links = cleanedLinks;
          await window.storage.set(activeTabId, JSON.stringify(graphState));
        }
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    } else if (activeTabId) {
      setSavedGraphs(prev => prev.map(g => 
        g.id === activeTabId 
          ? { ...g, nodes: updatedNodes, links: cleanedLinks }
          : g
      ));
    }
  };

  const handleQuizSubmit = () => {
    if (selectedAnswer === null) {
      setError("Please select an answer before submitting!");
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

  const completedNodes = graphData.nodes.filter(n => n.quiz_completed).length;
  const totalNodes = graphData.nodes.length;
  const progressPercent = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0;

  const getProgressColor = () => {
    if (progressPercent === 0) return "#ef4444";
    if (progressPercent < 50) return "#ef4444";
    if (progressPercent < 70) return "#eab308";
    return "#22c55e";
  };

  if (view === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex relative overflow-hidden" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        {error && <ErrorToast message={error} onClose={() => setError(null)} />}
        
        {/* Left Side - Content */}
        <div className="w-1/2 flex items-center justify-center p-12 relative z-10">
          <div className="max-w-lg w-full">
            <h1 className="text-5xl font-bold text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
              StudySphere
            </h1>
            <p className="text-white/80 mb-8 text-lg" style={{ lineHeight: '1.6' }}>
              Enter any topic to generate an interactive learning path!
            </p>
            <div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && topic.trim() && handleStartLearning()}
                placeholder="e.g., Machine Learning, Quantum Physics..."
                className="w-full px-5 py-4 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 mb-4"
                style={{ fontSize: '16px' }}
              />
              <button
                onClick={handleStartLearning}
                disabled={!topic.trim() || loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                style={{ fontSize: '16px', letterSpacing: '-0.01em' }}
              >
                {loading ? "Generating..." : "Generate Learning Path"}
              </button>
            </div>

            {savedGraphs.length > 0 && (
              <div className="mt-8 opacity-0 hover:opacity-100 transition-opacity duration-300">
                <h2 className="text-xl font-semibold text-white mb-4">Your Learning Paths</h2>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {savedGraphs.map(graph => (
                    <div 
                      key={graph.id}
                      className="bg-white/10 rounded-lg p-4 flex items-center justify-between hover:bg-white/20 transition-all cursor-pointer backdrop-blur-sm"
                      onClick={() => loadGraph(graph.id)}
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium text-base">{graph.topic}</p>
                        <p className="text-white/60 text-sm">
                          {new Date(graph.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${graph.topic}"?`)) {
                            deleteGraph(graph.id);
                          }
                        }}
                        className="text-red-400 hover:text-red-300 ml-3 px-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Globe */}
        <div className="w-1/2 relative flex items-center justify-center" style={{ transform: 'translateY(10%)' }}>
          <AnimatedGlobe />
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative", display: "flex", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {error && <ErrorToast message={error} onClose={() => setError(null)} />}
      
      {/* Left Sidebar with Tabs */}
      <div style={{
        width: sidebarCollapsed ? "0" : "320px",
        background: "rgba(17, 17, 17, 0.95)",
        borderRight: "1px solid #333",
        display: "flex",
        flexDirection: "column",
        zIndex: 20,
        transition: "width 0.3s ease",
        overflow: "hidden"
      }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #333" }}>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && topic.trim() && handleStartLearning()}
            placeholder="Enter new topic..."
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid #444",
              background: "#222",
              color: "#fff",
              outline: "none",
              marginBottom: "8px",
              fontSize: "14px"
            }}
          />
          <button
            onClick={handleStartLearning}
            disabled={!topic.trim() || loading}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: "6px",
              border: "none",
              background: topic.trim() ? "linear-gradient(to right, #06b6d4, #3b82f6)" : "#444",
              color: "#fff",
              cursor: topic.trim() ? "pointer" : "not-allowed",
              fontWeight: "600",
              fontSize: "14px"
            }}
          >
            {loading ? "Generating..." : "Generate New Path"}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          <h3 style={{ color: "#999", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", padding: "8px 12px", marginBottom: "4px", letterSpacing: '0.05em' }}>
            Your Learning Paths
          </h3>
          {savedGraphs.length === 0 ? (
            <p style={{ color: "#666", padding: "12px", fontSize: "13px", textAlign: "center", lineHeight: '1.5' }}>
              No saved paths yet. Create one above!
            </p>
          ) : (
            savedGraphs.map(graph => (
              <div
                key={graph.id}
                onClick={() => loadGraph(graph.id)}
                style={{
                  padding: "12px",
                  margin: "4px 0",
                  borderRadius: "6px",
                  background: activeTabId === graph.id ? "#2563eb" : "#2a2a2a",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border: activeTabId === graph.id ? "1px solid #3b82f6" : "1px solid transparent",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
                onMouseEnter={(e) => {
                  if (activeTabId !== graph.id) {
                    e.currentTarget.style.background = "#333";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTabId !== graph.id) {
                    e.currentTarget.style.background = "#2a2a2a";
                  }
                }}
              >
                <div>
                  <p style={{ color: "#fff", fontWeight: "500", fontSize: "14px", marginBottom: "4px" }}>
                    {graph.topic}
                  </p>
                  <p style={{ color: "#999", fontSize: "12px" }}>
                    {new Date(graph.timestamp).toLocaleDateString()} • {graph.nodes.filter(n => n.quiz_completed).length}/{graph.nodes.length} completed
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete "${graph.topic}"?`)) {
                      deleteGraph(graph.id);
                    }
                  }}
                  style={{
                    color: "#ef4444",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 8px",
                    fontSize: "18px"
                  }}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Collapse/Expand Button */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        style={{
          position: "fixed",
          left: sidebarCollapsed ? "10px" : "310px",
          top: "20px",
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          background: "rgba(17, 17, 17, 0.95)",
          border: "1px solid #333",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          zIndex: 30,
          transition: "left 0.3s ease"
        }}
      >
        {sidebarCollapsed ? "→" : "←"}
      </button>

      {/* Main Graph Area */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }}>
        <ForceGraph2D
          width={window.innerWidth}
          height={window.innerHeight}
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

        {/* Node Detail Panel */}
        {selectedNode && (
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 340,
              padding: 20,
              background: "#111",
              color: "#fff",
              borderRadius: 12,
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "20px" }}>{selectedNode.label}</h3>
              <button
                onClick={() => setSelectedNode(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#999",
                  cursor: "pointer",
                  fontSize: "20px",
                  padding: "0 4px"
                }}
              >
                ✕
              </button>
            </div>
            <p style={{ marginTop: "10px", lineHeight: "1.6", color: "#ccc" }}>
              {nodeContent[selectedNode.id]?.content || "Loading content..."}
            </p>
            {nodeContent[selectedNode.id]?.quiz && (
              <>
                <div style={{ 
                  marginTop: "20px", 
                  padding: "12px", 
                  background: "#1a1a1a", 
                  borderRadius: "8px",
                  borderLeft: "3px solid #3b82f6"
                }}>
                  <p style={{ fontWeight: "600", marginBottom: "12px" }}>
                    {nodeContent[selectedNode.id].quiz.question}
                  </p>
                  {nodeContent[selectedNode.id].quiz.options.map((opt, idx) => (
                    <div key={idx} style={{ marginTop: "10px" }}>
                      <label style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        cursor: score === null ? "pointer" : "default",
                        padding: "8px",
                        borderRadius: "6px",
                        background: selectedAnswer === idx ? "#2a2a2a" : "transparent",
                        transition: "all 0.2s"
                      }}>
                        <input
                          type="radio"
                          name="quiz"
                          value={idx}
                          checked={selectedAnswer === idx}
                          onChange={() => setSelectedAnswer(idx)}
                          disabled={score !== null}
                          style={{ marginRight: "10px" }}
                        /> 
                        <span style={{ flex: 1 }}>{opt}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </>
            )}

            {score === null ? (
              <button 
                onClick={handleQuizSubmit} 
                style={{ 
                  marginTop: "15px", 
                  width: "100%",
                  padding: "12px 20px", 
                  background: "linear-gradient(to right, #3b82f6, #2563eb)", 
                  border: "none", 
                  borderRadius: "8px", 
                  color: "#fff", 
                  cursor: "pointer", 
                  fontWeight: "600",
                  fontSize: "15px"
                }}
              >
                Submit Answer
              </button>
            ) : score === 10 ? (
              <div style={{ 
                marginTop: "15px", 
                padding: "16px", 
                background: "rgba(34, 197, 94, 0.15)", 
                borderRadius: "8px",
                border: "1px solid rgba(34, 197, 94, 0.3)"
              }}>
                <p style={{ color: "#22C55E", fontWeight: "bold", margin: 0, marginBottom: "8px", fontSize: "16px" }}>
                  ✓ Correct!
                </p>
                <p style={{ color: "#86efac", margin: 0, fontSize: "14px" }}>
                  Move on to: {
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
                <div style={{ 
                  padding: "16px", 
                  background: "rgba(239, 68, 68, 0.15)", 
                  borderRadius: "8px",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  marginBottom: "12px"
                }}>
                  <p style={{ color: "#EF4444", fontWeight: "bold", margin: 0 }}>
                    ✗ Incorrect. Try again!
                  </p>
                </div>
                <button
                  onClick={() => {
                    setScore(null);
                    setSelectedAnswer(null);
                  }}
                  style={{ 
                    padding: "12px 20px", 
                    width: "100%",
                    background: "#ef4444", 
                    border: "none", 
                    borderRadius: "8px", 
                    color: "#fff", 
                    cursor: "pointer", 
                    fontWeight: "600",
                    fontSize: "15px"
                  }}
                >
                  Retry Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar at Bottom */}
      {graphData.nodes.length > 0 && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: "rgba(17, 17, 17, 0.95)",
          borderTop: "1px solid #333",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          zIndex: 25
        }}>
          <div style={{ flex: 1, marginRight: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#999", fontSize: "13px", fontWeight: "600" }}>
                Learning Progress
              </span>
              <span style={{ color: "#fff", fontSize: "13px", fontWeight: "600" }}>
                {completedNodes} / {totalNodes} ({Math.round(progressPercent)}%)
              </span>
            </div>
            <div style={{
              width: "100%",
              height: "8px",
              background: "#2a2a2a",
              borderRadius: "4px",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: getProgressColor(),
                transition: "all 0.5s ease",
                borderRadius: "4px"
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}