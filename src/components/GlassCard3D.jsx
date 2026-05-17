// components/GlassCard3D.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function GlassCard3D({ children, className, gradient, onClick, ...props }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowOpacity, setGlowOpacity] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXValue = ((y - centerY) / centerY) * 10;
    const rotateYValue = ((x - centerX) / centerX) * 10;
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
    setGlowOpacity(0.15);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlowOpacity(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.1s ease-out',
      }}
      {...props}
    >
      <div
        style={{
          background: gradient || 'white',
          borderRadius: 24,
          padding: 24,
          boxShadow: `
            0 20px 40px rgba(0,0,0,0.1),
            0 0 0 1px rgba(236,72,153,0.1),
            inset 0 1px 0 rgba(255,255,255,0.5)
          `,
          position: 'relative',
          overflow: 'hidden',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'box-shadow 0.3s ease',
        }}
        onClick={onClick}
      >
        {/* Glow effect on hover */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '150%',
            height: '150%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.3), transparent)',
            transform: 'translate(-50%, -50%)',
            opacity: glowOpacity,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          }}
        />
        
        {/* Shimmer effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            animation: 'shimmer 3s infinite',
          }}
        />
        
        {children}
      </div>
    </motion.div>
  );
}