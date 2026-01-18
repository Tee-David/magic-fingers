/**
 * Gesture-Based 3D Particle System
 * Real-time hand tracking with 25+ particle patterns
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============================================
// PROTOCOL CHECK (Security Requirement)
// ============================================
const isLocalFile = window.location.protocol === 'file:';
if (isLocalFile) {
    const warning = document.createElement('div');
    warning.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; padding: 20px;
        background: #ff006e; color: white; text-align: center; z-index: 9999;
        font-family: inherit; font-size: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    warning.innerHTML = `
        <strong>⚠️ Security Restriction:</strong> Browsers block camera & modules on <code>file://</code> URLs. 
        Please run <strong>start.bat</strong> or use a local server (e.g., <code>npx serve</code>).
    `;
    document.body.prepend(warning);
}

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    particleCount: 30000,
    particleSize: 1.2,
    baseColor: new THREE.Color(0x00d4ff),
    morphSpeed: 1.5, // Seconds for a full morph
    rotationSpeed: 0.002,
    gestureSmoothing: 0.1,
    dispersionMultiplier: 4.0
};

// ============================================
// PATTERN DEFINITIONS (25+ patterns)
// ============================================
const PATTERNS = {
    // Basic Shapes
    sphere: (i, total) => {
        const phi = Math.acos(-1 + (2 * i) / total);
        const theta = Math.sqrt(total * Math.PI) * phi;
        const r = 5;
        return new THREE.Vector3(
            r * Math.cos(theta) * Math.sin(phi),
            r * Math.sin(theta) * Math.sin(phi),
            r * Math.cos(phi)
        );
    },

    cube: (i, total) => {
        const size = 8;
        const perSide = Math.cbrt(total);
        const x = ((i % perSide) / perSide - 0.5) * size;
        const y = ((Math.floor(i / perSide) % perSide) / perSide - 0.5) * size;
        const z = ((Math.floor(i / (perSide * perSide))) / perSide - 0.5) * size;
        return new THREE.Vector3(x, y, z);
    },

    torus: (i, total) => {
        const R = 4, r = 1.5;
        const u = (i / total) * Math.PI * 2 * 8;
        const v = ((i * 13) % total / total) * Math.PI * 2;
        return new THREE.Vector3(
            (R + r * Math.cos(v)) * Math.cos(u),
            (R + r * Math.cos(v)) * Math.sin(u),
            r * Math.sin(v)
        );
    },

    // Complex Shapes
    spiral: (i, total) => {
        const t = (i / total) * 20;
        const r = t * 0.3;
        return new THREE.Vector3(
            r * Math.cos(t * 2),
            (i / total - 0.5) * 10,
            r * Math.sin(t * 2)
        );
    },

    heart: (i, total) => {
        const t = (i / total) * Math.PI * 2;
        const s = ((i * 7) % total / total);
        const scale = 0.4 + s * 0.6;
        const x = 16 * Math.pow(Math.sin(t), 3) * scale * 0.3;
        const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale * 0.3;
        const z = (Math.random() - 0.5) * 2 * scale;
        return new THREE.Vector3(x, y, z);
    },

    galaxy: (i, total) => {
        const arms = 3;
        const arm = i % arms;
        const posInArm = Math.floor(i / arms) / (total / arms);
        const angle = arm * (Math.PI * 2 / arms) + posInArm * 4;
        const r = posInArm * 7;
        const spread = posInArm * 1.5;
        return new THREE.Vector3(
            r * Math.cos(angle) + (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread * 0.3,
            r * Math.sin(angle) + (Math.random() - 0.5) * spread
        );
    },

    dna: (i, total) => {
        const t = (i / total) * Math.PI * 8;
        const strand = i % 2;
        const r = 2;
        const offset = strand * Math.PI;
        return new THREE.Vector3(
            r * Math.cos(t + offset),
            (i / total - 0.5) * 15,
            r * Math.sin(t + offset)
        );
    },

    tornado: (i, total) => {
        const height = (i / total) * 12 - 6;
        const radius = (1 - Math.abs(height) / 6) * 4 + 0.5;
        const angle = (i / total) * Math.PI * 20 + height;
        return new THREE.Vector3(
            radius * Math.cos(angle),
            height,
            radius * Math.sin(angle)
        );
    },

    pyramid: (i, total) => {
        const level = Math.floor(Math.sqrt(i / total) * 10);
        const size = 8 - level * 0.8;
        const y = level * 0.8 - 4;
        const angle = (i * 2.39996) % (Math.PI * 2);
        const r = Math.random() * size;
        return new THREE.Vector3(
            r * Math.cos(angle),
            y,
            r * Math.sin(angle)
        );
    },

    cylinder: (i, total) => {
        const angle = (i / total) * Math.PI * 40;
        const height = ((i * 17) % total / total - 0.5) * 10;
        const r = 3;
        return new THREE.Vector3(
            r * Math.cos(angle),
            height,
            r * Math.sin(angle)
        );
    },

    cone: (i, total) => {
        const t = i / total;
        const height = t * 10 - 5;
        const radius = (1 - t) * 4;
        const angle = i * 2.39996;
        return new THREE.Vector3(
            radius * Math.cos(angle),
            height,
            radius * Math.sin(angle)
        );
    },

    trefoilKnot: (i, total) => {
        const t = (i / total) * Math.PI * 2;
        const scale = 2;
        return new THREE.Vector3(
            scale * (Math.sin(t) + 2 * Math.sin(2 * t)),
            scale * (Math.cos(t) - 2 * Math.cos(2 * t)),
            scale * (-Math.sin(3 * t))
        );
    },

    torusKnot: (i, total) => {
        const p = 2, q = 3;
        const t = (i / total) * Math.PI * 2 * 3;
        const r = 0.5 * (2 + Math.cos(q * t));
        return new THREE.Vector3(
            r * Math.cos(p * t) * 2.5,
            r * Math.sin(p * t) * 2.5,
            -Math.sin(q * t) * 2
        );
    },

    star: (i, total) => {
        const points = 5;
        const angle = (i / total) * Math.PI * 2 * points;
        const r = 3 + 2 * Math.sin(angle * 2.5);
        const layer = Math.floor((i * 7) % 5) / 5;
        return new THREE.Vector3(
            r * Math.cos(angle),
            (layer - 0.5) * 4,
            r * Math.sin(angle)
        );
    },

    explosion: (i, total) => {
        const phi = Math.acos(-1 + (2 * i) / total);
        const theta = Math.sqrt(total * Math.PI) * phi;
        const r = 2 + Math.random() * 5;
        return new THREE.Vector3(
            r * Math.cos(theta) * Math.sin(phi),
            r * Math.sin(theta) * Math.sin(phi),
            r * Math.cos(phi)
        );
    },

    wave: (i, total) => {
        const gridSize = Math.sqrt(total);
        const x = (i % gridSize) / gridSize * 16 - 8;
        const z = Math.floor(i / gridSize) / gridSize * 16 - 8;
        const y = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 3;
        return new THREE.Vector3(x, y, z);
    },

    ripple: (i, total) => {
        const gridSize = Math.sqrt(total);
        const x = (i % gridSize) / gridSize * 16 - 8;
        const z = Math.floor(i / gridSize) / gridSize * 16 - 8;
        const dist = Math.sqrt(x * x + z * z);
        const y = Math.sin(dist * 1.5) * 2 * Math.exp(-dist * 0.1);
        return new THREE.Vector3(x, y, z);
    },

    butterfly: (i, total) => {
        const t = (i / total) * Math.PI * 12;
        const r = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) + Math.pow(Math.sin(t / 12), 5);
        return new THREE.Vector3(
            Math.sin(t) * r * 1.5,
            Math.cos(t) * r * 1.5,
            (Math.random() - 0.5) * 2
        );
    },

    rose: (i, total) => {
        const k = 5;
        const theta = (i / total) * Math.PI * 6;
        const r = 5 * Math.cos(k * theta);
        const layer = ((i * 3) % total / total);
        return new THREE.Vector3(
            r * Math.cos(theta),
            (layer - 0.5) * 3,
            r * Math.sin(theta)
        );
    },

    atom: (i, total) => {
        const orbits = 3;
        const orbit = i % orbits;
        const angle = (i / total) * Math.PI * 2 * 10;
        const r = 4;
        const tilt = orbit * (Math.PI / 3);

        if (i < total * 0.1) {
            // Nucleus
            return new THREE.Vector3(
                (Math.random() - 0.5) * 1.5,
                (Math.random() - 0.5) * 1.5,
                (Math.random() - 0.5) * 1.5
            );
        }

        return new THREE.Vector3(
            r * Math.cos(angle),
            r * Math.sin(angle) * Math.cos(tilt),
            r * Math.sin(angle) * Math.sin(tilt)
        );
    },

    vortex: (i, total) => {
        const t = i / total;
        const angle = t * Math.PI * 10;
        const r = t * 6;
        const height = Math.sin(t * Math.PI) * 8 - 4;
        return new THREE.Vector3(
            r * Math.cos(angle),
            height,
            r * Math.sin(angle)
        );
    },

    shell: (i, total) => {
        const t = (i / total) * Math.PI * 6;
        const a = 0.2, b = 0.1;
        const r = a * Math.exp(b * t);
        return new THREE.Vector3(
            r * Math.cos(t),
            r * Math.sin(t),
            t * 0.3 - 3
        );
    },

    infinity: (i, total) => {
        const t = (i / total) * Math.PI * 2;
        const scale = 4;
        const layer = ((i * 5) % total / total - 0.5) * 2;
        return new THREE.Vector3(
            scale * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t)),
            layer,
            scale * Math.sin(t) * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t))
        );
    },

    brain: (i, total) => {
        const u = (i / total) * Math.PI * 2;
        const v = ((i * 7) % total / total) * Math.PI;
        const r = 4 + Math.sin(u * 8) * 0.5 + Math.sin(v * 6) * 0.3;
        return new THREE.Vector3(
            r * Math.sin(v) * Math.cos(u),
            r * Math.cos(v),
            r * Math.sin(v) * Math.sin(u)
        );
    },

    diamond: (i, total) => {
        const t = i / total;
        let y, radius;
        if (t < 0.5) {
            y = t * 10 - 2.5;
            radius = t * 2 * 4;
        } else {
            y = (1 - t) * 10 - 2.5 + 5;
            radius = (1 - t) * 2 * 4;
        }
        const angle = i * 2.39996;
        return new THREE.Vector3(
            radius * Math.cos(angle),
            y,
            radius * Math.sin(angle)
        );
    },

    cloud: (i, total) => {
        const cluster = Math.floor(i / (total / 5));
        const centers = [
            { x: 0, y: 0, z: 0 },
            { x: 3, y: 1, z: 0 },
            { x: -3, y: 0.5, z: 1 },
            { x: 1.5, y: -0.5, z: -2 },
            { x: -1.5, y: 1.5, z: 2 }
        ];
        const c = centers[cluster] || centers[0];
        const spread = 2.5;
        return new THREE.Vector3(
            c.x + (Math.random() - 0.5) * spread,
            c.y + (Math.random() - 0.5) * spread * 0.5,
            c.z + (Math.random() - 0.5) * spread
        );
    },

    lightning: (i, total) => {
        const branch = Math.floor(i / (total / 5));
        const t = (i % (total / 5)) / (total / 5);
        const baseAngle = branch * (Math.PI * 2 / 5);
        const jitter = (Math.random() - 0.5) * t * 3;
        return new THREE.Vector3(
            Math.sin(baseAngle) * t * 6 + jitter,
            5 - t * 10,
            Math.cos(baseAngle) * t * 6 + jitter
        );
    },

    snowflake: (i, total) => {
        const arms = 6;
        const arm = i % arms;
        const posInArm = Math.floor(i / arms) / (total / arms);
        const angle = arm * (Math.PI * 2 / arms);
        const branchAngle = angle + (Math.floor(posInArm * 3) % 2 === 0 ? 0.3 : -0.3) * posInArm;
        const r = posInArm * 5;
        return new THREE.Vector3(
            r * Math.cos(branchAngle),
            (Math.random() - 0.5) * 0.5,
            r * Math.sin(branchAngle)
        );
    },

    orbit: (i, total) => {
        const satellites = 4;
        const sat = i % satellites;
        const mainOrbit = (i / total) * Math.PI * 2;

        if (i < total * 0.15) {
            // Central body
            const r = Math.random() * 1.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            return new THREE.Vector3(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            );
        }

        const orbitRadius = 3 + sat * 1.5;
        const tilt = sat * 0.3;
        return new THREE.Vector3(
            orbitRadius * Math.cos(mainOrbit + sat),
            orbitRadius * Math.sin(mainOrbit + sat) * Math.sin(tilt),
            orbitRadius * Math.sin(mainOrbit + sat) * Math.cos(tilt)
        );
    }
};

// Pattern list for UI
const PATTERN_LIST = Object.keys(PATTERNS);

// ============================================
// GESTURE DETECTION
// ============================================
class GestureDetector {
    constructor() {
        this.handOpenness = 0.5;
        this.targetOpenness = 0.5;
        this.handRotation = 0;
        this.targetRotation = 0;
        this.handPosition = { x: 0.5, y: 0.5 };
        this.targetPosition = { x: 0.5, y: 0.5 };
        this.pinchStrength = 0;
        this.targetPinch = 0;
        this.handPresent = false;
        this.swipeDirection = null;
        this.lastWristX = 0.5;
        this.gestureHistory = [];
        this.twoHandsPresent = false;
        this.handsDistance = 0;
        this.targetHandsDistance = 0;
    }

    processResults(results) {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            this.handPresent = true;
            this.twoHandsPresent = results.multiHandLandmarks.length >= 2;

            const landmarks = results.multiHandLandmarks[0];

            // Calculate hand openness (fingers extended vs closed)
            this.targetOpenness = this.calculateOpenness(landmarks);

            // Calculate hand rotation
            this.targetRotation = this.calculateRotation(landmarks);

            // Calculate hand position (normalized 0-1)
            const wrist = landmarks[0];
            this.targetPosition = { x: wrist.x, y: wrist.y };

            // Calculate pinch strength (thumb to index distance)
            this.targetPinch = this.calculatePinch(landmarks);

            // Detect swipe
            this.detectSwipe(wrist.x);

            // Two-hand distance for zoom
            if (this.twoHandsPresent) {
                const hand1 = results.multiHandLandmarks[0][0];
                const hand2 = results.multiHandLandmarks[1][0];
                this.targetHandsDistance = Math.sqrt(
                    Math.pow(hand1.x - hand2.x, 2) +
                    Math.pow(hand1.y - hand2.y, 2)
                );
            }
        } else {
            this.handPresent = false;
            this.targetOpenness = 0.5;
            this.swipeDirection = null;
        }

        // Smooth values
        this.handOpenness += (this.targetOpenness - this.handOpenness) * CONFIG.gestureSmoothing;
        this.handRotation += (this.targetRotation - this.handRotation) * CONFIG.gestureSmoothing;
        this.handPosition.x += (this.targetPosition.x - this.handPosition.x) * CONFIG.gestureSmoothing;
        this.handPosition.y += (this.targetPosition.y - this.handPosition.y) * CONFIG.gestureSmoothing;
        this.pinchStrength += (this.targetPinch - this.pinchStrength) * CONFIG.gestureSmoothing;
        this.handsDistance += (this.targetHandsDistance - this.handsDistance) * CONFIG.gestureSmoothing;
    }

    calculateOpenness(landmarks) {
        // Calculate average finger extension
        const fingerTips = [8, 12, 16, 20]; // Index, middle, ring, pinky tips
        const fingerBases = [5, 9, 13, 17]; // MCP joints
        const palm = landmarks[0]; // Wrist

        let totalExtension = 0;

        for (let i = 0; i < fingerTips.length; i++) {
            const tip = landmarks[fingerTips[i]];
            const base = landmarks[fingerBases[i]];

            const tipDist = Math.sqrt(
                Math.pow(tip.x - palm.x, 2) +
                Math.pow(tip.y - palm.y, 2) +
                Math.pow(tip.z - palm.z, 2)
            );

            const baseDist = Math.sqrt(
                Math.pow(base.x - palm.x, 2) +
                Math.pow(base.y - palm.y, 2) +
                Math.pow(base.z - palm.z, 2)
            );

            totalExtension += tipDist / (baseDist + 0.001);
        }

        // Thumb extension
        const thumb = landmarks[4];
        const thumbBase = landmarks[2];
        const thumbExt = Math.sqrt(
            Math.pow(thumb.x - thumbBase.x, 2) +
            Math.pow(thumb.y - thumbBase.y, 2)
        );
        totalExtension += thumbExt * 5;

        // Normalize to 0-1
        return Math.min(1, Math.max(0, (totalExtension - 2) / 4));
    }

    calculateRotation(landmarks) {
        const wrist = landmarks[0];
        const middleMCP = landmarks[9];

        // Angle from wrist to middle finger base
        return Math.atan2(middleMCP.x - wrist.x, middleMCP.y - wrist.y);
    }

    calculatePinch(landmarks) {
        const thumb = landmarks[4];
        const index = landmarks[8];

        const distance = Math.sqrt(
            Math.pow(thumb.x - index.x, 2) +
            Math.pow(thumb.y - index.y, 2) +
            Math.pow(thumb.z - index.z, 2)
        );

        // Smaller distance = stronger pinch
        return Math.max(0, 1 - distance * 5);
    }

    detectSwipe(currentX) {
        const threshold = 0.15;
        const diff = currentX - this.lastWristX;

        if (Math.abs(diff) > threshold) {
            this.swipeDirection = diff > 0 ? 'right' : 'left';
            this.lastWristX = currentX;
        } else {
            this.swipeDirection = null;
        }
    }

    getGestureState() {
        return {
            openness: this.handOpenness,
            rotation: this.handRotation,
            position: this.handPosition,
            pinch: this.pinchStrength,
            present: this.handPresent,
            swipe: this.swipeDirection,
            twoHands: this.twoHandsPresent,
            handsDistance: this.handsDistance
        };
    }

    getGestureLabel() {
        if (!this.handPresent) return 'No hand detected';

        if (this.pinchStrength > 0.7) return '🤏 Pinch';
        if (this.handOpenness > 0.8) return '✋ Open Hand - Expand';
        if (this.handOpenness < 0.2) return '✊ Closed Fist - Contract';
        if (Math.abs(this.handRotation) > 1.2) return '🔄 Rotating';
        if (this.twoHandsPresent) return '🙌 Two Hands - Zoom';

        return '👋 Hand Tracking';
    }
}

// ============================================
// PARTICLE SYSTEM
// ============================================
class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.count = CONFIG.particleCount;
        this.currentPattern = 'sphere';
        this.morphStartTime = 0;

        this.createParticles();
        this.setPattern('sphere');
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.count * 3);
        const sourcePositions = new Float32Array(this.count * 3);
        const targetPositions = new Float32Array(this.count * 3);
        const randomValues = new Float32Array(this.count * 3);
        const colors = new Float32Array(this.count * 3);
        const sizes = new Float32Array(this.count);

        for (let i = 0; i < this.count; i++) {
            // Random initial jitter
            randomValues[i * 3] = Math.random();
            randomValues[i * 3 + 1] = Math.random();
            randomValues[i * 3 + 2] = Math.random();

            colors[i * 3] = CONFIG.baseColor.r;
            colors[i * 3 + 1] = CONFIG.baseColor.g;
            colors[i * 3 + 2] = CONFIG.baseColor.b;

            sizes[i] = CONFIG.particleSize * (0.8 + Math.random() * 0.4);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('sourcePosition', new THREE.BufferAttribute(sourcePositions, 3));
        geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targetPositions, 3));
        geometry.setAttribute('randomValue', new THREE.BufferAttribute(randomValues, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                morphFactor: { value: 0 },
                dispersion: { value: 0 },
                pinch: { value: 0 },
                zoom: { value: 1 },
                pixelRatio: { value: window.devicePixelRatio },
                baseColor: { value: CONFIG.baseColor }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                attribute vec3 sourcePosition;
                attribute vec3 targetPosition;
                attribute vec3 randomValue;
                
                varying vec3 vColor;
                varying float vAlpha;
                
                uniform float time;
                uniform float morphFactor;
                uniform float dispersion;
                uniform float pinch;
                uniform float zoom;
                uniform float pixelRatio;
                
                void main() {
                    vColor = color;
                    
                    // Simple easing for morph
                    float t = smoothstep(0.0, 1.0, morphFactor);
                    vec3 pos = mix(sourcePosition, targetPosition, t);
                    
                    // Dispersion (Open Hand)
                    pos *= (1.0 + dispersion * 0.5);
                    
                    // Jitter / Noise
                    pos.x += sin(time * 2.0 + randomValue.x * 10.0) * 0.05;
                    pos.y += cos(time * 1.5 + randomValue.y * 10.0) * 0.05;
                    pos.z += sin(time * 1.8 + randomValue.z * 10.0) * 0.05;
                    
                    // Pinch
                    if (pinch > 0.1) {
                        pos *= (1.0 - pinch * 0.7);
                    }
                    
                    // Zoom
                    pos *= zoom;
                    
                    vAlpha = 0.6 + sin(time + randomValue.x * 6.28) * 0.3;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * pixelRatio * (400.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
                    vec3 finalColor = vColor * (1.2 + glow * 0.8);
                    
                    gl_FragColor = vec4(finalColor, vAlpha * glow);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    setPattern(patternName) {
        if (!PATTERNS[patternName]) return;

        this.currentPattern = patternName;
        const patternFn = PATTERNS[patternName];

        // Move current targets to source
        const sourcePositions = this.particles.geometry.attributes.sourcePosition.array;
        const targetPositions = this.particles.geometry.attributes.targetPosition.array;

        // First, copy current interpolated positions to source to ensure smooth transition from anywhere
        // Actually, for simplicity and stability, we'll just copy current targets
        for (let i = 0; i < targetPositions.length; i++) {
            sourcePositions[i] = targetPositions[i];
        }

        // Generate new targets
        for (let i = 0; i < this.count; i++) {
            const pos = patternFn(i, this.count);
            targetPositions[i * 3] = pos.x;
            targetPositions[i * 3 + 1] = pos.y;
            targetPositions[i * 3 + 2] = pos.z;
        }

        this.particles.geometry.attributes.sourcePosition.needsUpdate = true;
        this.particles.geometry.attributes.targetPosition.needsUpdate = true;

        this.morphStartTime = performance.now() * 0.001;
    }

    setColor(color) {
        const threeColor = new THREE.Color(color);
        CONFIG.baseColor.copy(threeColor);

        const colors = this.particles.geometry.attributes.color.array;

        for (let i = 0; i < this.count; i++) {
            // Add slight color variation
            const hsl = {};
            threeColor.getHSL(hsl);
            const variation = new THREE.Color().setHSL(
                hsl.h + (Math.random() - 0.5) * 0.1,
                hsl.s,
                hsl.l + (Math.random() - 0.5) * 0.2
            );

            colors[i * 3] = variation.r;
            colors[i * 3 + 1] = variation.g;
            colors[i * 3 + 2] = variation.b;
        }

        this.particles.geometry.attributes.color.needsUpdate = true;
    }

    setParticleSize(size) {
        CONFIG.particleSize = size;
        const sizes = this.particles.geometry.attributes.size.array;

        for (let i = 0; i < this.count; i++) {
            sizes[i] = size * (0.5 + Math.random() * 0.5);
        }

        this.particles.geometry.attributes.size.needsUpdate = true;
    }

    updateParticleCount(newCount) {
        // For simplicity, we'll just update the visible range
        // Full implementation would recreate the geometry
        this.count = Math.min(newCount, CONFIG.particleCount);
    }

    update(gesture, deltaTime) {
        const time = performance.now() * 0.001;

        // Update Uniforms
        const uniforms = this.particles.material.uniforms;
        uniforms.time.value = time;

        // Morph Factor
        const elapsed = time - this.morphStartTime;
        uniforms.morphFactor.value = Math.min(1.0, elapsed / CONFIG.morphSpeed);

        // Gesture effects
        uniforms.dispersion.value = (gesture.openness - 0.5) * 2 * CONFIG.dispersionMultiplier;
        uniforms.pinch.value = gesture.pinch;

        // Two-hand zoom
        uniforms.zoom.value = gesture.twoHands ? gesture.handsDistance * 4 : 1;

        // Rotate based on hand rotation
        if (gesture.present) {
            this.particles.rotation.y += gesture.rotation * 0.05;
        } else {
            this.particles.rotation.y += CONFIG.rotationSpeed;
        }

        this.particles.rotation.x = Math.sin(time * 0.2) * 0.1;
        this.particles.rotation.z = Math.cos(time * 0.15) * 0.05;
    }
}

// ============================================
// MAIN APPLICATION
// ============================================
class App {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.initHandTracking();
        this.animate();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0f);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 20;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enablePan = false;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 50;

        // Particle System
        this.particleSystem = new ParticleSystem(this.scene);

        // Gesture Detector
        this.gestureDetector = new GestureDetector();

        // Clock
        this.clock = new THREE.Clock();

        // Add ambient particles/stars
        this.addBackgroundStars();
    }

    addBackgroundStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(2000 * 3);

        for (let i = 0; i < 2000; i++) {
            starPositions[i * 3] = (Math.random() - 0.5) * 200;
            starPositions[i * 3 + 1] = (Math.random() - 0.5) * 200;
            starPositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.6
        });

        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.stars);
    }

    async initHandTracking() {
        const video = document.getElementById('webcam');
        const webcamCanvas = document.getElementById('webcam-canvas');
        const ctx = webcamCanvas.getContext('2d');

        try {
            // Initialize MediaPipe Hands
            const hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`;
                }
            });

            hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.5
            });

            hands.onResults((results) => {
                // Draw to preview canvas
                webcamCanvas.width = video.videoWidth || 320;
                webcamCanvas.height = video.videoHeight || 240;
                ctx.save();
                ctx.clearRect(0, 0, webcamCanvas.width, webcamCanvas.height);
                ctx.drawImage(results.image, 0, 0, webcamCanvas.width, webcamCanvas.height);

                // Draw hand landmarks
                if (results.multiHandLandmarks) {
                    for (const landmarks of results.multiHandLandmarks) {
                        this.drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#00d4ff', lineWidth: 2 });
                        this.drawLandmarks(ctx, landmarks, { color: '#ff006e', radius: 3 });
                    }
                }
                ctx.restore();

                // Process gestures
                this.gestureDetector.processResults(results);

                // Update gesture label
                document.getElementById('gesture-text').textContent =
                    this.gestureDetector.getGestureLabel();
            });

            // Hand connections for visualization
            const HAND_CONNECTIONS = [
                [0, 1], [1, 2], [2, 3], [3, 4],
                [0, 5], [5, 6], [6, 7], [7, 8],
                [0, 9], [9, 10], [10, 11], [11, 12],
                [0, 13], [13, 14], [14, 15], [15, 16],
                [0, 17], [17, 18], [18, 19], [19, 20],
                [5, 9], [9, 13], [13, 17]
            ];

            // Initialize camera
            const camera = new Camera(video, {
                onFrame: async () => {
                    await hands.send({ image: video });
                },
                width: 640,
                height: 480
            });

            await camera.start();

            // Hide loading overlay
            document.getElementById('loading-overlay').classList.add('hidden');

        } catch (error) {
            console.error('Error initializing hand tracking:', error);
            const statusBox = document.getElementById('loading-overlay');
            statusBox.style.background = 'rgba(20, 0, 0, 0.9)';
            statusBox.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 40px; margin-bottom: 20px;">⚠️</div>
                    <p style="color: #ff006e; font-weight: bold; font-size: 18px; margin-bottom: 10px;">Camera Access Failed</p>
                    <p style="color: rgba(255,255,255,0.8); margin-bottom: 20px;">${error.message || 'Access denied or insecure origin'}</p>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="window.location.reload()" style="padding: 10px 20px; border-radius: 8px; border: none; background: #00d4ff; color: white; cursor: pointer;">Retry</button>
                    </div>
                </div>
            `;
        }
    }

    drawConnectors(ctx, landmarks, connections, style) {
        ctx.strokeStyle = style.color;
        ctx.lineWidth = style.lineWidth;
        ctx.lineCap = 'round';

        for (const [start, end] of connections) {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];

            ctx.beginPath();
            ctx.moveTo(startPoint.x * ctx.canvas.width, startPoint.y * ctx.canvas.height);
            ctx.lineTo(endPoint.x * ctx.canvas.width, endPoint.y * ctx.canvas.height);
            ctx.stroke();
        }
    }

    drawLandmarks(ctx, landmarks, style) {
        ctx.fillStyle = style.color;

        for (const landmark of landmarks) {
            ctx.beginPath();
            ctx.arc(
                landmark.x * ctx.canvas.width,
                landmark.y * ctx.canvas.height,
                style.radius,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.particleSystem.particles.material.uniforms.pixelRatio.value =
                Math.min(window.devicePixelRatio, 2);
        });

        // Pattern buttons
        document.querySelectorAll('.pattern-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.particleSystem.setPattern(btn.dataset.pattern);
            });
        });

        // Color picker
        document.getElementById('color-picker').addEventListener('input', (e) => {
            this.particleSystem.setColor(e.target.value);
            document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('active'));
        });

        // Color presets
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                document.getElementById('color-picker').value = color;
                this.particleSystem.setColor(color);
                document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
            });
        });

        // Particle count slider
        document.getElementById('particle-count').addEventListener('input', (e) => {
            const count = parseInt(e.target.value);
            document.getElementById('particle-count-value').textContent = count.toLocaleString();
            this.particleSystem.updateParticleCount(count);
        });

        // Particle size slider
        document.getElementById('particle-size').addEventListener('input', (e) => {
            const size = parseFloat(e.target.value);
            document.getElementById('particle-size-value').textContent = size;
            this.particleSystem.setParticleSize(size);
        });

        // Panel toggle (desktop)
        document.getElementById('toggle-panel').addEventListener('click', () => {
            document.getElementById('control-panel').classList.toggle('collapsed');
        });

        // Mobile panel toggle
        const mobileToggle = document.getElementById('mobile-panel-toggle');
        const controlPanel = document.getElementById('control-panel');

        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                controlPanel.classList.toggle('mobile-open');
            });

            // Close panel when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 576) {
                    if (!controlPanel.contains(e.target) &&
                        !mobileToggle.contains(e.target) &&
                        controlPanel.classList.contains('mobile-open')) {
                        controlPanel.classList.remove('mobile-open');
                    }
                }
            });

            // Swipe down to close panel on mobile
            let touchStartY = 0;
            controlPanel.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
            }, { passive: true });

            controlPanel.addEventListener('touchend', (e) => {
                const touchEndY = e.changedTouches[0].clientY;
                const diff = touchEndY - touchStartY;

                if (diff > 50 && window.innerWidth <= 576) {
                    controlPanel.classList.remove('mobile-open');
                }
            }, { passive: true });
        }

        // Help button - show instructions
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                document.getElementById('instructions').classList.remove('hidden');
            });
        }

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }, 100);
        });

        // Fullscreen
        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                document.getElementById('fullscreen-icon').style.display = 'none';
                document.getElementById('exit-fullscreen-icon').style.display = 'block';
            } else {
                document.exitFullscreen();
                document.getElementById('fullscreen-icon').style.display = 'block';
                document.getElementById('exit-fullscreen-icon').style.display = 'none';
            }
        });

        document.addEventListener('fullscreenchange', () => {
            const isFullscreen = !!document.fullscreenElement;
            document.getElementById('fullscreen-icon').style.display = isFullscreen ? 'none' : 'block';
            document.getElementById('exit-fullscreen-icon').style.display = isFullscreen ? 'block' : 'none';
        });

        // Instructions close
        document.getElementById('close-instructions').addEventListener('click', () => {
            document.getElementById('instructions').classList.add('hidden');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'f' || e.key === 'F') {
                document.getElementById('fullscreen-btn').click();
            }
            if (e.key === 'Escape' && document.getElementById('instructions').classList.contains('hidden') === false) {
                document.getElementById('instructions').classList.add('hidden');
            }

            // Number keys for patterns
            const patternKeys = ['1', '2', '3', '4', '5', '6'];
            const patterns = ['sphere', 'cube', 'torus', 'spiral', 'heart', 'galaxy'];
            const keyIndex = patternKeys.indexOf(e.key);
            if (keyIndex !== -1) {
                document.querySelectorAll('.pattern-btn').forEach((btn, i) => {
                    btn.classList.toggle('active', i === keyIndex);
                });
                this.particleSystem.setPattern(patterns[keyIndex]);
            }
        });

        // Swipe detection for pattern change
        let lastSwipeTime = 0;
        setInterval(() => {
            const gesture = this.gestureDetector.getGestureState();
            const now = Date.now();

            if (gesture.swipe && now - lastSwipeTime > 500) {
                const buttons = Array.from(document.querySelectorAll('.pattern-btn'));
                const activeIndex = buttons.findIndex(b => b.classList.contains('active'));
                let newIndex;

                if (gesture.swipe === 'right') {
                    newIndex = (activeIndex + 1) % buttons.length;
                } else {
                    newIndex = (activeIndex - 1 + buttons.length) % buttons.length;
                }

                buttons.forEach((b, i) => b.classList.toggle('active', i === newIndex));
                this.particleSystem.setPattern(buttons[newIndex].dataset.pattern);
                lastSwipeTime = now;
            }
        }, 100);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();
        const gesture = this.gestureDetector.getGestureState();

        // Update particle system
        this.particleSystem.update(gesture, deltaTime);

        // Rotate background stars
        if (this.stars) {
            this.stars.rotation.y += 0.0001;
            this.stars.rotation.x += 0.00005;
        }

        // Update controls
        this.controls.update();

        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize app
const app = new App();
