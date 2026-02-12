import * as THREE from 'three';

// --- State ---
const state = {
    authenticated: false,
    userName: '',
    systemName: ''
};

// --- DOM Elements ---
const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const userNameInput = document.getElementById('user-name');
const systemNameInput = document.getElementById('system-name');
const sceneContainer = document.getElementById('scene-container');
const proposalOverlay = document.getElementById('proposal-overlay');
const proposalText = document.getElementById('proposal-text');
const noBtn = document.getElementById('no-btn');
const yesBtn = document.getElementById('yes-btn');
const audioControl = document.getElementById('audio-control');
const bgMusic = document.getElementById('bg-music');
const audioIcon = document.getElementById('audio-icon');

// --- Audio Logic ---
let isPlaying = false;
audioControl.addEventListener('click', () => {
    if (isPlaying) {
        bgMusic.pause();
        // Mute icon
        audioIcon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
    } else {
        bgMusic.play().then(() => {
            // Play icon
            audioIcon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
        }).catch(e => console.log("Audio play failed:", e));
    }
    isPlaying = !isPlaying;
});

// --- Three.js Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog = new THREE.FogExp2(0x050505, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
sceneContainer.appendChild(renderer.domElement);

// --- Content ---

// 1. Particle System (The "World")
// 1. Particle System (The "World") - Upgraded to Hearts
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1500; // Slightly fewer for performance with clearer movement
const posArray = new Float32Array(particlesCount * 3);
const velocityArray = new Float32Array(particlesCount * 3); // For movement

for (let i = 0; i < particlesCount * 3; i += 3) {
    // Spread particles in a large volume
    posArray[i] = (Math.random() - 0.5) * 60;
    posArray[i + 1] = (Math.random() - 0.5) * 60;
    posArray[i + 2] = (Math.random() - 0.5) * 60;

    // Slight upward drift
    velocityArray[i] = (Math.random() - 0.5) * 0.02;
    velocityArray[i + 1] = Math.random() * 0.05 + 0.01; // Up
    velocityArray[i + 2] = (Math.random() - 0.5) * 0.02;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Create a heart shape texture programmatically would be cool, but points are squares.
// We'll use color and movement to suggest "magic".
const material = new THREE.PointsMaterial({
    size: 0.15,
    color: 0xff9a9e, // Pinkish
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
});

const particlesMesh = new THREE.Points(particlesGeometry, material);
scene.add(particlesMesh);

// 2. Central "Core" (Visible after auth)
const coreGeometry = new THREE.IcosahedronGeometry(1, 1);
const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x00C9FF,
    emissiveIntensity: 0.5,
    roughness: 0.1,
    metalness: 0.8,
    wireframe: true
});
const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
coreMesh.position.set(0, 0, -2);
coreMesh.visible = true; // Always visible but acts as a focal point
scene.add(coreMesh);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// --- Interactions ---
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

// --- Animation Loop ---
const clock = new THREE.Clock();

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const uName = userNameInput.value.trim();
    const sName = systemNameInput.value.trim();

    if (uName && sName) {
        // Strict Validation: Shona & Chiku
        if (uName.toLowerCase() === 'shona' && sName.toLowerCase() === 'chiku') {
            state.userName = uName;
            state.systemName = sName;
            state.authenticated = true;

            // Transition: Hide Login, Show Question 1
            loginOverlay.classList.add('hidden');
            document.getElementById('question-overlay-1').classList.remove('hidden');

            console.log(`User: ${state.userName}, System: ${state.systemName} - Authenticated`);
        } else {
            // Invalid Credentials - Shake
            const panel = loginOverlay.querySelector('.glass-panel');
            panel.classList.add('shake');
            setTimeout(() => panel.classList.remove('shake'), 500);
            alert("That's not right... try again.");
        }
    }
});

// Question Navigation Logic
// 1. Submit Question Button Click
document.querySelectorAll('.submit-question-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const inputId = e.target.getAttribute('data-input');
        const input = document.getElementById(inputId);
        const correctVal = e.target.getAttribute('data-correct-val');
        const slide = e.target.closest('.glass-panel');
        const errorMsg = slide.querySelector('.error-msg');

        if (!input) return;

        const val = input.value.trim().toLowerCase();
        let isValid = false;

        if (val.length > 0) {
            if (correctVal === 'any') {
                isValid = true;
            } else {
                // Support multiple possible answers separated by '|'
                const possibilities = correctVal.split('|');
                // Check if the user input contains ANY of the possibilities
                isValid = possibilities.some(possibility => val.includes(possibility));
            }
        }

        if (isValid) {
            // Correct Answer: Hide Question, Show Quote
            const questionContent = slide.querySelector('.question-content');
            const quoteSection = slide.querySelector('.quote-section');
            if (errorMsg) errorMsg.classList.add('hidden');

            if (questionContent && quoteSection) {
                questionContent.classList.add('hidden-content');
                quoteSection.classList.remove('hidden-content');
            }
        } else {
            // Wrong Answer: Shake effect
            if (errorMsg) {
                errorMsg.classList.remove('hidden');
                errorMsg.classList.add('shake');
                setTimeout(() => errorMsg.classList.remove('shake'), 500);
            }
        }
    });
});

// 2. Continue Button Click
document.querySelectorAll('.continue-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const nextId = e.target.getAttribute('data-next');
        const currentSlide = e.target.closest('.question-slide');

        // Hide current slide
        currentSlide.classList.add('hidden');

        // Show next slide
        if (nextId) {
            const nextSlide = document.getElementById(nextId);
            if (nextSlide) {
                nextSlide.classList.remove('hidden');
            }

            // If entering proposal, ensure colors are set to intermediate state
            if (nextId === 'proposal-overlay') {
                material.color.setHex(0xFFFFFF); // White stars
                coreMaterial.emissive.setHex(0xFF0055); // Red glow
            }
        }
    });
});

// "No" Button Evasion Logic (Reverted to Fly Away)
noBtn.addEventListener('mouseover', () => {
    // Calculate random destination in 3D space
    const randomX = (Math.random() - 0.5) * 1000;
    const randomY = (Math.random() - 0.5) * 1000;
    const randomZ = -1000 - Math.random() * 2000;
    const randomRotate = (Math.random() - 0.5) * 720;

    noBtn.style.transform = `translate3d(${randomX}px, ${randomY}px, ${randomZ}px) rotate(${randomRotate}deg)`;
    noBtn.classList.add('fly-away');
});

// "Yes" Button Logic
// "Yes" Button Logic
yesBtn.addEventListener('click', () => {
    // Play music if not already playing
    if (!isPlaying) {
        bgMusic.play().then(() => {
            isPlaying = true;
            audioIcon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
        }).catch(e => console.log("Audio play failed on Yes:", e));
    }

    proposalOverlay.classList.add('hidden');

    // Celebrate!
    material.color.setHex(0xE91E63); // Pink/Red for love
    coreMaterial.emissive.setHex(0xE91E63);

    console.log("She said YES!");

    // Trigger Explosion
    explodeConfetti();

    // Start Gallery transition after a delay
    setTimeout(() => {
        initGallery();
    }, 3000); // 3 seconds to enjoy confetti
});

// Mouse movement
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

// --- Gallery "Walking" State ---
let controls;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// --- Gallery Data & State (Moved up to avoid ReferenceError in animate) ---
const mediaFiles = [
    "gallery_memory_01.jpg",
    "gallery_memory_02.jpg",
    "gallery_memory_03.png",
    "gallery_memory_04.jpg",
    "gallery_memory_05.jpg",
    "gallery_memory_06.jpg",
    "gallery_memory_07.jpg",
    "gallery_memory_08.jpeg",
    "gallery_memory_09.jpg",
    "gallery_memory_10.jpg",
    "gallery_memory_11.jpg",
    "gallery_memory_12.jpeg",
    "gallery_memory_13.jpeg",
    "gallery_memory_14.jpeg",
    "gallery_memory_15.jpeg",
    "gallery_memory_16.jpeg",
    "gallery_memory_17.jpeg",
    "gallery_memory_18.jpeg",
    "gallery_memory_19.jpeg",
    "gallery_memory_20.jpeg",
    "gallery_memory_21.jpeg",
    "gallery_memory_22.jpeg",
    "gallery_memory_23.jpeg",
    "gallery_memory_24.jpeg",
    "gallery_memory_25.jpeg",
    "gallery_memory_26.jpeg",
    "gallery_memory_27.jpeg",
    "gallery_memory_28.jpeg",
    "gallery_memory_29.jpeg",
    "gallery_memory_30.jpeg",
    "gallery_memory_31.jpeg",
    "gallery_memory_32.jpeg",
    "gallery_memory_33.jpeg",
    "gallery_memory_34.mp4",
    "gallery_memory_35.mp4"
];

const galleryData = mediaFiles.map((filename, i) => ({
    url: filename,
    date: `February ${i + 1}, 202${i % 6}`,
    location: i % 2 === 0 ? "Central Park" : "Our Favorite Cafe"
}));
const userMedia = galleryData.map(d => d.url);

let isGalleryActive = false;

// --- Gallery Data & State ---
let segments = []; // Stores the generated layout segments for collision detection

// Helper to check collision with gallery bounds
function checkCollision(position) {
    // Iterate through all generated segments
    // If the player is inside ANY segment, they are safe.
    // If they are outside ALL segments, collision detected.

    const margin = 1.5;

    for (const seg of segments) {
        // Apply margin ONLY if the side is NOT open
        // Default: all sides closed (apply margin)
        // If 'openSides' includes 'left', don't apply minX margin, etc.

        // Define sides: 'minX', 'maxX', 'minZ', 'maxZ'
        const open = seg.openSides || [];

        const minX = seg.bounds.minX + (open.includes('minX') ? -0.1 : margin);
        const maxX = seg.bounds.maxX - (open.includes('maxX') ? -0.1 : margin);
        const minZ = seg.bounds.minZ + (open.includes('minZ') ? -0.1 : margin);
        const maxZ = seg.bounds.maxZ - (open.includes('maxZ') ? -0.1 : margin);

        if (position.x >= minX && position.x <= maxX &&
            position.z >= minZ && position.z <= maxZ) {
            return true;
        }
    }
    return false;
}

function createVisitor(x, z, scene) {
    const geometry = new THREE.CapsuleGeometry(0.5, 1.8, 4, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5 });
    const visitor = new THREE.Mesh(geometry, material);
    visitor.position.set(x, 0.9, z);
    visitor.castShadow = true;

    // Simple head
    const headGeo = new THREE.SphereGeometry(0.4);
    const head = new THREE.Mesh(headGeo, material);
    head.position.y = 1.0;
    visitor.add(head);

    // Random rotation
    visitor.rotation.y = Math.random() * Math.PI * 2;
    scene.add(visitor);
}

// --- Procedural Generation Logic ---

function generateAndBuildGallery(scene, userMedia) {
    segments = []; // Reset
    const corridorWidth = 20;
    const corridorLength = 40; // Fits 4 images (2 per side)
    const wallHeight = 12;

    // Assets
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.8 });
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.1, metalness: 0.1 });
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x050505 });
    const textureLoader = new THREE.TextureLoader();
    const photoGeo = new THREE.PlaneGeometry(4, 3);
    const frameGeo = new THREE.BoxGeometry(4.2, 3.2, 0.1);

    // Helpers
    function buildBox(x, y, z, w, h, d, mat) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        mesh.position.set(x, y, z);
        if (mat !== ceilingMat) mesh.receiveShadow = true;
        scene.add(mesh);
        return mesh;
    }

    function placeArt(filename, x, y, z, rotY) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        group.rotation.y = rotY;

        let mediaMat;
        const fileExt = filename.split('.').pop().toLowerCase();
        if (['mp4', 'webm'].includes(fileExt)) {
            const video = document.createElement('video');
            video.src = encodeURI(`./${filename}`);
            video.crossOrigin = "anonymous";
            video.loop = true;
            video.muted = true;
            video.play();
            const videoTexture = new THREE.VideoTexture(video);
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;
            mediaMat = new THREE.MeshBasicMaterial({ map: videoTexture });
        } else {
            const texture = textureLoader.load(encodeURI(`./${filename}`));
            mediaMat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.4 });
        }

        const photo = new THREE.Mesh(photoGeo, mediaMat);
        photo.position.z = 0.06;

        const frame = new THREE.Mesh(frameGeo, new THREE.MeshStandardMaterial({ color: 0x080808 }));

        const spot = new THREE.SpotLight(0xffeeba, 20); // Intensity 20
        // Fix SpotLight position to be relative to the Frame/Group
        // Previously set to (0, 4, 4) world? No, local to group.
        // But group is rotated.
        spot.position.set(0, 2, 4);
        spot.target = photo;
        spot.angle = Math.PI / 4;
        spot.penumbra = 0.5;
        spot.distance = 15;
        spot.castShadow = false;

        group.add(frame);
        group.add(photo);
        group.add(spot);
        scene.add(group);
    }

    // 0. Build "Lobby" (Start Area)
    // Player starts at 0, 4, 15. The first corridor starts at 0, 0, 0 and goes North.
    // We need a segment from Z=0 to say Z=25.
    const lobbyWidth = 20;
    const lobbyLength = 25; // 0 to 25
    const lobbyCenterZ = 12.5;

    // Floor
    buildBox(0, -0.1, lobbyCenterZ, lobbyWidth, 0.2, lobbyLength, floorMat);
    // Ceiling
    buildBox(0, wallHeight, lobbyCenterZ, lobbyWidth, 0.2, lobbyLength, ceilingMat);
    // Left Wall
    buildBox(-10, wallHeight / 2, lobbyCenterZ, 1, wallHeight, lobbyLength, wallMat);
    // Right Wall
    buildBox(10, wallHeight / 2, lobbyCenterZ, 1, wallHeight, lobbyLength, wallMat);
    // Back Wall (Entrance)
    buildBox(0, wallHeight / 2, 25, lobbyWidth, wallHeight, 1, wallMat);

    // Register Lobby Collision
    // Lobby connects at Z=0 (minZ). So minZ is OPEN.
    segments.push({
        bounds: {
            minX: -10,
            maxX: 10,
            minZ: 0,
            maxZ: 25
        },
        openSides: ['minZ'] // Connects to North Corridor at 0
    });

    // State for generation
    let currentX = 0;
    let currentZ = 0;
    // Direction vector: 0=North(-Z), 1=East(+X), 2=South(+Z), 3=West(-X)
    let currentDirIdx = 0;

    // Process media in chunks of 4
    const chunkSize = 4;
    for (let i = 0; i < userMedia.length; i += chunkSize) {
        const chunk = userMedia.slice(i, i + chunkSize);

        // 1. Build Corridor
        // Determine dimensions based on direction
        let segW, segD;
        let moveX = 0, moveZ = 0;
        let centerX, centerZ;
        let openSides = [];

        // Calculate center position of this new corridor
        // Start is (currentX, currentZ) (which is the center of the previous connection/start)
        // But strictly, we want to extend FROM currentX, currentZ.
        // Let's treat (currentX, currentZ) as the *start edge* center.

        if (currentDirIdx === 0) { // North (-Z)
            segW = corridorWidth; segD = corridorLength;
            centerX = currentX;
            centerZ = currentZ - (corridorLength / 2);
            moveZ = -corridorLength;
            // North Corridor: Connects South (Start) and North (End)
            openSides = ['maxZ', 'minZ'];
        } else if (currentDirIdx === 1) { // East (+X)
            segW = corridorLength; segD = corridorWidth;
            centerX = currentX + (corridorLength / 2);
            centerZ = currentZ;
            moveX = corridorLength;
            // East Corridor: Connects West (Start) and East (End)
            openSides = ['minX', 'maxX'];
        } else if (currentDirIdx === 2) { // South (+Z)
            segW = corridorWidth; segD = corridorLength;
            centerX = currentX;
            centerZ = currentZ + (corridorLength / 2);
            moveZ = corridorLength;
            // South Corridor: Connects North (Start) and South (End)
            openSides = ['minZ', 'maxZ'];
        } else { // West (-X)
            segW = corridorLength; segD = corridorWidth;
            centerX = currentX - (corridorLength / 2);
            centerZ = currentZ;
            moveX = -corridorLength;
            // West Corridor: Connects East (Start) and West (End)
            openSides = ['maxX', 'minX'];
        }

        // Create Geometry
        // Floor
        buildBox(centerX, -0.1, centerZ, segW, 0.2, segD, floorMat);
        // Ceiling
        buildBox(centerX, wallHeight, centerZ, segW, 0.2, segD, ceilingMat);

        // Walls
        // We need to place Side Walls.
        // The "Ends" are open (start connected to prev, end connected to next).
        if (currentDirIdx === 0 || currentDirIdx === 2) { // N/S
            // Left Wall (West side)
            buildBox(centerX - 10, wallHeight / 2, centerZ, 1, wallHeight, segD, wallMat);
            // Right Wall (East side)
            buildBox(centerX + 10, wallHeight / 2, centerZ, 1, wallHeight, segD, wallMat);
        } else { // E/W
            // Top Wall (North side)
            buildBox(centerX, wallHeight / 2, centerZ - 10, segW, wallHeight, 1, wallMat);
            // Bottom Wall (South side)
            buildBox(centerX, wallHeight / 2, centerZ + 10, segW, wallHeight, 1, wallMat);
        }

        // Register Segment for Collision
        segments.push({
            bounds: {
                minX: centerX - segW / 2,
                maxX: centerX + segW / 2,
                minZ: centerZ - segD / 2,
                maxZ: centerZ + segD / 2
            },
            openSides: openSides
        });

        // Place Art in this corridor
        // N/S Corridor: Walls are at X +/- 10. Z ranges from Start to End.
        // E/W Corridor: Walls are at Z +/- 10. X ranges from Start to End.
        chunk.forEach((filename, idx) => {
            // Distribute 4 items: 2 on "Left", 2 on "Right" relative to walk direction.
            // Simplified: Just use side A and Side B.

            // Spacing
            // Length is 40. Positions at 10 and 30 relative to start?
            // Center is 0 relative to local. range -20 to 20.
            // Spots: -10 and 10 local.

            let artX, artY = 4, artZ, artRot;
            const isSideA = idx % 2 === 0; // 0, 2 -> Side A. 1, 3 -> Side B.
            const offset = (idx < 2) ? -10 : 10; // First pair closer to start?

            if (currentDirIdx === 0) { // North
                // Side A = West Wall (x = -9.3), Side B = East Wall (x = 9.3)
                artX = isSideA ? (centerX - 9.3) : (centerX + 9.3);
                artRot = isSideA ? Math.PI / 2 : -Math.PI / 2;
                // Move Art Z relative to CenterZ. Range is +/- 20.
                // offset is +/- 10.
                artZ = centerZ + offset;
            } else if (currentDirIdx === 1) { // East
                // Side A = North Wall (z = -9.3), Side B = South Wall (z = 9.3)
                artZ = isSideA ? (centerZ - 9.3) : (centerZ + 9.3);
                artRot = isSideA ? 0 : Math.PI;
                artX = centerX + offset;
            } else if (currentDirIdx === 2) { // South
                // Side A = East Wall (x = 9.3), Side B = West Wall (x = -9.3)
                artX = isSideA ? (centerX + 9.3) : (centerX - 9.3);
                artRot = isSideA ? -Math.PI / 2 : Math.PI / 2;
                artZ = centerZ + offset; // verify sign? South increases Z.
            } else { // West
                // Side A = South Wall, Side B = North Wall
                artZ = isSideA ? (centerZ + 9.3) : (centerZ - 9.3);
                artRot = isSideA ? Math.PI : 0;
                artX = centerX + offset;
            }

            placeArt(filename, artX, artY, artZ, artRot);
        });

        // Add Visitors randomly
        if (Math.random() > 0.5) {
            createVisitor(centerX, centerZ, scene);
        }

        // Advance Current Position to end of corridor
        currentX += moveX;
        currentZ += moveZ;

        // 2. Build Turn (if not last chunk)
        if (i + chunkSize < userMedia.length) {
            const turnSize = 20;
            // Determine Turn Direction: Alternate Right/Left or randomize
            // Let's Turn LEFT to make a spiral or snake? Or just Right.
            // Let's alternate based on chunk index: Even chunks turn Right, Odd turn Left.
            const turnRight = (i / chunkSize) % 2 === 0;

            // Build Turn Floor/Ceiling
            // Center of Turn
            let turnCenterX, turnCenterZ;
            let turnOpenSides = [];

            // We need to move 'half a turn size' from the corridor end to get turn center?
            // No, the corridor ended at the edge of the turn box.

            if (currentDirIdx === 0) { // North
                turnCenterX = currentX;
                turnCenterZ = currentZ - 10; // Center is 10 units further North
                // Entering from South (maxZ).
                turnOpenSides.push('maxZ');
            } else if (currentDirIdx === 1) { // East
                turnCenterX = currentX + 10;
                turnCenterZ = currentZ;
                // Entering from West (minX).
                turnOpenSides.push('minX');
            } else if (currentDirIdx === 2) { // South
                turnCenterX = currentX;
                turnCenterZ = currentZ + 10;
                // Entering from North (minZ).
                turnOpenSides.push('minZ');
            } else { // West
                turnCenterX = currentX - 10;
                turnCenterZ = currentZ;
                // Entering from East (maxX).
                turnOpenSides.push('maxX');
            }

            // Build Turn Box
            buildBox(turnCenterX, -0.1, turnCenterZ, turnSize, 0.2, turnSize, floorMat);
            buildBox(turnCenterX, wallHeight, turnCenterZ, turnSize, 0.2, turnSize, ceilingMat);

            // Turn Logic
            const oldDir = currentDirIdx;
            if (turnRight) currentDirIdx = (currentDirIdx + 1) % 4;
            else currentDirIdx = (currentDirIdx + 3) % 4; // -1 + 4

            // Add Exit to OpenSides
            if (currentDirIdx === 0) turnOpenSides.push('minZ'); // Exiting North
            else if (currentDirIdx === 1) turnOpenSides.push('maxX'); // Exiting East
            else if (currentDirIdx === 2) turnOpenSides.push('maxZ'); // Exiting South
            else turnOpenSides.push('minX'); // Exiting West

            // Add collision for turn
            segments.push({
                bounds: {
                    minX: turnCenterX - 10,
                    maxX: turnCenterX + 10,
                    minZ: turnCenterZ - 10,
                    maxZ: turnCenterZ + 10
                },
                openSides: turnOpenSides
            });

            // Walls for Turn
            // A turn is 20x20. It has 2 walls (Outside corner).
            // Input Dir: North. Turn Right (East).
            // Openings are South (Entry) and East (Exit).
            // Walls are North and West.

            // Logic update:
            // Place walls based on Entry and Exit
            // We can just place 4 walls and remove the ones for Entry/Exit?
            // Entry is opposite of OldDir. Exit is CurrentDir.

            // Actually, walls are AT the directions.
            // If we enter from South (moving North), the opening is South.
            // If we exit to East, the opening is East.

            // We build walls that are NOT entry or exit.

            const wallsToBuild = [0, 1, 2, 3]; // N, E, S, W
            const entryWallIdx = (oldDir + 2) % 4; // Opposite of old dir
            const exitWallIdx = currentDirIdx;

            wallsToBuild.forEach(wIdx => {
                if (wIdx === entryWallIdx || wIdx === exitWallIdx) return;

                // Build Wall
                if (wIdx === 0) // North Wall
                    buildBox(turnCenterX, wallHeight / 2, turnCenterZ - 10, turnSize, wallHeight, 1, wallMat);
                if (wIdx === 1) // East Wall
                    buildBox(turnCenterX + 10, wallHeight / 2, turnCenterZ, 1, wallHeight, turnSize, wallMat);
                if (wIdx === 2) // South Wall
                    buildBox(turnCenterX, wallHeight / 2, turnCenterZ + 10, turnSize, wallHeight, 1, wallMat);
                if (wIdx === 3) // West Wall
                    buildBox(turnCenterX - 10, wallHeight / 2, turnCenterZ, 1, wallHeight, turnSize, wallMat);
            });

            // Advance Position to end of turn (start of next corridor)
            if (currentDirIdx === 0) {
                currentZ = turnCenterZ - 10;
                currentX = turnCenterX;
            } else if (currentDirIdx === 1) {
                currentX = turnCenterX + 10;
                currentZ = turnCenterZ;
            } else if (currentDirIdx === 2) {
                currentZ = turnCenterZ + 10;
                currentX = turnCenterX;
            } else { // 3
                currentX = turnCenterX - 10;
                currentZ = turnCenterZ;
            }
        } else {
            // Last Chunk? Cap the end.
            if (currentDirIdx === 0) buildBox(currentX, wallHeight / 2, currentZ, 20, wallHeight, 1, wallMat);
            else if (currentDirIdx === 1) buildBox(currentX, wallHeight / 2, currentZ, 1, wallHeight, 20, wallMat);
            else if (currentDirIdx === 2) buildBox(currentX, wallHeight / 2, currentZ, 20, wallHeight, 1, wallMat);
            else buildBox(currentX, wallHeight / 2, currentZ, 1, wallHeight, 20, wallMat);
        }
    }

    // Init Floating Hearts for Gallery
    initFloatingHearts(scene, currentX, currentZ); // Spread them around the generated path? 
    // Actually better to just scatter them in a volume around the player or fixed points.
    // Let's scatter them along the generated path segments.
}

// --- Visual Effects Systems ---

// 1. Floating Hearts in Gallery
let floatingHearts = [];
function initFloatingHearts(scene) {
    // Create heart shape
    const x = 0, y = 0;
    const heartShape = new THREE.Shape();
    heartShape.moveTo(x + 0.5, y + 0.5);
    heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    heartShape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
    heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

    const geometry = new THREE.ExtrudeGeometry(heartShape, { depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.1, bevelThickness: 0.1 });
    const material = new THREE.MeshStandardMaterial({ color: 0xff69b4, emissive: 0xff1493, emissiveIntensity: 0.5, metalness: 0.5, roughness: 0.2 });

    // Create 50 hearts scattered
    for (let i = 0; i < 50; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        // Random pos - we need them near the corridors.
        // It's hard to follow the procedurally generated path exactly without storing it.
        // Let's just put them in the Lobby and first few segments or use a large volume.
        // Or better, let's just make them surround the player? No, static is better.
        // We'll scatter them in a loop around 0,0 for now, effectively in the lobby/start.
        // Ideally we'd add them IN generateAndBuildGallery per segment.

        mesh.position.set(
            (Math.random() - 0.5) * 100,
            Math.random() * 8 + 2, // Ceiling height
            (Math.random() - 0.5) * 100
        );

        mesh.rotation.z = Math.PI; // Point up
        mesh.rotation.y = Math.random() * Math.PI * 2;
        mesh.scale.set(0.5, 0.5, 0.5);

        scene.add(mesh);
        floatingHearts.push({
            mesh: mesh,
            speed: Math.random() * 0.02 + 0.01,
            yOffset: Math.random() * Math.PI
        });
    }
}

// 2. Confetti Explosion
let confettiParticles = [];
function explodeConfetti() {
    const geo = new THREE.PlaneGeometry(0.1, 0.1);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });

    for (let i = 0; i < 500; i++) {
        const material = mat.clone();
        material.color.setHSL(Math.random(), 1, 0.5);

        const mesh = new THREE.Mesh(geo, material);
        mesh.position.set(0, 0, 0); // Start at center (before gallery load)

        // Random velocity
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.2 + 0.5 // Forward/Up
        );

        scene.add(mesh);
        confettiParticles.push({ mesh, velocity });
    }
}

// --- Init Gallery Room ---
function initGalleryRoom() {
    try {
        console.log("Starting initGalleryRoom (Procedural)...");

        isGalleryActive = true;

        // Clear previous scene
        coreMesh.visible = false;
        particlesMesh.visible = true;
        particlesMesh.material.color.setHex(0xFFFFFF);
        particlesMesh.position.y = 10;

        // Enable Shadows
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // DEBUG: Grid Helper for Floor
        const gridHelper = new THREE.GridHelper(100, 100);
        gridHelper.position.y = 0.01; // Slightly above floor to avoid z-fight if overlap
        // scene.add(gridHelper); // Removed for production look, floor is gray now

        // UI
        const galleryUI = document.getElementById('gallery-ui');
        galleryUI.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        const instructions = document.getElementById('instructions');

        // Setup Controls
        if (!controls) controls = new PointerLockControls(camera, document.body);

        instructions.addEventListener('click', (e) => {
            if (!controls.isLocked) {
                controls.lock();
            }
            e.stopPropagation(); // Prevent bubbling to gallery-ui
        });

        controls.addEventListener('lock', () => {
            instructions.style.display = 'none';
            galleryUI.style.display = 'block';
        });

        galleryUI.addEventListener('click', (e) => {
            // Only lock if clicking on the background (not instructions, but we stopped prop anyway)
            if (!controls.isLocked && isGalleryActive) {
                controls.lock();
            }
        });

        controls.addEventListener('unlock', () => {
            instructions.style.display = 'flex';
        });

        // Movement Listeners
        const onKeyDown = (event) => {
            switch (event.code) {
                case 'ArrowUp': case 'KeyW': moveForward = true; break;
                case 'ArrowLeft': case 'KeyA': moveLeft = true; break;
                case 'ArrowDown': case 'KeyS': moveBackward = true; break;
                case 'ArrowRight': case 'KeyD': moveRight = true; break;
                case 'KeyR': // Reset Position Debug
                    if (controls.isLocked) {
                        camera.position.set(0, 4, 15);
                        velocity.set(0, 0, 0);
                        console.log("Reset Position");
                    }
                    break;
                case 'Enter':
                    if (!controls.isLocked && isGalleryActive) {
                        controls.lock();
                    }
                    break;
            }
        };
        const onKeyUp = (event) => {
            switch (event.code) {
                case 'ArrowUp': case 'KeyW': moveForward = false; break;
                case 'ArrowLeft': case 'KeyA': moveLeft = false; break;
                case 'ArrowDown': case 'KeyS': moveBackward = false; break;
                case 'ArrowRight': case 'KeyD': moveRight = false; break;
            }
        };
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        // --- Execute Procedural Generation ---
        generateAndBuildGallery(scene, userMedia);

        // Set initial player position
        // Start of first corridor is roughly 0,0,20 to 0,0,-20.
        // Place player at start.
        camera.position.set(0, 4, 15);
        camera.rotation.set(0, 0, 0); // Face North
        console.log("Procedural Gallery initialized");

    } catch (error) {
        console.error("Critical Error in initGalleryRoom:", error);
        alert("Gallery Error: " + error.message);
    }
}

// Replaces old initGallery
function initGallery() {
    initGalleryRoom();
}

// --- Animation Loop ---

function animate() {
    requestAnimationFrame(animate);

    // FPS Movement Logic
    if (controls && controls.isLocked) {
        const delta = 0.015; // approximate delta time

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        // --- Ground-Based Movement ---
        // PointerLockControls.moveForward moves in camera direction (including Y).
        // We want to move ONLY on X/Z plane.

        const camDir = new THREE.Vector3();
        controls.getDirection(camDir);
        camDir.y = 0; // Flatten
        camDir.normalize();

        const sideDir = new THREE.Vector3();
        sideDir.crossVectors(camDir, new THREE.Vector3(0, 1, 0)).normalize();

        // Calculate displacement
        const dispX = (-velocity.z * delta * camDir.x) + (-velocity.x * delta * sideDir.x);
        const dispZ = (-velocity.z * delta * camDir.z) + (-velocity.x * delta * sideDir.z);

        // Apply manually
        controls.object.position.x += dispX;
        controls.object.position.z += dispZ;

        // --- Physics & Collision ---
        const playerPos = controls.object.position;

        // Store probable next position
        // Actually, we already moved.

        // 1. Floor Constraint (Strict Lock)
        // Force Y to 4.0 always.
        playerPos.y = 4.0;
        velocity.y = 0;

        // 2. Void Check (Respawn if far out of bounds)
        // If something goes smoothly wrong and they drift way out
        if (playerPos.y < -10 || playerPos.y > 50 || Math.abs(playerPos.x) > 500 || Math.abs(playerPos.z) > 500) {
            console.warn("Player out of bounds! Respawning...");
            playerPos.set(0, 4, 15);
            velocity.set(0, 0, 0);
        }

        // 2. Wall Constraint (Complex Layout)
        // If the new position is invalid, revert to previous valid position.
        // But we didn't store prev pos before move.
        // Let's check collision. If invalid, push back.

        if (!checkCollision(playerPos)) {
            // Collision detected!
            // Attempt to undo X and Z independently to allow "sliding" along walls.

            const undoX = velocity.x * delta;
            const undoZ = velocity.z * delta;

            // Try undoing just X (Lateral movement)
            controls.moveRight(undoX); // Undo X
            if (checkCollision(playerPos)) {
                // X undo fixed it. We hit a wall in X direction.
                velocity.x = 0;
            } else {
                // X undo didn't fix it. Re-apply X (move back to invalid X state) 
                // and try undoing Z.
                controls.moveRight(-undoX);

                controls.moveForward(undoZ); // Undo Z
                if (checkCollision(playerPos)) {
                    // Z undo fixed it.
                    velocity.z = 0;
                } else {
                    // Neither fixed it (corner?). Undo BOTH.
                    controls.moveForward(-undoZ); // Re-apply Z to try both

                    // Undo Both
                    controls.moveRight(undoX);
                    controls.moveForward(undoZ);
                    velocity.x = 0;
                    velocity.z = 0;
                }
            }
        }
    }


    // Auth Mode Animations
    if (!state.authenticated && !isGalleryActive) {
        const elapsedTime = clock.getElapsedTime();
        const scale = 1 + Math.sin(elapsedTime * 2) * 0.1;
        coreMesh.scale.set(scale, scale, scale);
        coreMesh.rotation.z += 0.005;
        coreMesh.rotation.y += 0.01;

        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        scene.rotation.y += 0.05 * (targetX - scene.rotation.y);
        scene.rotation.x += 0.05 * (targetY - scene.rotation.x);

        camera.position.x += (mouseX * 0.005 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 0.005 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
    }

    // Animate Confetti
    confettiParticles.forEach((p, i) => {
        p.mesh.position.add(p.velocity);
        p.velocity.y -= 0.01; // Gravity
        p.mesh.rotation.x += 0.1;
        p.mesh.rotation.y += 0.1;

        // Remove if too low
        if (p.mesh.position.y < -20) {
            scene.remove(p.mesh);
            confettiParticles.splice(i, 1);
        }
    });

    // Animate Floating Hearts (Gallery)
    if (isGalleryActive) {
        const time = clock.getElapsedTime();
        floatingHearts.forEach(heart => {
            heart.mesh.rotation.y += heart.speed;
            heart.mesh.position.y += Math.sin(time + heart.yOffset) * 0.005;
        });
    }

    // Common Updates (Particles)
    particlesMesh.rotation.y = clock.getElapsedTime() * 0.05;
    particlesMesh.rotation.x = clock.getElapsedTime() * 0.02;

    renderer.render(scene, camera);
}

// Start animation at the END
animate();
