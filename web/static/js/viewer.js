/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-7월-12
 */
import STLLoader from './loaders/stl-loader.js'
import ObjLoader from './loaders/obj-loader.js'
import FBXLoader from './loaders/fbx-loader.js'
// import {FBXLoader} from './loaders/FBXLoader.js'
import PYLLoader from './loaders/ply-loader.js'
import OrbitControls from './controls/orbit.js'
import Stats from './modules/stats.js'

export default class Viewer {
    static DEFAULT_FOG_COLOR = 10526880

    static AMBIENT_LIGHT_ID = 'ambientLight'
    static HEMISPHERE_LIGHT_ID = 'hemisphereLight'

    static MAIN_LIGHT_ID = 'mainLight'
    static RIM_LIGHT_ID = 'rimLight'
    static FILLING_LIGHT_ID = 'fillLight'
    static FILLING_LIGHT_2_ID = 'fillLight2'

    static DEFAULT_AMBIENT_LIGHT_PAYLOAD = {
        color: 0x777779,
        v: 0,
        id: 'ambientLight',
        name: 'Ambient Light',
        type: 'AmbientLight',
    }

    static DEFAULT_HEMISPHERE_LIGHT_PAYLOAD = {
        options: {
            position: {z: 0, y: 2000, x: 0},
        },
        skyColor: 0x777779,
        groundColor: 0xCBCBCB,
        id: 'hemisphereLight',
        name: 'Hemisphere Light',
        type: 'HemisphereLight',
    }

    static DEFAULT_MAIN_LIGHT_PAYLOAD = {
        options: {
            shadowMapSize: 2048,
            shadowBias: -1e-3,
            shadowCameraBottom: -1,
            shadowCameraTop: 1,
            shadowCameraRight: 1,
            shadowCameraLeft: -1,
            shadowCameraFar: 30,
            shadowCameraNear: 1,
            castShadow: true,
            target: {position: {z: 0, y: 0, x: 0}},
            position: {z: 3.5, y: 4.4, x: -0.5},
        },
        intensity: 1.2,
        color: 0xF9F7F2,
        id: Viewer.MAIN_LIGHT_ID,
        name: 'Main Light',
        type: 'DirectionalLight',
    }
    static DEFAULT_RIM_LIGHT_PAYLOAD = {
        options: {
            shadowMapSize: 1024,
            shadowBias: -6e-4,
            shadowCameraBottom: -3,
            shadowCameraTop: 3,
            shadowCameraRight: 3,
            shadowCameraLeft: -3,
            shadowCameraFar: 30,
            shadowCameraNear: 1,
            castShadow: false,
            target: {position: {z: 0, y: 0, x: 0}},
            position: {z: -0.5, y: 1, x: 0},
        },
        intensity: 0.5,
        color: 0xD9EAFF,
        id: Viewer.RIM_LIGHT_ID,
        name: 'Rim Light',
        type: 'DirectionalLight',
    }
    static DEFAULT_FILLING_LIGHT_PAYLOAD = {
        options: {
            shadowMapSize: 1024,
            shadowBias: -6e-4,
            shadowCameraBottom: -3,
            shadowCameraTop: 3,
            shadowCameraRight: 3,
            shadowCameraLeft: -3,
            shadowCameraFar: 30,
            shadowCameraNear: 1,
            castShadow: false,
            target: {position: {z: 0, y: 0, x: 0}},
            position: {z: -2.75, y: 3.75, x: 5},
        },
        intensity: 0.5,
        color: 0xBEC8E5,
        id: Viewer.FILLING_LIGHT_ID,
        name: 'Fill Light',
        type: 'DirectionalLight',
    }
    static DEFAULT_FILLING_LIGHT_2_PAYLOAD = {
        options: {
            shadowMapSize: 1024,
            shadowBias: -6e-4,
            shadowCameraBottom: -3,
            shadowCameraTop: 3,
            shadowCameraRight: 3,
            shadowCameraLeft: -3,
            shadowCameraFar: 30,
            shadowCameraNear: 1,
            castShadow: false,
            target: {position: {z: 0, y: 0, x: 0}},
            position: {z: 0.25, y: -0.25, x: 0.03},
        },
        intensity: 0.2,
        color: 0xF9D7ED,
        id: Viewer.FILLING_LIGHT_2_ID,
        name: 'Fill Light',
        type: 'DirectionalLight',
    }

    static LIGHT_LIST = {
        [Viewer.MAIN_LIGHT_ID]: Viewer.DEFAULT_MAIN_LIGHT_PAYLOAD,
        [Viewer.RIM_LIGHT_ID]: Viewer.DEFAULT_RIM_LIGHT_PAYLOAD,
        [Viewer.FILLING_LIGHT_ID]: Viewer.DEFAULT_FILLING_LIGHT_PAYLOAD,
        [Viewer.FILLING_LIGHT_2_ID]: Viewer.DEFAULT_FILLING_LIGHT_2_PAYLOAD,
    }

    constructor(element) {
        this.placeholder = element
        this.lights = new Map()

        this.initLights()
        // this.initHemisphereLight()
        this.initAmbientLight()

        this.initCamera()
        this.initScene()

        this.initRenderer()
        this.initControls()

        this.stats = Stats()

        this.initEventListeners()

        this.appendElements()
    }

    initLights() {
        for (const id in Viewer.LIGHT_LIST) {
            const payload = Viewer.LIGHT_LIST[id]
            console.log(`${id}: ${payload}`)
            const options = payload.options
            const {x, y, z} = options.position
            const light = new THREE.DirectionalLight(payload.color, payload.intensity)
            light.position.set(x, y, z)
            light.castShadow = options.castShadow

            light.shadow.bias = options.shadowBias
            light.shadow.mapSize.width = options.shadowMapSize
            light.shadow.mapSize.height = options.shadowMapSize

            light.shadow.camera.top = options.shadowCameraTop
            light.shadow.camera.bottom = options.shadowCameraBottom
            light.shadow.camera.left = options.shadowCameraLeft
            light.shadow.camera.right = options.shadowCameraRight

            light.shadow.camera.near = options.shadowCameraNear
            light.shadow.camera.far = options.shadowCameraFar

            this.lights.set(id, light)
        }
    }

    initLight() {
        this.light = new THREE.SpotLight()
        this.light.position.set(20, 20, 20)
    }

    initAmbientLight() {
        const id = Viewer.AMBIENT_LIGHT_ID
        const payload = Viewer.DEFAULT_AMBIENT_LIGHT_PAYLOAD
        const light = new THREE.AmbientLight(payload.color)

        this.lights.set(id, light)
    }

    initHemisphereLight() {
        const id = Viewer.HEMISPHERE_LIGHT_ID
        const payload = Viewer.DEFAULT_HEMISPHERE_LIGHT_PAYLOAD
        console.log({id, payload})
        const light = new THREE.HemisphereLight(payload.skyColor, payload.groundColor)
        const options = payload.options
        const {x, y, z} = options.position
        light.position.set(x, y, z)

        this.lights.set(id, light)
    }

    loadLights() {
        for (const light of this.lights.values()) {
            this.scene.add(light)
        }
    }

    initCamera() {
        const aspect = this.placeholder.offsetWidth / this.placeholder.offsetHeight
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
        this.camera.position.z = 3
    }

    initScene() {
        this.scene = new THREE.Scene()
        // this.scene.environment

        const color = 0xa0a0a0
        const density = 0.0035
        this.scene.background = new THREE.Color(color)
        // this.scene.fog = new THREE.FogExp2(color, density)
        this.scene.fog = new THREE.Fog(color, 1, 1200)
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({antialias: true})
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(this.placeholder.offsetWidth, this.placeholder.offsetHeight)
        this.renderer.outputEncoding = THREE.sRGBEncoding
        this.renderer.shadowMap.enabled = true
        // this.renderer.state.setBlending(THREE.NormalBlending)
    }

    loadGround() {
        const gridTexture = new THREE.TextureLoader().load('img/grid_texture.png')
        gridTexture.wrapS = gridTexture.wrapT = THREE.RepeatWrapping
        gridTexture.repeat.set(20, 20)
        gridTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()

        this.renderer.setClearColor(0xa0a0a0, 1)
        this.renderer.sortObjects = false
        this.renderer.state.setBlending(THREE.NormalBlending)

        // const floor = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({
        //     color: 0x999999,
        //     depthWrite: false,
        // }))
        // floor.rotation.x = -Math.PI / 2
        // floor.receiveShadow = true

        const groundMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, map: gridTexture})
        const floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000, 1000), groundMaterial)
        floor.position.y = 0.0
        floor.rotation.x = -Math.PI / 2
        floor.receiveShadow = true

        this.scene.add(floor)
    }

    initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = true
    }

    initEventListeners() {
        this.resizeObserver = new ResizeObserver(entries => this.onResize(entries))
        this.resizeObserver.observe(this.placeholder)
    }

    initMesh(geometry) {
        const envTexture = new THREE.CubeTextureLoader().load([
            'img/px_50.png',
            'img/nx_50.png',
            'img/py_50.png',
            'img/ny_50.png',
            'img/pz_50.png',
            'img/nz_50.png',
        ])
        envTexture.mapping = THREE.CubeReflectionMapping

        const material = new THREE.MeshPhysicalMaterial({
            // color: 0xffffff,
            envMap: envTexture,
            metalness: 0.25,
            roughness: 0.5,
            opacity: 1.0,
            transparent: true,
            transmission: 0.99,
            clearcoat: 1.0,
            clearcoatRoughness: 0.25,
            fog: true,
        })
        this.mesh = new THREE.Mesh(geometry, material)
    }

    loadMesh() {
        this.scene.add(this.mesh)
    }

    appendElements() {
        this.placeholder.appendChild(this.renderer.domElement)
        this.placeholder.appendChild(this.stats.dom)
    }

    loadModel(type, url) {
        let loader
        switch (type) {
            case STLLoader.TAG:
                loader = new STLLoader()
                loader.load(
                    url,
                    geometry => {
                        this.initMesh(geometry)
                        this.fitCameraToMesh()

                        this.loadLights()
                        this.loadMesh()
                    },
                    xhr => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
                    error => console.log(error),
                )
                break
            case ObjLoader.TAG:
                loader = new ObjLoader()
                loader.load(
                    url,
                    mesh => {
                        mesh.castShadow = true
                        mesh.receiveShadow = true

                        this.mesh = mesh

                        this.loadGround()
                        this.fitCameraToMesh()

                        this.loadLights()
                        this.loadMesh()
                    },
                    xhr => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
                    error => console.log(error),
                )
                break
            case FBXLoader.TAG:
                loader = new FBXLoader()
                loader.load(
                    url,
                    mesh => {
                        this.camera.position.set(0.8, 1.4, 1.0)
                        // this.light.position.set(0.8, 1.4, 1.0)

                        mesh.castShadow = true
                        mesh.receiveShadow = true
                        this.mesh = mesh

                        this.loadGround()
                        this.fitCameraToMesh()

                        this.loadLights()
                        this.loadMesh()
                    },
                    xhr => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
                    error => console.log(error),
                )
                break
            case PYLLoader.TAG:
                loader = new PYLLoader()
                loader.load(
                    url,
                    geometry => {
                        geometry.computeVertexNormals()

                        const material = new THREE.MeshStandardMaterial({color: 0x0055ff, flatShading: true})
                        const mesh = new THREE.Mesh(geometry, material)

                        mesh.position.x = -0.2
                        mesh.position.y = 0.5
                        mesh.position.z = -0.2
                        mesh.scale.multiplyScalar(0.0006)

                        mesh.castShadow = true
                        mesh.receiveShadow = true

                        this.mesh = mesh

                        this.loadGround()
                        this.fitCameraToMesh()

                        this.loadLights()
                        this.loadMesh()
                    },
                    xhr => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
                    error => console.log(error),
                )
                break
            default:
                throw new Error(`InvalidChartType: ${type} not supported`)
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate())

        this.controls.update()

        this.render()

        this.stats.update()
    }

    render() {
        this.renderer.render(this.scene, this.camera)
    }

    onResize(entries) {
        this.camera.aspect = this.placeholder.offsetWidth / this.placeholder.offsetHeight
        this.camera.updateProjectionMatrix()

        this.renderer.setSize(this.placeholder.offsetWidth, this.placeholder.offsetHeight)

        this.render()
    }

    fitCameraToMesh(fitOffset) {
        fitOffset = fitOffset ?? 1.2
        const box = new THREE.Box3()
        box.makeEmpty()
        box.expandByObject(this.mesh)

        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        box.getSize(size)
        box.getCenter(center)

        const maxSize = Math.max(size.x, size.y, size.z)
        const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * this.camera.fov / 360))
        const fitWidthDistance = fitHeightDistance / this.camera.aspect
        const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance)

        const direction = this.controls.target.clone()
            .sub(this.camera.position)
            .normalize()
            .multiplyScalar(distance)

        this.controls.maxDistance = distance * 10
        this.controls.target.copy(center)

        this.camera.near = distance / 100
        this.camera.far = distance * 100
        this.camera.updateProjectionMatrix()

        this.camera.position.copy(this.controls.target).sub(direction)

        this.controls.update()
    }
}