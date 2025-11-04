import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// This is the individual 3D box component
function Box(props) {
    // This hook gives us a ref object, so we can access the <mesh>
    const meshRef = useRef();

    // This hook runs on every single frame (like a game loop)
    useFrame((state, delta) => {
        // Rotate the mesh slightly on each frame
        meshRef.current.rotation.x += delta * 0.2;
        meshRef.current.rotation.y += delta * 0.2;
    });

    return (
        <mesh
            {...props} // Apply props like position
            ref={meshRef} // Attach the ref
        >
            <boxGeometry args={[1, 1, 1]} /> {/* The shape: a 1x1x1 cube */}
            <meshStandardMaterial color={props.color} roughness={0.5} />
        </mesh>
    );
}

// This is our main 3D scene
const Scene3D = () => {
    return (
        <Canvas 
            camera={{ position: [0, 0, 10], fov: 50 }} 
            style={{ 
                position: 'fixed', // Fixed to cover the whole screen
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                zIndex: -1 // Put it BEHIND all other content
            }}
        >
            {/* Add some lights */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.8} />

            {/* Add multiple boxes in different positions */}
            <Box position={[-5, 3, -2]} color="#6e8efb" />
            <Box position={[5, -3, 0]} color="#a777e3" />
            <Box position={[4, 4, 2]} color="#f0ad4e" />
            <Box position={[-3, -3, 3]} color="#5bc0de" />
            <Box position={[0, 0, 0]} color="#d9534f" />
            
            {/* This lets you drag to rotate the scene */}
            <OrbitControls 
                enableZoom={false} 
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.5}
            />
        </Canvas>
    );
};

export default Scene3D;