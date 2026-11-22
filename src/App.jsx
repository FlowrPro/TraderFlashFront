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

function GameArena({ active, spawned, weapon }) {
  const canvasRef = useRef(null);
  const activeRef = useRef(active);
  const spawnedRef = useRef(spawned);
  const weaponRef = useRef(weapon);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    spawnedRef.current = spawned;
  }, [spawned]);

  useEffect(() => {
    weaponRef.current = weapon;
  }, [weapon]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const keys = new Set();
    let mouse = { x: 0, y: 0 };
    let player = { x: 0, y: 0 };
    let animationFrame;
    let mouseDown = false;
    let lastShotAt = 0;
    const bullets = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const previousWidth = canvas.width || rect.width;
      const previousHeight = canvas.height || rect.height;
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * pixelRatio);
      canvas.height = Math.round(rect.height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      if (player.x === 0 && player.y === 0) {
        player.x = rect.width / 2;
        player.y = rect.height / 2;
      } else {
        player.x = (player.x / previousWidth) * rect.width;
        player.y = (player.y / previousHeight) * rect.height;
      }
      mouse.x = player.x + 100;
      mouse.y = player.y;
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
      if (event.button === 0) mouseDown = true;
    };
    const handleMouseUp = () => {
      mouseDown = false;
    };

    const obstacles = [
      { x: 0.18, y: 0.25, width: 0.14, height: 0.06 },
      { x: 0.68, y: 0.28, width: 0.16, height: 0.06 },
      { x: 0.24, y: 0.68, width: 0.12, height: 0.07 },
      { x: 0.69, y: 0.71, width: 0.13, height: 0.07 },
    ];

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);

      context.fillStyle = '#1b2a24';
      context.fillRect(0, 0, rect.width, rect.height);

      context.strokeStyle = 'rgba(150, 180, 160, 0.11)';
      context.lineWidth = 1;
      for (let x = 0; x < rect.width; x += 48) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, rect.height);
        context.stroke();
      }
      for (let y = 0; y < rect.height; y += 48) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(rect.width, y);
        context.stroke();
      }

      context.fillStyle = '#657169';
      obstacles.forEach((obstacle) => {
        context.fillRect(
          obstacle.x * rect.width,
          obstacle.y * rect.height,
          obstacle.width * rect.width,
          obstacle.height * rect.height,
        );
      });

      let dx = 0;
      let dy = 0;
      if (keys.has('KeyW') || keys.has('ArrowUp')) dy -= 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) dy += 1;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) dx -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) dx += 1;
      if (activeRef.current && (dx !== 0 || dy !== 0)) {
        const length = Math.hypot(dx, dy);
        const speed = 3.1;
        player.x += (dx / length) * speed;
        player.y += (dy / length) * speed;
        player.x = Math.max(22, Math.min(rect.width - 22, player.x));
        player.y = Math.max(22, Math.min(rect.height - 22, player.y));
      }

      const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
      const now = performance.now();
      if (
        activeRef.current &&
        spawnedRef.current &&
        mouseDown &&
        now - lastShotAt >= 180
      ) {
        const gun = weaponRef.current;
        const barrelLength = gun.barrelLength;
        const startX = player.x + Math.cos(angle) * (barrelLength + 17);
        const startY = player.y + Math.sin(angle) * (barrelLength + 17);
        bullets.push({
          x: startX,
          y: startY,
          dx: Math.cos(angle) * 11,
          dy: Math.sin(angle) * 11,
          life: 65,
        });
        lastShotAt = now;
      }

      for (let index = bullets.length - 1; index >= 0; index -= 1) {
        const bullet = bullets[index];
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
        bullet.life -= 1;
        if (bullet.life <= 0) {
          bullets.splice(index, 1);
        }
      }

      bullets.forEach((bullet) => {
        context.beginPath();
        context.moveTo(bullet.x - bullet.dx * 1.4, bullet.y - bullet.dy * 1.4);
        context.lineTo(bullet.x, bullet.y);
        context.strokeStyle = '#aeb2b4';
        context.lineWidth = 2;
        context.stroke();
      });

      if (spawnedRef.current) {
        context.save();
        context.translate(player.x, player.y);
        context.rotate(angle);
        const gun = weaponRef.current;
        context.fillStyle = '#30373d';
        context.fillRect(15, -(gun.barrelHeight / 2), gun.barrelLength, gun.barrelHeight);
        context.fillStyle = '#15191d';
        context.fillRect(15 + gun.barrelLength - 3, -(gun.barrelHeight / 2) - 1, 12, gun.barrelHeight + 2);
        if (gun.code === 'awm-s') {
          context.fillStyle = '#15191d';
          context.fillRect(24, -(gun.barrelHeight / 2) - 9, 24, 5);
        }
        if (gun.code === 'minigun') {
          context.fillStyle = '#22272b';
          context.fillRect(24, -gun.barrelHeight / 2 - 4, 28, 3);
          context.fillRect(24, gun.barrelHeight / 2 + 1, 28, 3);
        }
        if (gun.code === 'submachine-gun' || gun.code === 'semi-auto') {
          context.fillStyle = '#15191d';
          context.fillRect(22, gun.barrelHeight / 2 - 1, 9, 13);
        }
        context.restore();

        context.beginPath();
        context.arc(player.x, player.y, 22, 0, Math.PI * 2);
        context.fillStyle = '#63b36a';
        context.fill();
        context.lineWidth = 4;
        context.strokeStyle = '#d9eddb';
        context.stroke();
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return <canvas className="game-canvas" ref={canvasRef} aria-label="2D game arena" />;
}

function App() {
  const currentUser = null;
  const [gameActive, setGameActive] = useState(false);
  const [hasSpawned, setHasSpawned] = useState(false);
  const [serverPanelOpen, setServerPanelOpen] = useState(false);
  const [loadoutOpen, setLoadoutOpen] = useState(false);
  const [selectedGun, setSelectedGun] = useState(guns[0]);

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

  const handleScreenClick = (event) => {
    if (gameActive || event.target.closest('button, .server-panel, .loadout-backdrop')) return;
    setHasSpawned(true);
    setGameActive(true);
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
        <GameArena active={gameActive} spawned={hasSpawned} weapon={selectedGun} />
        {gameActive ? (
          <div className="game-status">LOCAL SERVER · READY</div>
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
                <button className="server-row" type="button" onClick={() => setServerPanelOpen(false)}>
                  <span className="server-status-dot" aria-hidden="true" />
                  <span className="server-details">
                    <strong>Local Arena</strong>
                    <small>Free For All · 0 players</small>
                  </span>
                  <span className="server-ping">Ready</span>
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
              <span>Click to play</span>
            </div>

            <div className="action-panel" aria-label="Player options">
              <button className="loadout-button" type="button" onClick={() => setLoadoutOpen(true)}>
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
