/* ============================================
   PARALLAX STARS + 3D NEURAL NETWORK
   ============================================ */
(function() {
    'use strict';

    const CONFIG = {
        stars: {
            layers: [
                { count: 100, size: [0.5, 1.5], opacity: [0.2, 0.5], parallax: 0.03, drift: 0.02 },
                { count: 70,  size: [1, 2.5],   opacity: [0.3, 0.7], parallax: 0.1,  drift: 0.04 },
                { count: 50,  size: [1.5, 3],   opacity: [0.5, 1],   parallax: 0.2,  drift: 0.06 }
            ],
            colors: [
                { h: 0, s: 0, l: 100, w: 50 },
                { h: 210, s: 25, l: 85, w: 18 },
                { h: 190, s: 60, l: 75, w: 14 },
                { h: 270, s: 45, l: 78, w: 12 },
                { h: 200, s: 40, l: 80, w: 6 }
            ]
        },
        
        network: {
            parallax: 0.55,
            startY: 0.62,
            endY: 3.15,
            fadeStartZone: 0.15,
            fadeEndZone: 0.2,
            nodesPerSection: 8,
            branchesPerNode: 4,
            nodeSize: 4,
            lineOpacity: 0.18,
            trembleAmount: 2.5,
            pulseEnabled: true,
            pulseSpeed: 2,
            pulseIntensity: 0.2,
            enable3D: true,
            perspective: 800,
            maxRotationX: 15,
            depthRange: [-0.5, 0.5],
            depthScale: 0.4
        },
        
        mouse: { influence: 15, smoothing: 0.06 }
    };

    const isMobile = window.innerWidth < 768;

    const state = {
        time: 0,
        scrollY: 0,
        scrollProgress: 0,
        mouseX: 0, 
        mouseY: 0,
        smoothMouseX: 0, 
        smoothMouseY: 0,
        viewHeight: 0,
        maxScroll: 0,
        isRunning: true
    };

    const starsCanvas = document.getElementById('starsCanvas');
    const networkCanvas = document.getElementById('networkCanvas');
    const starsCtx = starsCanvas.getContext('2d');
    const networkCtx = networkCanvas.getContext('2d');

    let starsData = [];
    let networkNodes = [];

    // ==================== UTILITY FUNCTIONS ====================
    
    function pickColor() {
        const colors = CONFIG.stars.colors;
        const total = colors.reduce((s, c) => s + c.w, 0);
        let r = Math.random() * total;
        for (const c of colors) { 
            r -= c.w; 
            if (r <= 0) return c; 
        }
        return colors[0];
    }

    function lerp(a, b, t) { 
        return a + (b - a) * t; 
    }
    
    function rand(min, max) { 
        return min + Math.random() * (max - min); 
    }

    function project3D(x, y, z, centerX, centerY, rotationX) {
        const { perspective, depthScale } = CONFIG.network;
        const cosR = Math.cos(rotationX);
        const sinR = Math.sin(rotationX);
        const y2 = y * cosR - z * perspective * sinR;
        const z2 = y * sinR + z * perspective * cosR;
        const scale = perspective / (perspective + z2 * depthScale);
        return {
            x: centerX + (x - centerX) * scale,
            y: centerY + (y2 - centerY) * scale,
            scale: scale,
            depth: z
        };
    }

    // ==================== INITIALIZATION ====================
    
    function initStars() {
        starsData = [];
        CONFIG.stars.layers.forEach((layer, layerIndex) => {
            const count = isMobile ? Math.floor(layer.count * 0.6) : layer.count;
            for (let i = 0; i < count; i++) {
                const color = pickColor();
                starsData.push({
                    layer: layerIndex,
                    x: Math.random() * 120 - 10,
                    y: Math.random() * 140 - 20,
                    baseX: 0, 
                    baseY: 0,
                    size: lerp(layer.size[0], layer.size[1], Math.random()),
                    opacity: lerp(layer.opacity[0], layer.opacity[1], Math.random()),
                    parallax: layer.parallax,
                    drift: layer.drift,
                    driftAngle: Math.random() * Math.PI * 2,
                    driftSpeed: 0.2 + Math.random() * 0.3,
                    twinkle: { 
                        speed: 0.5 + Math.random() * 2, 
                        offset: Math.random() * Math.PI * 2 
                    },
                    color
                });
            }
        });
        starsData.forEach(s => { 
            s.baseX = s.x; 
            s.baseY = s.y; 
        });
    }

    function initNetwork() {
        networkNodes = [];
        const { startY, endY, nodesPerSection, branchesPerNode, depthRange } = CONFIG.network;
        const totalHeight = endY - startY;
        const totalMainNodes = Math.floor(totalHeight * nodesPerSection);
        
        const mainPath = [];
        
        // Créer le chemin principal avec zigzag
        for (let i = 0; i <= totalMainNodes; i++) {
            const t = i / totalMainNodes;
            const y = startY + t * totalHeight;
            const baseX = 0.5;
            const amplitude = 0.18;
            const zigzag = Math.sin(t * Math.PI * 4) * amplitude;
            const x = i === totalMainNodes ? 0.5 : baseX + zigzag;
            const z = Math.sin(t * Math.PI * 3) * (depthRange[1] - depthRange[0]) / 2;
            
            const node = {
                id: networkNodes.length,
                type: i % Math.floor(nodesPerSection / 2) === 0 ? 'main' : 'path',
                y, x, z,
                size: i % Math.floor(nodesPerSection / 2) === 0 ? CONFIG.network.nodeSize : CONFIG.network.nodeSize * 0.7,
                connections: [],
                networkPosition: t
            };
            
            networkNodes.push(node);
            mainPath.push(node.id);
        }
        
        // Connecter le chemin principal
        for (let i = 0; i < mainPath.length - 1; i++) {
            networkNodes[mainPath[i]].connections.push({ 
                targetId: mainPath[i + 1], 
                revealProgress: 0 
            });
        }
        
        // Créer les branches
        mainPath.forEach((nodeId, idx) => {
            if (idx === 0 || idx === mainPath.length - 1) return;
            const mainNode = networkNodes[nodeId];
            const t = idx / mainPath.length;
            const branchProb = 1 - (t * 0.5);
            
            for (let b = 0; b < branchesPerNode; b++) {
                if (Math.random() > branchProb) continue;
                const side = b % 2 === 0 ? -1 : 1;
                const branchLength = (1 - t * 0.6);
                const offsetX = side * rand(0.06, 0.15) * branchLength;
                const offsetY = rand(-0.1, 0.1) * branchLength;
                const branchZ = mainNode.z + rand(-0.3, 0.3);
                
                const branchNode = {
                    id: networkNodes.length,
                    type: 'branch',
                    y: mainNode.y + offsetY,
                    x: mainNode.x + offsetX,
                    z: branchZ,
                    size: CONFIG.network.nodeSize * 0.5,
                    connections: [],
                    networkPosition: mainNode.networkPosition
                };
                
                mainNode.connections.push({ 
                    targetId: branchNode.id, 
                    revealProgress: 0.05 + t * 0.2 
                });
                networkNodes.push(branchNode);
                
                // Créer les sous-branches
                if (Math.random() > 0.4 && t < 0.8) {
                    const subBranch = {
                        id: networkNodes.length,
                        type: 'subbranch',
                        y: branchNode.y + rand(-0.06, 0.06),
                        x: branchNode.x + side * rand(0.03, 0.08),
                        z: branchZ + rand(-0.2, 0.2),
                        size: CONFIG.network.nodeSize * 0.35,
                        connections: [],
                        networkPosition: mainNode.networkPosition
                    };
                    branchNode.connections.push({ 
                        targetId: subBranch.id, 
                        revealProgress: 0.1 + t * 0.25 
                    });
                    networkNodes.push(subBranch);
                }
            }
        });
        
        // Ajouter des connexions latérales progressives
        networkNodes.forEach((node, i) => {
            networkNodes.forEach((other, j) => {
                if (i >= j) return;
                if (node.connections.some(conn => 
                    (typeof conn === 'number' ? conn : conn.targetId) === j
                )) return;
                
                const dx = Math.abs(node.x - other.x);
                const dy = Math.abs(node.y - other.y);
                const dz = Math.abs((node.z || 0) - (other.z || 0));
                
                // Connexions proches
                if (dx < 0.25 && dy < 0.35 && dy > 0.01 && dz < 0.8) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const revealThreshold = 0.15 + distance * 1.5;
                    if (Math.random() > 0.3) {
                        node.connections.push({ 
                            targetId: j, 
                            revealProgress: revealThreshold 
                        });
                    }
                }
                
                // Connexions moyenne distance
                if (dx < 0.35 && dy < 0.5 && dy > 0.05 && dz < 1.0) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const revealThreshold = 0.3 + distance * 1.2;
                    if (Math.random() > 0.6) {
                        node.connections.push({ 
                            targetId: j, 
                            revealProgress: revealThreshold 
                        });
                    }
                }
            });
        });
    }

    function resize() {
        starsCanvas.width = networkCanvas.width = window.innerWidth;
        starsCanvas.height = networkCanvas.height = window.innerHeight;
        state.viewHeight = window.innerHeight;
        state.maxScroll = document.body.scrollHeight - window.innerHeight;
    }

    // ==================== DRAWING FUNCTIONS ====================
    
    function drawStars() {
        const { time, scrollY, smoothMouseX, smoothMouseY, viewHeight } = state;
        const ctx = starsCtx;
        const w = starsCanvas.width;
        const h = starsCanvas.height;

        ctx.clearRect(0, 0, w, h);

        starsData.forEach(star => {
            star.driftAngle += star.driftSpeed * 0.01;
            const driftX = Math.cos(star.driftAngle) * star.drift * 50;
            const driftY = Math.sin(star.driftAngle) * star.drift * 30;
            const parallaxY = scrollY * star.parallax;
            const mouseX = smoothMouseX * CONFIG.mouse.influence * star.parallax * 3;
            const mouseY = smoothMouseY * CONFIG.mouse.influence * star.parallax * 2;

            let x = (star.baseX / 100) * w + driftX + mouseX;
            let y = (star.baseY / 100) * h + driftY - parallaxY + mouseY;
            const totalH = h * 1.4;
            y = ((y % totalH) + totalH) % totalH - h * 0.2;

            const twinkle = 0.7 + 0.3 * Math.sin(time * star.twinkle.speed + star.twinkle.offset);
            const opacity = star.opacity * twinkle;

            const c = star.color;
            ctx.fillStyle = c.s > 0 
                ? `hsla(${c.h}, ${c.s}%, ${c.l}%, ${opacity})`
                : `rgba(255,255,255,${opacity})`;
            ctx.beginPath();
            ctx.arc(x, y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function drawNetwork() {
        const { time, scrollY, scrollProgress, smoothMouseX, smoothMouseY, viewHeight } = state;
        const ctx = networkCtx;
        const w = networkCanvas.width;
        const h = networkCanvas.height;
        const { 
            parallax, lineOpacity, trembleAmount, 
            pulseEnabled, pulseSpeed, pulseIntensity, 
            fadeStartZone, fadeEndZone,
            enable3D, maxRotationX 
        } = CONFIG.network;

        ctx.clearRect(0, 0, w, h);

        const centerX = w / 2;
        const centerY = h / 2;
        const rotationX = enable3D ? (scrollProgress * maxRotationX * Math.PI / 180) : 0;

        // Projeter tous les nœuds en 2D
        const screenNodes = networkNodes.map(node => {
            const docY = node.y * viewHeight;
            let screenY = docY - scrollY * parallax;
            const mx = smoothMouseX * CONFIG.mouse.influence;
            const my = smoothMouseY * CONFIG.mouse.influence * 0.5;
            const trembleX = Math.sin(time * 2.5 + node.y * 4) * trembleAmount;
            const trembleY = Math.cos(time * 2 + node.x * 6) * trembleAmount * 0.6;

            let baseX = node.x * w + mx + trembleX;
            let baseY = screenY + my + trembleY;
            
            let projected = { x: baseX, y: baseY, scale: 1, depth: node.z || 0 };
            if (enable3D) {
                projected = project3D(baseX, baseY, node.z || 0, centerX, centerY, rotationX);
            }

            let networkFade = 1;
            const pos = node.networkPosition || 0;
            if (pos < fadeStartZone) {
                networkFade = pos / fadeStartZone;
            } else if (pos > (1 - fadeEndZone)) {
                networkFade = (1 - pos) / fadeEndZone;
            }

            return {
                x: projected.x,
                y: projected.y,
                scale: projected.scale,
                depth: projected.depth,
                size: node.size,
                type: node.type,
                connections: node.connections,
                visible: projected.y > -200 && projected.y < h + 200,
                networkFade: Math.max(0, Math.min(1, networkFade))
            };
        });

        // Trier par profondeur pour le rendu correct
        const sortedIndices = screenNodes
            .map((node, idx) => ({ idx, depth: node.depth }))
            .sort((a, b) => a.depth - b.depth)
            .map(item => item.idx);

        // Dessiner les connexions
        ctx.lineCap = 'round';
        sortedIndices.forEach(i => {
            const node = screenNodes[i];
            const originalNode = networkNodes[i];
            originalNode.connections.forEach(conn => {
                const j = typeof conn === 'number' ? conn : conn.targetId;
                const revealThreshold = typeof conn === 'number' ? 0 : conn.revealProgress;
                const other = screenNodes[j];
                if (!other) return;
                if (!node.visible && !other.visible) return;
                
                // Facteur de révélation basé sur le scroll
                const revealFactor = Math.max(0, Math.min(1, (scrollProgress - revealThreshold) / 0.15));
                if (revealFactor < 0.01) return;

                const avgY = (node.y + other.y) / 2;
                const distFromCenter = Math.abs(avgY - h / 2) / (h / 2);
                let opacity = lineOpacity * (1 - distFromCenter * 0.5);
                const avgDepth = (node.depth + other.depth) / 2;
                opacity *= (0.6 + avgDepth * 0.4 + 0.4);
                opacity *= Math.min(node.networkFade, other.networkFade);
                opacity *= revealFactor;
                
                if (node.y < 0) opacity *= Math.max(0, 1 + node.y / 150);
                if (node.y > h) opacity *= Math.max(0, 1 - (node.y - h) / 150);
                if (other.y < 0) opacity *= Math.max(0, 1 + other.y / 150);
                if (other.y > h) opacity *= Math.max(0, 1 - (other.y - h) / 150);

                if (opacity < 0.01) return;

                const midX = (node.x + other.x) / 2 + Math.sin(time * 1.8 + i * 0.5) * 8;
                const midY = (node.y + other.y) / 2 + Math.cos(time * 1.5 + j * 0.3) * 6;

                const gradient = ctx.createLinearGradient(node.x, node.y, other.x, other.y);
                gradient.addColorStop(0, `rgba(212, 175, 55, ${opacity * 0.6})`);
                gradient.addColorStop(0.5, `rgba(240, 217, 181, ${opacity * 0.4})`);
                gradient.addColorStop(1, `rgba(212, 175, 55, ${opacity * 0.6})`);

                const lineWidth = (node.type === 'main' || other.type === 'main' ? 1.2 : 0.8) * ((node.scale + other.scale) / 2);

                ctx.strokeStyle = gradient;
                ctx.lineWidth = lineWidth;
                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.quadraticCurveTo(midX, midY, other.x, other.y);
                ctx.stroke();
            });
        });

        // Dessiner les nœuds
        sortedIndices.forEach(i => {
            const node = screenNodes[i];
            if (!node.visible) return;
            if (node.y < -80 || node.y > h + 80) return;

            const distFromCenter = Math.abs(node.y - h / 2) / (h / 2);
            let opacity = 0.75 * (1 - distFromCenter * 0.4);
            opacity *= (0.5 + node.depth * 0.5 + 0.5);
            opacity *= node.networkFade;
            
            if (node.y < 80) opacity *= node.y / 80;
            if (node.y > h - 80) opacity *= (h - node.y) / 80;
            
            opacity = Math.max(0, Math.min(1, opacity));
            if (opacity < 0.05) return;

            let pulseScale = 1;
            if (pulseEnabled && node.type === 'main') {
                pulseScale = 1 + Math.sin(time * pulseSpeed + i) * pulseIntensity;
            }

            const sizeMultiplier = node.scale * pulseScale;
            const displaySize = node.size * sizeMultiplier;

            // Glow
            const glowSize = displaySize * (node.type === 'main' ? 5 : 3.5);
            const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowSize);
            gradient.addColorStop(0, `rgba(212, 175, 55, ${opacity * 0.7})`);
            gradient.addColorStop(0.3, `rgba(240, 217, 181, ${opacity * 0.3})`);
            gradient.addColorStop(0.6, `rgba(212, 175, 55, ${opacity * 0.15})`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.fillStyle = `rgba(255, 248, 230, ${opacity * 0.9})`;
            ctx.beginPath();
            ctx.arc(node.x, node.y, displaySize, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // ==================== ANIMATION LOOP ====================
    
    function animate() {
        if (!state.isRunning) return;
        state.time += 0.016;
        state.scrollProgress = state.maxScroll > 0 ? state.scrollY / state.maxScroll : 0;
        state.smoothMouseX += (state.mouseX - state.smoothMouseX) * CONFIG.mouse.smoothing;
        state.smoothMouseY += (state.mouseY - state.smoothMouseY) * CONFIG.mouse.smoothing;
        drawStars();
        drawNetwork();
        document.getElementById('nav').classList.toggle('scrolled', state.scrollY > 100);
        requestAnimationFrame(animate);
    }

    // ==================== EVENT LISTENERS ====================
    
    window.addEventListener('scroll', () => { 
        state.scrollY = window.scrollY; 
    }, { passive: true });
    
    window.addEventListener('resize', () => { 
        resize(); 
        initNetwork(); 
    });
    
    document.addEventListener('mousemove', e => {
        state.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        state.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
    
    document.addEventListener('visibilitychange', () => {
        state.isRunning = !document.hidden;
        if (state.isRunning) animate();
    });

    // ==================== NAVIGATION ====================
    
    function initNav() {
        const nav = document.getElementById('nav');
        const burger = document.getElementById('burger');
        const navLinks = document.getElementById('navLinks');
        
        setTimeout(() => nav.classList.add('visible'), 1500);
        
        burger?.addEventListener('click', () => navLinks.classList.toggle('active'));
        
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                document.querySelector(link.getAttribute('href'))?.scrollIntoView({ 
                    behavior: 'smooth' 
                });
                navLinks.classList.remove('active');
            });
        });
    }

    // ==================== REVEAL ANIMATIONS ====================
    
    function initReveal() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => { 
                if (e.isIntersecting) e.target.classList.add('visible'); 
            });
        }, { 
            threshold: 0.15, 
            rootMargin: '0px 0px -50px 0px' 
        });
        
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    // ==================== INITIALIZATION ====================
    
    function init() {
        resize();
        initStars();
        initNetwork();
        initNav();
        initReveal();
        animate();
        console.log('🚀 AIXELLENCE - Neural Network Animation Active');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
