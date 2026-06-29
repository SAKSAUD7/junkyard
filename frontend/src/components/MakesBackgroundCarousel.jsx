import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls, Text, Float, Html, useProgress } from '@react-three/drei';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// ─── Explicit model map: DB make name -> file path + display scale/position
const MODEL_SLIDES = [
    { makeName: 'Acura',         file: '/models/acura.glb',        scale: 1.8,  posY: -1.0 },
    { makeName: 'Alfa Romeo',    file: '/models/alfaromeo.glb',    scale: 1.5,  posY: -1.0 },
    { makeName: 'Audi',         file: '/models/audi.glb',          scale: 1.5,  posY: -1.0 },
    { makeName: 'BMW',          file: '/models/bmw.glb',           scale: 1.5,  posY: -1.0 },
    { makeName: 'Chrysler',     file: '/models/chrysler.glb',      scale: 2.0,  posY: -1.0 },
    { makeName: 'Daewoo',       file: '/models/daewoo.glb',        scale: 1.8,  posY: -1.0 },
    { makeName: 'Daihatsu',     file: '/models/daihatsu.glb',      scale: 1.8,  posY: -1.0 },
    { makeName: 'Ford',         file: '/models/ford.glb',          scale: 1.5,  posY: -1.0 },
    { makeName: 'Hummer',       file: '/models/hummer.glb',        scale: 1.2,  posY: -1.0 },
    { makeName: 'Hyundai',      file: '/models/hyundai.glb',       scale: 1.6,  posY: -1.0 },
    { makeName: 'Jaguar',       file: '/models/jaguar.glb',        scale: 1.6,  posY: -1.0 },
    { makeName: 'Lamborghini',  file: '/models/huracan_eagletm.glb', scale: 1.5, posY: -1.0 },
    { makeName: 'Mercedes Benz', file: '/models/mercedesbenz.glb', scale: 1.5,  posY: -1.0 },
    { makeName: 'Porsche',      file: '/models/porsche.glb',       scale: 1.6,  posY: -1.0 },
    { makeName: 'Volvo',        file: '/models/volvo.glb',         scale: 1.4,  posY: -1.0 },
    { makeName: 'Yugo',         file: '/models/yugo.glb',          scale: 1.8,  posY: -1.0 },
];

// ─── Loading indicator inside canvas
function LoadingIndicator() {
    const { progress } = useProgress();
    return (
        <Html center>
            <div style={{
                color: '#3b82f6', fontFamily: "'Outfit', sans-serif",
                textAlign: 'center', userSelect: 'none',
            }}>
                <div style={{
                    width: 48, height: 48, border: '4px solid #e2e8f0',
                    borderTopColor: '#3b82f6', borderRadius: '50%',
                    margin: '0 auto 12px',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: '#64748b' }}>
                    Loading {Math.round(progress)}%
                </div>
            </div>
        </Html>
    );
}

// ─── Camera auto-framer: centres camera on the loaded model's bounding box
function CameraRig({ modelRef }) {
    const { camera } = useThree();
    useEffect(() => {
        if (!modelRef.current) return;
        const box = new THREE.Box3().setFromObject(modelRef.current);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        const maxDim = Math.max(size.x, size.y, size.z);
        const dist = maxDim * 2.5;
        camera.position.set(center.x, center.y + size.y * 0.3, center.z + dist);
        camera.lookAt(center);
        camera.near = 0.01;
        camera.far = dist * 10;
        camera.updateProjectionMatrix();
    });
    return null;
}

// ─── Car GLTF loader with auto-rotate
function CarModel({ file, scale, posY, onLoaded }) {
    const { scene } = useGLTF(file);
    const ref = useRef();

    useEffect(() => {
        if (scene) {
            // Enable shadows on all meshes
            scene.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            onLoaded && onLoaded();
        }
    }, [scene]);

    useFrame((_, delta) => {
        if (ref.current) ref.current.rotation.y += delta * 0.25;
    });

    return (
        <>
            <CameraRig modelRef={ref} />
            <primitive ref={ref} object={scene} scale={scale} position={[0, posY, 0]} />
        </>
    );
}

// ─── Error Boundary: shows nothing while we switch, then falls back
class ModelErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidUpdate(prev) {
        if (prev.slideKey !== this.props.slideKey) this.setState({ hasError: false });
    }
    render() {
        if (this.state.hasError) return null; // hide silently — all slides in our list have files
        return this.props.children;
    }
}

// ─── Main exported component
export default function Makes3DBackground() {
    const [active, setActive] = useState(0);
    const [transitioning, setTransitioning] = useState(false);
    const total = MODEL_SLIDES.length;

    const goTo = useCallback((idx) => {
        if (transitioning) return;
        setTransitioning(true);
        setTimeout(() => { setActive(idx); setTransitioning(false); }, 400);
    }, [transitioning]);

    const next = useCallback(() => goTo((active + 1) % total), [active, goTo, total]);
    const prev = useCallback(() => goTo((active - 1 + total) % total), [active, goTo, total]);

    // Auto-advance every 8 seconds
    useEffect(() => {
        const t = setInterval(next, 8000);
        return () => clearInterval(t);
    }, [next]);

    const slide = MODEL_SLIDES[active];

    return (
        <div className="absolute inset-0 overflow-hidden z-0" style={{ background: '#f1f5f9' }}>

            {/* ── 3D Canvas ── */}
            <div
                className="absolute inset-0"
                style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 0.4s ease' }}
            >
                <Canvas
                    shadows
                    gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
                    camera={{ position: [0, 2, 9], fov: 40 }}
                >
                    <color attach="background" args={['#f1f5f9']} />
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[6, 10, 6]} intensity={2} castShadow
                        shadow-mapSize={[2048, 2048]} />
                    <directionalLight position={[-6, 4, -4]} intensity={0.6} />

                    <Suspense fallback={<LoadingIndicator />}>
                        <Environment preset="city" />
                        <ModelErrorBoundary slideKey={`${slide.file}-${active}`}>
                            <CarModel
                                key={slide.file}
                                file={slide.file}
                                scale={slide.scale}
                                posY={slide.posY}
                            />
                        </ModelErrorBoundary>
                        <ContactShadows position={[0, -1.01, 0]} opacity={0.6} scale={20} blur={2.5} far={5} />
                    </Suspense>

                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        minPolarAngle={Math.PI / 4}
                        maxPolarAngle={Math.PI / 2.2}
                    />
                </Canvas>
            </div>

            {/* ── Subtle gradient so text and form stay readable ── */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(241,245,249,0.1) 0%, rgba(241,245,249,0.55) 85%, rgba(241,245,249,0.95) 100%)' }} />

            {/* ── Make name badge (bottom-left) ── */}
            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-10 pointer-events-none">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">Now Viewing</p>
                <h2
                    key={slide.makeName}
                    className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-slate-700"
                    style={{ fontFamily: "'Outfit', sans-serif", textShadow: '0 2px 20px rgba(0,0,0,0.1)' }}
                >
                    {slide.makeName}
                </h2>
            </div>

            {/* ── Prev / Next Arrows ── */}
            <button
                onClick={prev}
                aria-label="Previous model"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 focus:outline-none"
                style={{ background: 'rgba(30,41,59,0.12)', border: '1px solid rgba(30,41,59,0.15)', backdropFilter: 'blur(8px)' }}
            >
                <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={next}
                aria-label="Next model"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 focus:outline-none"
                style={{ background: 'rgba(30,41,59,0.12)', border: '1px solid rgba(30,41,59,0.15)', backdropFilter: 'blur(8px)' }}
            >
                <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* ── Dot indicators ── */}
            <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-1.5 items-end">
                {MODEL_SLIDES.map((s, i) => (
                    <button
                        key={s.makeName}
                        onClick={() => goTo(i)}
                        aria-label={s.makeName}
                        title={s.makeName}
                        className="transition-all rounded-full focus:outline-none"
                        style={{
                            width: i === active ? 28 : 8,
                            height: 8,
                            background: i === active ? '#3b82f6' : 'rgba(30,41,59,0.25)',
                        }}
                    />
                ))}
            </div>

            {/* Spinning CSS animation required by LoadingIndicator */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
