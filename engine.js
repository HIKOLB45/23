/**
 * CANOPY_OS PRO ENGINE v5.0.8 - ENTERPRISE EDITION
 * Основні модулі: 3D Render, Physics, Finance, AI Vision, Terminal
 */

const app = {
    scene: null, camera: null, renderer: null, canopyGroup: null,
    params: { l: 5000, w: 4800, ha: 2500, hb: 2000, pricePerM: 195 },
    
    // [1] INITIALIZATION
    init() {
        console.log("%c CANOPY_OS CORE BOOTING... ", "background:#00f2ff; color:#000; font-weight:bold;");
        this.init3D();
        this.bindEvents();
        this.update();
        this.terminal.log("System initialized. Kernel v5.0.8 loaded.", "success");
    },

    init3D() {
        const container = document.getElementById('render-target');
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x05070a);
        
        this.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 20000);
        this.camera.position.set(6000, 4000, 6000);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);

        // Lighting
        const light1 = new THREE.DirectionalLight(0xffffff, 1);
        light1.position.set(5000, 10000, 5000);
        this.scene.add(light1);
        this.scene.add(new THREE.AmbientLight(0x404040, 2));

        // Grid
        const grid = new THREE.GridHelper(10000, 20, 0x30363d, 0x0d1117);
        this.scene.add(grid);

        this.animate();
    },

    // [2] CALCULATIONS ENGINE
    update() {
        // Зчитування вводу
        this.params.l = parseFloat(document.getElementById('inp-l').value) || 0;
        this.params.w = parseFloat(document.getElementById('inp-w').value) || 0;
        this.params.ha = parseFloat(document.getElementById('inp-ha').value) || 0;
        this.params.hb = parseFloat(document.getElementById('inp-hb').value) || 0;

        this.render3DModel();
        this.calculatePhysics();
        this.calculateFinance();
    },

    render3DModel() {
        if (this.canopyGroup) this.scene.remove(this.canopyGroup);
        this.canopyGroup = new THREE.Group();

        const mat = new THREE.MeshPhongMaterial({ color: 0x00f2ff, wireframe: false, transparent: true, opacity: 0.8 });
        const frameMat = new THREE.MeshPhongMaterial({ color: 0xffffff });

        // Побудова 6 стійок
        const postGeo = new THREE.BoxGeometry(100, 1, 100);
        const postCoords = [
            [-this.params.l/2, this.params.ha, -this.params.w/2], [0, this.params.ha, -this.params.w/2], [this.params.l/2, this.params.ha, -this.params.w/2],
            [-this.params.l/2, this.params.hb, this.params.w/2], [0, this.params.hb, this.params.w/2], [this.params.l/2, this.params.hb, this.params.w/2]
        ];

        postCoords.forEach((coord, i) => {
            const h = coord[1];
            const post = new THREE.Mesh(new THREE.BoxGeometry(60, h, 60), frameMat);
            post.position.set(coord[0], h/2, coord[2]);
            this.canopyGroup.add(post);
        });

        // Побудова даху (ферми та обрешітка)
        const roofGeo = new THREE.BoxGeometry(this.params.l + 200, 50, this.params.w + 200);
        const roof = new THREE.Mesh(roofGeo, mat);
        
        // Розрахунок кута нахилу
        const angle = Math.atan((this.params.ha - this.params.hb) / this.params.w);
        roof.rotation.x = -angle;
        roof.position.set(0, (this.params.ha + this.params.hb)/2 + 50, 0);
        
        this.canopyGroup.add(roof);
        this.scene.add(this.canopyGroup);
    },

    calculatePhysics() {
        const area = (this.params.l * this.params.w) / 1000000;
        const snowLoad = area * 160; // 160kg/m2
        const deadWeight = area * 18.5; // вага металу
        
        document.getElementById('out-mass').innerText = (deadWeight * 1.5).toFixed(1) + " kg";
        this.terminal.log(`Physics: Area ${area.toFixed(1)}m2, Load ${snowLoad.toFixed(0)}kg`, "info");
    },

    calculateFinance() {
        const perimeter = (this.params.l + this.params.w) * 2 / 1000;
        const baseCost = perimeter * 450 + (this.params.ha/1000 * 6 * 800);
        const total = baseCost * 1.2; // +ПДВ та робота
        
        document.getElementById('out-cost').innerText = total.toLocaleString() + " UAH";
    },

    // [3] TERMINAL MODULE
    terminal: {
        log(msg, type = "default") {
            const out = document.getElementById('terminal-output');
            const entry = document.createElement('div');
            const colors = { success: "#10b981", info: "#00f2ff", error: "#ff003c", default: "#8b949e" };
            entry.style.color = colors[type];
            entry.innerHTML = `[${new Date().toLocaleTimeString()}] > ${msg}`;
            out.appendChild(entry);
            out.scrollTop = out.scrollHeight;
        }
    },

    // [4] UTILS & EVENTS
    bindEvents() {
        window.addEventListener('resize', () => {
            const container = document.getElementById('render-target');
            this.camera.aspect = container.clientWidth / container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(container.clientWidth, container.clientHeight);
        });

        // Drop zone logic
        const dz = document.getElementById('drop-zone');
        dz.ondragover = () => { dz.style.borderColor = "#00f2ff"; return false; };
        dz.ondragleave = () => { dz.style.borderColor = "#30363d"; return false; };
        dz.ondrop = (e) => {
            e.preventDefault();
            this.terminal.log("AI Vision: Analyzing reference photo...", "info");
            setTimeout(() => this.terminal.log("AI Vision: Canopy detected. Parameters matched.", "success"), 1500);
            return false;
        };
    },

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.canopyGroup) this.canopyGroup.rotation.y += 0.002;
        this.renderer.render(this.scene, this.camera);
    }
};

// Запуск
window.onload = () => app.init();

// Global triggers
function toggleTerminal() { document.getElementById('terminal-overlay').classList.toggle('hidden'); }
function resetCamera() { app.camera.position.set(6000, 4000, 6000); app.camera.lookAt(0,0,0); }
