import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/OrbitControls.js';

window.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('#webgl');
    const app = new ThreeApp(wrapper);
    app.render();
}, false);

class ThreeApp {
    static CAMERA_PARAM = {
        fovy: 60,
        aspect: window.innerWidth / window.innerHeight,
        near: 0.1,
        far: 20.0,
        position: new THREE.Vector3(0.0, 2.0, 10.0),
        lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    };
    static RENDERER_PARAM = {
        clearColor: 0xffeeb3,
        width: window.innerWidth,
        height: window.innerHeight,
    };
    static DIRECTIONAL_LIGHT_PARAM = {
        color: 0xffffff,
        intensity: 1.5,
        position1: new THREE.Vector3(1.0, 1.0, 1.0),
        position2: new THREE.Vector3(-1.0, 1.0, 1.0),
        position3: new THREE.Vector3(1.0, -1.0, 1.0),
        position4: new THREE.Vector3(0.0, 1.0, -1.0),
    };
    static AMBIENT_LIGHT_PARAM = {
        color: 0xffffff,
        intensity: 0.5,
    };
    static POINT_LIGHT_PARAM = {
        color: 0xffffff,
        intensity: 0.5,
        distance: 50.0,
        position: new THREE.Vector3(0.0, 5.0, 5.0),
    };
    static SPOT_LIGHT_PARAM = {
        color: 0xffffff,
        intensity: 1.5,
        distance: 50.0,
        angle: Math.PI / 4,
        penumbra: 0.1,
        position: new THREE.Vector3(0.0, 10.0, 0.0),
        target: new THREE.Vector3(0.0, 0.0, 1.0),
    };
    static TRIANGLE_MATERIAL_PARAM = {
        color: 0xff69b4,
        metalness: 0.8,
        roughness: 0.2,
        side: THREE.DoubleSide,
    };
    static CYLINFE_MATERIAL_PARAM = {
        color: 0xfC4BA3B,
        metalness: 0.8,
        roughness: 0.2,
        side: THREE.DoubleSide,
    };

    renderer;
    scene;
    camera;
    directionalLight;
    ambientLight;
    triangleMaterial;
    triangleGeometry;
    triangle;
    cylinderMaterial;
    controls;
    isDown;
    rotationDirectionY;
    group;
    isButtonOn;

    constructor(wrapper) {
        const color = new THREE.Color(ThreeApp.RENDERER_PARAM.clearColor);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(color);
        this.renderer.setSize(ThreeApp.RENDERER_PARAM.width, ThreeApp.RENDERER_PARAM.height);
        wrapper.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(
            ThreeApp.CAMERA_PARAM.fovy,
            ThreeApp.CAMERA_PARAM.aspect,
            ThreeApp.CAMERA_PARAM.near,
            ThreeApp.CAMERA_PARAM.far,
        );
        this.camera.position.copy(ThreeApp.CAMERA_PARAM.position);
        this.camera.lookAt(ThreeApp.CAMERA_PARAM.lookAt);

        this.ambientLight = new THREE.AmbientLight(
            ThreeApp.AMBIENT_LIGHT_PARAM.color,
            ThreeApp.AMBIENT_LIGHT_PARAM.intensity,
        );
        this.scene.add(this.ambientLight);

        this.directionalLight1 = new THREE.DirectionalLight(
            ThreeApp.DIRECTIONAL_LIGHT_PARAM.color,
            ThreeApp.DIRECTIONAL_LIGHT_PARAM.intensity
        );
        this.directionalLight1.position.copy(ThreeApp.DIRECTIONAL_LIGHT_PARAM.position1);
        this.scene.add(this.directionalLight1);

        this.directionalLight2 = new THREE.DirectionalLight(
            ThreeApp.DIRECTIONAL_LIGHT_PARAM.color,
            ThreeApp.DIRECTIONAL_LIGHT_PARAM.intensity
        );
        this.directionalLight2.position.copy(ThreeApp.DIRECTIONAL_LIGHT_PARAM.position2);
        this.scene.add(this.directionalLight2);

        this.directionalLight3 = new THREE.DirectionalLight(
            ThreeApp.DIRECTIONAL_LIGHT_PARAM.color,
            ThreeApp.DIRECTIONAL_LIGHT_PARAM.intensity
        );
        this.directionalLight3.position.copy(ThreeApp.DIRECTIONAL_LIGHT_PARAM.position3);
        this.scene.add(this.directionalLight3);

        this.directionalLight4 = new THREE.DirectionalLight(
            ThreeApp.DIRECTIONAL_LIGHT_PARAM.color,
            ThreeApp.DIRECTIONAL_LIGHT_PARAM.intensity
        );
        this.directionalLight4.position.copy(ThreeApp.DIRECTIONAL_LIGHT_PARAM.position4);
        this.scene.add(this.directionalLight4);

        this.pointLight = new THREE.PointLight(
            ThreeApp.POINT_LIGHT_PARAM.color,
            ThreeApp.POINT_LIGHT_PARAM.intensity,
            ThreeApp.POINT_LIGHT_PARAM.distance
        );
        this.pointLight.position.copy(ThreeApp.POINT_LIGHT_PARAM.position);
        this.scene.add(this.pointLight);

        this.spotLight = new THREE.SpotLight(
            ThreeApp.SPOT_LIGHT_PARAM.color,
            ThreeApp.SPOT_LIGHT_PARAM.intensity,
            ThreeApp.SPOT_LIGHT_PARAM.distance,
            ThreeApp.SPOT_LIGHT_PARAM.angle,
            ThreeApp.SPOT_LIGHT_PARAM.penumbra
        );
        this.spotLight.position.copy(ThreeApp.SPOT_LIGHT_PARAM.position);
        this.spotLight.target.position.copy(ThreeApp.SPOT_LIGHT_PARAM.target);
        this.scene.add(this.spotLight);
        this.scene.add(this.spotLight.target);

        this.triangleMaterial = new THREE.MeshStandardMaterial(ThreeApp.TRIANGLE_MATERIAL_PARAM);
        this.cylinderMaterial = new THREE.MeshStandardMaterial(ThreeApp.CYLINFE_MATERIAL_PARAM);

        this.group = new THREE.Group();
        this.group.position.y = 2.0;
        this.scene.add(this.group);

        this.triangleGeometry = this.createTriangleGeometry();
        this.triangle = new THREE.Mesh(this.triangleGeometry, this.triangleMaterial);
        this.triangle.position.z = 1.0;
        this.group.add(this.triangle);  // 羽根をgroupに追加

        const geometry = new THREE.CylinderGeometry(2.0, 2.0, 0.5, 12);
        const cylinder = new THREE.Mesh(geometry, this.cylinderMaterial);
        cylinder.position.y = -3.0;
        this.scene.add(cylinder);

        const geometry2 = new THREE.CylinderGeometry(0.2, 0.2, 5, 12);
        const cylinder2 = new THREE.Mesh(geometry2, this.cylinderMaterial);
        cylinder2.position.y = -0.5;
        this.scene.add(cylinder2);

        const geometry3 = new THREE.CylinderGeometry(0.2, 0.2, 1, 12);
        const cylinder3 = new THREE.Mesh(geometry3, this.cylinderMaterial);
        cylinder3.rotation.x = Math.PI / 2;
        cylinder3.position.z = 0.5;
        this.group.add(cylinder3);  // シリンダー３をgroupに追加

        const geometry4 = new THREE.SphereGeometry(0.25, 10, 16);
        const sphere = new THREE.Mesh(geometry4, this.cylinderMaterial);
        sphere.position.y = 2.0;
        this.scene.add(sphere);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.render = this.render.bind(this);

        this.isDown = false;           // スペースキーのオンオフ
        this.rotationDirectionY = 1;
        this.isButtonOn = false;

        window.addEventListener('keydown', (keyEvent) => {
            if (keyEvent.code === 'Space' && this.isButtonOn) {
                this.isDown = true;
            }
        }, false);
        window.addEventListener('keyup', (keyEvent) => {
            if (keyEvent.code === 'Space') {
                this.isDown = false;
            }
        }, false);

        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });

        const toggleButton = document.getElementById('toggleButton');
        toggleButton.addEventListener('mousedown', () => {
            this.isButtonOn = !this.isButtonOn;
            toggleButton.textContent = this.isButtonOn ? 'ON' : 'OFF';
            if(this.isButtonOn){
                this.nornalVertexPosition();
            } else{
                this.updateVertexPosition();
            };
        });
    }

    createTriangleGeometry() {
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([

            // 羽根1
            0.0, 0.0, 0.0,          // index=0
            0.5, 2.0, 0.5,          // index=1
            0.0, 2.0, 0.35,         // index=2
            -0.5, 2.0, 0.2,         // index=3

            // 羽根2
            0.0, 0.0, 0.0,          // index=4
            -1.987, -0.566, 0.5,    // index=5
            -1.735, -0.9995, 0.35,  // index=6
            -1.483, -1.433, 0.2,    // index=7

            // 羽根3
            0.0, 0.0, 0.0,          // index=8
            1.987, -0.566, 0.5,     // index=9
            1.735, -0.9995, 0.35,   // index=10
            1.483, -1.433, 0.2      // index=11
        ]);

        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        const indices = new Uint16Array([
            0, 1, 2, 2, 3, 0,            // 羽根1
            4, 5, 6, 6, 7, 4,            // 羽根2
            8, 9, 10, 10, 11, 8,         // 羽根3
        ]);

        geometry.setIndex(new THREE.BufferAttribute(indices, 1));

        geometry.computeVertexNormals();

        return geometry;
    }

    nornalVertexPosition() {
        const position = this.triangleGeometry.attributes.position.array;
        const x1 = position[1 * 3];
        const y1 = position[1 * 3 + 1];
        const z1 = position[1 * 3 + 2];
        const x3 = position[3 * 3];
        const y3 = position[3 * 3 + 1];
        const z3 = position[3 * 3 + 2];
        position[2 * 3] = (x3 + x1) / 2;
        position[2 * 3 + 1] = (y3 + y1)/2;
        position[2 * 3 + 2] = (z3 + z1)/2;
        this.triangleGeometry.attributes.position.needsUpdate = true;
    }

    updateVertexPosition() {
        const position = this.triangleGeometry.attributes.position.array;
        const x0 = position[0 * 3];
        const y0 = position[0 * 3 + 1];
        const z0 = position[0 * 3 + 2];
        const x2 = position[2 * 3];
        const y2 = position[2 * 3 + 1];
        const z2 = position[2 * 3 + 2];
        position[2 * 3] = 2 * x2 - x0;
        position[2 * 3 + 1] = 2 * y2 - y0;
        position[2 * 3 + 2] = 2 * z2 - z0;
        this.triangleGeometry.attributes.position.needsUpdate = true;
    }
    render() {
        requestAnimationFrame(this.render.bind(this));
        this.controls.update();

        if (this.isDown === true) {
            if (this.group.rotation.y > Math.PI / 3) {
                this.rotationDirectionY = -1;
            } else if (this.group.rotation.y < -Math.PI / 3) {
                this.rotationDirectionY = 1;
            }
            this.group.rotation.y += 0.01 * this.rotationDirectionY;
            this.group.rotation.z += 0.1;
        }

        this.renderer.render(this.scene, this.camera);
    }
}
