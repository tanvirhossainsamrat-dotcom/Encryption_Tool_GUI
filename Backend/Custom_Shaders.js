// 2. Initialize Three.js scene and compile custom fragment shader
function initWebGLMatrix() {
    const canvas = document.getElementById('matrix-canvas');
    matrixRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: false }); matrixRenderer.setSize(window.innerWidth, window.innerHeight); matrixRenderer.setPixelRatio(window.devicePixelRatio);
    matrixScene = new THREE.Scene(); matrixCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const atlasTexture = createMatrixAtlas();

    matrixMaterial = new THREE.ShaderMaterial({
        uniforms: {
            u_time: { value: 0 }, u_tex: { value: atlasTexture }, u_color: { value: new THREE.Color(matrixColor) }, u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            u_fontSize: { value: 12.0 }, u_speedMult: { value: 1.0 }, u_trailLen: { value: 1.0 }
        },
        vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
        fragmentShader: `
                    varying vec2 vUv; uniform float u_time; uniform sampler2D u_tex; uniform vec3 u_color; uniform vec2 u_resolution; uniform float u_fontSize; uniform float u_speedMult; uniform float u_trailLen;
                    float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
                    void main() {
                        // Calculate grid cells based on screen resolution and desired font size
                        float fontSize = u_fontSize; vec2 grid = vec2(u_resolution.x / fontSize, u_resolution.y / fontSize);
                        vec2 gridUV = vec2(vUv.x * grid.x, vUv.y * grid.y); vec2 id = floor(gridUV); vec2 cellUV = fract(gridUV);
                        
                        // Give each column a random speed and starting offset
                        float colRand = random(vec2(id.x, 0.0));
                        float speed = (0.5 + colRand * 1.5) * u_speedMult; float offset = colRand * 100.0;
                        
                        // Calculate falling math
                        float fallTime = u_time * speed + offset; float yDist = mod(gridUV.y + fallTime * 15.0, grid.y);
                        float dropLen = (15.0 + colRand * 25.0) * u_trailLen;
                        
                        if (yDist > dropLen) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
                        
                        // Fade alpha based on distance from the head of the drop
                        float alpha = 1.0 - (yDist / dropLen); alpha = pow(alpha, 1.2); 
                        bool isHead = yDist < 1.0;
                        
                        // Rapidly change characters
                        float charRand = random(id + floor(u_time * 3.0 + colRand * 10.0)); float charIndex = floor(charRand * 256.0);
                        float cRow = floor(charIndex / 16.0); float cCol = mod(charIndex, 16.0);
                        vec2 atlasUV = vec2((cCol + cellUV.x) / 16.0, (15.0 - cRow + cellUV.y) / 16.0);
                        vec4 texColor = texture2D(u_tex, atlasUV);
                        if (texColor.r < 0.1) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
                        
                        // Head is white, tail is colored
                        vec3 finalColor = isHead ? vec3(1.0) : u_color; gl_FragColor = vec4(finalColor * texColor.r * alpha, 1.0); 
                    }
                `, transparent: false
    });

    // Map shader to a 2D plane that covers the entire camera view
    const geometry = new THREE.PlaneGeometry(2, 2); const mesh = new THREE.Mesh(geometry, matrixMaterial); matrixScene.add(mesh);
}
