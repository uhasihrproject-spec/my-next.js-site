"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import type { Object3D } from "three";

function Phone({ tilt, scale }: { tilt: [number, number]; scale: number }) {
  const phoneRef = useRef<Object3D>(null);
  const gltf = useGLTF("/phone.glb");

  useFrame(() => {
    if (phoneRef.current) {
      phoneRef.current.rotation.x += (tilt[1] - phoneRef.current.rotation.x) * 0.05;
      phoneRef.current.rotation.y += (tilt[0] - phoneRef.current.rotation.y) * 0.05;
      phoneRef.current.scale.set(scale, scale, scale);
    }
  });

  return <primitive ref={phoneRef} object={gltf.scene} position={[0, 0, 0]} />;
}

export default function PhoneHero() {
  const [tilt, setTilt] = useState<[number, number]>([0, 0]);
  const [scale, setScale] = useState<number>(35); // Bigger initial scale

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setTilt([
        (e.clientX / window.innerWidth - 0.5) * 0.25,
        (e.clientY / window.innerHeight - 0.5) * -0.25,
      ]);
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newScale = Math.min(35 + scrollY / 40, 50); // zoom in on scroll, max 50
      setScale(newScale);
    };

    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="w-full h-screen flex justify-between items-center px-10 md:px-20 relative overflow-hidden  bg-gray-950/90">
      {/* Left Text */}
      <div className="z-10 max-w-lg text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Experience Crypto at Your Fingertips
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-6">
          Manage, trade, and track all your digital assets in one sleek mobile app. 
          Full control, full transparency.
        </p>
        <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-black font-semibold rounded-lg hover:scale-105 transition-transform">
          Sign Up
        </button>
      </div>

      {/* Right Phone */}
      <div className="w-1/2 h-full relative">
        {/* Glow behind phone */}
        <div className="absolute top-1/2 left-1/2 w-[70%] h-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400 opacity-15 blur-3xl z-0"></div>

        <Canvas className="w-full h-full z-10" camera={{ position: [0, 0, 25], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <directionalLight position={[-5, -5, 5]} intensity={1} />

          <Phone tilt={tilt} scale={scale} />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            rotateSpeed={0.5}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={(3 * Math.PI) / 4}
          />
        </Canvas>
      </div>
    </div>
  );
}
