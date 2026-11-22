import React, { useEffect, useRef, useState } from 'react';

const navItems = [
  { label: 'Inventory', icon: 'inventory' },
  { label: 'Store', icon: 'store' },
  { label: 'Servers', icon: 'servers' },
  { label: 'Friends', icon: 'friends' },
  { label: 'Settings', icon: 'settings' },
];

const guns = [
  { name: 'Pistol', code: 'pistol', barrelLength: 36, barrelHeight: 7 },
  { name: 'Semi Auto', code: 'semi-auto', barrelLength: 42, barrelHeight: 8 },
  { name: 'Minigun', code: 'minigun', barrelLength: 56, barrelHeight: 14 },
  { name: 'AWM-S', code: 'awm-s', barrelLength: 58, barrelHeight: 6 },
  { name: 'Assault Rifle', code: 'assault-rifle', barrelLength: 50, barrelHeight: 11 },
  { name: 'Submachine Gun', code: 'submachine-gun', barrelLength: 38, barrelHeight: 12 },
];

function NavIcon({ name }) {
  const icons = {
    inventory: (
      <>
        <path d="M4 8.5 12 4l8 4.5-8 4.5L4 8.5Z" />
        <path d="M4 8.5V18l8 4 8-4V8.5M12 13v9" />
      </>
    ),
    store: (
      <>
        <path d="M4 10h16l-1.5-6h-13L4 10Z" />
        <path d="M5 10v10h14V10M5 14h14M9 20v-4h6v4" />
      </>
    ),
    servers: (
      <>
        <rect x="4" y="4" width="16" height="6" rx="1" />
        <rect x="4" y="14" width="16" height="6" rx="1" />
        <path d="M7 7h.01M7 17h.01M10 7h7M10 17h7" />
      </>
    ),
    friends: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 20v-1a5.5 5.5 0 0 1 11 0v1h-11Z" />
        <path d="M16 5.5a3 3 0 0 1 0 5.8M17 14a5 5 0 0 1 3.5 4.8V20h-3" />
      </>
    ),
    settings: (
      <>
        <path d="m10 3-.5 2.2a7 7 0 0 0-1.7 1L5.7 5.5l-2 3.4 1.8 1.4a7 7 0 0 0 0 2.1l-1.8 1.4 2 3.4 2.1-.7a7 7 0 0 0 1.7 1L10 20h4l.5-2.2a7 7 0 0 0 1.7-1l2.1.7 2-3.4-1.8-1.4a7 7 0 0 0 0-2.1l1.8-1.4-2-3.4-2.1.7a7 7 0 0 0-1.7-1L14 3h-4Z" />
        <circle cx="12" cy="11.5" r="2.5" />
      </>
    ),
  };

  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

function PlayerAvatar() {
  return (
    <span className="player-avatar" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M12 12a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Zm0 2c-4.1 0-7.5 2.4-7.5 5.3V21h15v-1.7c0-2.9-3.4-5.3-7.5-5.3Z" />
      </svg>
    </span>
  );
}

function GameArena({ active, weapon, socket, playerId, gameState }) {
  const canvasRef = useRef(null);
  const activeRef = useRef(active);
  const weaponRef = useRef(weapon);
  const gameStateRef = useRef(gameState);
  const playerIdRef = useRef(playerId);

  useEffect(() => {
    activeRef.current = active;
    weaponRef.current = weapon;
    gameStateRef.current = gameState;
    playerIdRef.current = playerId;
  }, [active, weapon, gameState, playerId]);

  useEffect(() => {
    if (active || !playerId || socket?.readyState !== WebSocket.OPEN) return;
    const player = gameStateRef.current.players.find((item) => item.id === playerId);
    socket.send(JSON.stringify({
      type: 'input',
      moveX: 0,
      moveY: 0,
      aim: player?.angle ?? 0,
      shooting: false,
      weapon: weapon.code,
    }));
  }, [active, playerId, socket, weapon]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const keys = new Set();
    const mouse = { x: 0, y: 0 };
    let shooting = false;
    let animationFrame;
    let inputTimer;
    let canvasWidth = 0;
    let canvasHeight = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      canvasWidth = rect.width;
      canvasHeight = rect.height;
      canvas.width = Math.round(rect.width * pixelRatio);
      canvas.height = Math.round(rect.height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const handleKeyDown = (event) => {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(event.code)) {
        event.preventDefault();
        keys.add(event.code);
      }
    };
    const handleKeyUp = (event) => keys.delete(event.code);
    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };
    const handleMouseDown = (event) => {
      if (activeRef.current && event.button === 0) shooting = true;
    };
    const handleMouseUp = () => {
      shooting = false;
    };

    const sendInput = () => {
      const currentSocket = socket;
      const currentState = gameStateRef.current;
      const currentPlayer = currentState?.players.find((player) => player.id === playerIdRef.current);
      if (!activeRef.current || !currentPlayer || currentSocket?.readyState !== WebSocket.OPEN) return;

      let moveX = 0;
      let moveY = 0;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) moveX -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) moveX += 1;
      if (keys.has('KeyW') || keys.has('ArrowUp')) moveY -= 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) moveY += 1;
      const cameraX = Math.max(0, Math.min(currentState.world.width - canvasWidth, currentPlayer.x - canvasWidth / 2));
      const cameraY = Math.max(0, Math.min(currentState.world.height - canvasHeight, currentPlayer.y - canvasHeight / 2));
      const aim = Math.atan2(mouse.y + cameraY - currentPlayer.y, mouse.x + cameraX - currentPlayer.x);

      currentSocket.send(JSON.stringify({
        type: 'input',
        moveX,
        moveY,
        aim,
        shooting,
        weapon: weaponRef.current.code,
      }));
    };

    const draw = () => {
      const state = gameStateRef.current;
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      context.fillStyle = '#1b2a24';
      context.fillRect(0, 0, canvasWidth, canvasHeight);

      const localPlayer = state?.players.find((player) => player.id === playerIdRef.current);
      const world = state?.world ?? { width: canvasWidth, height: canvasHeight };
      const cameraX = localPlayer ? Math.max(0, Math.min(world.width - canvasWidth, localPlayer.x - canvasWidth / 2)) : 0;
      const cameraY = localPlayer ? Math.max(0, Math.min(world.height - canvasHeight, localPlayer.y - canvasHeight / 2)) : 0;

      context.save();
      context.translate(-cameraX, -cameraY);
      context.strokeStyle = 'rgba(150, 180, 160, 0.11)';
      context.lineWidth = 1;
      for (let x = 0; x <= world.width; x += 48) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, world.height);
        context.stroke();
      }
      for (let y = 0; y <= world.height; y += 48) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(world.width, y);
        context.stroke();
      }

      context.fillStyle = '#657169';
      [
        { x: 260, y: 250, width: 280, height: 72 },
        { x: 1360, y: 280, width: 320, height: 72 },
        { x: 420, y: 790, width: 240, height: 84 },
        { x: 1380, y: 830, width: 260, height: 84 },
      ].forEach((obstacle) => context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height));

      (state?.bullets ?? []).forEach((bullet) => {
        const magnitude = Math.hypot(bullet.dx, bullet.dy) || 1;
        const tailLength = 16;
        context.beginPath();
        context.moveTo(bullet.x - (bullet.dx / magnitude) * tailLength, bullet.y - (bullet.dy / magnitude) * tailLength);
        context.lineTo(bullet.x, bullet.y);
        context.strokeStyle = '#aeb2b4';
        context.lineWidth = 3;
        context.stroke();
      });

      (state?.players ?? []).forEach((player) => {
        const gun = guns.find((item) => item.code === player.weapon) ?? guns[0];
        context.save();
        context.translate(player.x, player.y);
        context.rotate(player.angle);
        context.fillStyle = '#30373d';
        context.fillRect(15, -(gun.barrelHeight / 2), gun.barrelLength, gun.barrelHeight);
        context.fillStyle = '#15191d';
        context.fillRect(15 + gun.barrelLength - 3, -(gun.barrelHeight / 2) - 1, 12, gun.barrelHeight + 2);
        if (gun.code === 'awm-s') {
          context.fillRect(24, -(gun.barrelHeight / 2) - 9, 24, 5);
        }
        if (gun.code === 'minigun') {
          context.fillRect(24, -gun.barrelHeight / 2 - 4, 28, 3);
          context.fillRect(24, gun.barrelHeight / 2 + 1, 28, 3);
        }
        if (gun.code === 'submachine-gun' || gun.code === 'semi-auto') {
          context.fillRect(22, gun.barrelHeight / 2 - 1, 9, 13);
        }
        context.restore();

        context.beginPath();
        context.arc(player.x, player.y, 22, 0, Math.PI * 2);
        context.fillStyle = player.id === playerIdRef.current ? '#63b36a' : '#5596d1';
        context.fill();
        context.lineWidth = 4;
        context.strokeStyle = '#d9eddb';
        context.stroke();
      });
      context.restore();

      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    inputTimer = window.setInterval(sendInput, 50);
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearInterval(inputTimer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [socket]);

  return <canvas className="game-canvas" ref={canvasRef} aria-label="Multiplayer game arena" />;
}

function App() {
  const currentUser = null;
  const serverUrl = import.meta.env.VITE_GAME_SERVER_URL;
  const [gameActive, setGameActive] = useState(false);
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(serverUrl ? 'connecting' : 'not-configured');
  const [playerId, setPlayerId] = useState(null);
  const [gameState, setGameState] = useState({ world: { width: 2000, height: 1200 }, players: [], bullets: [] });
  const [serverPanelOpen, setServerPanelOpen] = useState(false);
  const [loadoutOpen, setLoadoutOpen] = useState(false);
  const [selectedGun, setSelectedGun] = useState(guns[0]);
  const joinRequested = useRef(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!serverUrl) {
      setConnectionStatus('not-configured');
      return undefined;
    }

    let reconnectTimer;
    let shouldReconnect = true;
    const connect = () => {
      setConnectionStatus('connecting');
      const currentSocket = new WebSocket(serverUrl);
      socketRef.current = currentSocket;
      setSocket(currentSocket);

      currentSocket.addEventListener('open', () => {
        setConnectionStatus('connected');
        if (joinRequested.current) {
          setConnectionStatus('joining');
          currentSocket.send(JSON.stringify({ type: 'join' }));
        }
      });

      currentSocket.addEventListener('message', (event) => {
        let message;
        try {
          message = JSON.parse(event.data);
        } catch (error) {
          console.error('Received an invalid message from the game server.', error);
          setConnectionStatus('error');
          return;
        }

        if (message.type === 'joined') {
          joinRequested.current = false;
          setPlayerId(message.playerId);
          setGameActive(true);
          setConnectionStatus('connected');
        } else if (message.type === 'state') {
          setGameState(message);
        } else if (message.type === 'error') {
          joinRequested.current = false;
          setConnectionStatus('error');
          console.error(`Game server error: ${message.message}`);
        }
      });

      currentSocket.addEventListener('error', (error) => {
        console.error('Could not connect to the game server.', error);
        setConnectionStatus('error');
      });

      currentSocket.addEventListener('close', () => {
        if (socketRef.current === currentSocket) {
          socketRef.current = null;
          setSocket(null);
        }
        joinRequested.current = false;
        setPlayerId(null);
        setGameState({ world: { width: 2000, height: 1200 }, players: [], bullets: [] });
        setGameActive(false);
        setConnectionStatus('disconnected');
        if (shouldReconnect) reconnectTimer = window.setTimeout(connect, 2000);
      });
    };

    connect();
    return () => {
      shouldReconnect = false;
      window.clearTimeout(reconnectTimer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [serverUrl]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.code === 'Escape') {
        setServerPanelOpen(false);
        setLoadoutOpen(false);
        setGameActive(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const enterGame = () => {
    const currentSocket = socketRef.current;
    if (playerId) {
      setGameActive(true);
      return;
    }
    if (!currentSocket || currentSocket.readyState !== WebSocket.OPEN) return;
    if (joinRequested.current) return;
    joinRequested.current = true;
    setConnectionStatus('joining');
    currentSocket.send(JSON.stringify({ type: 'join' }));
  };

  const handleScreenClick = (event) => {
    if (gameActive || event.target.closest('button, .server-panel, .loadout-backdrop')) return;
    enterGame();
  };

  return (
    <main className={`game-shell ${gameActive ? 'game-active' : ''}`} onPointerDown={handleScreenClick}>
      {!gameActive && (
        <aside className="sidebar" aria-label="Account and game navigation">
          <div className="account-panel">
            {currentUser ? (
              <div className="user-account" aria-label={`Signed in as ${currentUser.username}`}>
                <PlayerAvatar />
                <span className="account-name">{currentUser.username}</span>
              </div>
            ) : (
              <button className="login-button" type="button">
                <PlayerAvatar />
                <span>Login</span>
              </button>
            )}
          </div>
          <nav className="nav-list" aria-label="Game navigation">
            {navItems.map((item) => (
              <button
                className="nav-item"
                key={item.label}
                type="button"
                onClick={item.label === 'Servers' ? () => setServerPanelOpen(true) : undefined}
                aria-expanded={item.label === 'Servers' ? serverPanelOpen : undefined}
              >
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>
      )}

      <section className="content">
        <GameArena
          active={gameActive}
          weapon={selectedGun}
          socket={socket}
          playerId={playerId}
          gameState={gameState}
        />
        {gameActive ? (
          <div className="game-status">MULTIPLAYER · CONNECTED</div>
        ) : (
          <>
            <header className="topbar">
              <div className="brand" aria-label="Moborr.io">
                <span className="brand-main">MOBORR</span>
                <span className="brand-accent">.IO</span>
              </div>
            </header>

            {serverPanelOpen && (
              <div className="server-panel" role="dialog" aria-modal="true" aria-label="Servers">
                <div className="server-panel-header">
                  <h2>Servers</h2>
                  <button className="server-close" type="button" onClick={() => setServerPanelOpen(false)} aria-label="Close servers">
                    ×
                  </button>
                </div>
                <button className="server-row" type="button" onClick={() => {
                  setServerPanelOpen(false);
                  enterGame();
                }}>
                  <span className={`server-status-dot ${connectionStatus === 'connected' ? '' : 'offline'}`} aria-hidden="true" />
                  <span className="server-details">
                    <strong>Moborr Arena</strong>
                    <small>Free For All · {gameState.players.length} players</small>
                  </span>
                  <span className={`server-ping ${connectionStatus === 'connected' ? '' : 'offline'}`}>
                    {connectionStatus === 'connected' ? 'Ready' : 'Offline'}
                  </span>
                </button>
              </div>
            )}

            {loadoutOpen && (
              <div className="loadout-backdrop" role="presentation">
                <div className="loadout-panel" role="dialog" aria-modal="true" aria-label="Loadout">
                  <div className="loadout-header">
                    <div>
                      <span className="loadout-kicker">Weapon Loadout</span>
                      <h2>Choose a gun</h2>
                    </div>
                    <button className="loadout-close" type="button" onClick={() => setLoadoutOpen(false)} aria-label="Close loadout">
                      ×
                    </button>
                  </div>
                  <div className="gun-grid">
                    {guns.map((gun) => (
                      <button
                        className={`gun-option ${selectedGun.code === gun.code ? 'selected' : ''}`}
                        key={gun.code}
                        type="button"
                        onClick={() => setSelectedGun(gun)}
                        aria-pressed={selectedGun.code === gun.code}
                      >
                        <span className={`gun-silhouette gun-${gun.code}`} aria-hidden="true">
                          <span />
                        </span>
                        <strong>{gun.name}</strong>
                        <small>{selectedGun.code === gun.code ? 'Equipped' : 'Equip'}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="click-to-play">
              <span>
                {connectionStatus === 'connected'
                  ? 'Click to play'
                  : connectionStatus === 'connecting' || connectionStatus === 'joining'
                    ? 'Connecting to server...'
                    : connectionStatus === 'not-configured'
                      ? 'Game server not configured'
                      : 'Game server unavailable'}
              </span>
            </div>

            <div className="action-panel" aria-label="Player options">
              <button className="loadout-button" type="button" onClick={() => setLoadoutOpen(true)} disabled={connectionStatus !== 'connected'}>
                <span>LOADOUT</span>
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default App;
