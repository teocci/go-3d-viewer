/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-7월-12
 */
import STLLoader from './loaders/stl-loader.js'
import ObjLoader from './loaders/obj-loader.js'
import FBXLoader from './loaders/fbx-loader.js'
import PYLLoader from './loaders/ply-loader.js'
import OrbitControls from './controls/orbit.js'
import Stats from './modules/stats.js'

export default class Viewer {
    constructor(element) {
        this.placeholder = element

        this.initLight()
        this.initCamera()
        this.initScene()

        this.initRenderer()
        this.initControls()

        this.stats = Stats()

        this.initEventListeners()

        this.appendElements()
    }

    initLight() {
        this.light = new THREE.SpotLight()
        this.light.position.set(20, 20, 20)
    }

    initCamera() {
        const aspect = this.placeholder.offsetWidth / this.placeholder.offsetHeight
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
        this.camera.position.z = 3
    }

    initScene() {
        this.scene = new THREE.Scene()
        this.scene.add(this.light)
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer()
        this.renderer.outputEncoding = THREE.sRGBEncoding
        this.renderer.setSize(this.placeholder.offsetWidth, this.placeholder.offsetHeight)
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
            'img/nz_50.png'
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

        this.fitCameraToMesh()

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
                    geometry => this.initMesh(geometry),
                    xhr => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
                    error => console.log(error)
                )
                break
            case ObjLoader.TAG:
                loader = new ObjLoader()
                loader.load(
                    url,
                    object => this.scene.add(object),
                    xhr => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
                    error => console.log(error)
                )
                break
            case FBXLoader.TAG:
                loader = new FBXLoader()
                loader.load(
                    url,
                    object => this.scene.add(object),
                    xhr => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
                    error => console.log(error)
                )
                break
            case PYLLoader.TAG:
                loader = new STLLoader()
                loader.load(
                    url,
                    geometry => this.initMesh(geometry),
                    xhr => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
                    error => console.log(error)
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