import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const TextCursor = ({
  text = ['🎬', '🎭', '🎞️', '🍿', '⭐', '🎥'],
  spacing = 100,
  followMouseDirection = true,
  randomFloat = true,
  exitDuration = 0.5,
  removalInterval = 30,
  maxPoints = 5
}) => {
  const [trail, setTrail] = useState([]);
  const containerRef = useRef(null);
  const lastMoveTimeRef = useRef(Date.now());
  const idCounter = useRef(0);
  // Keep latest prop values accessible inside stable callbacks
  const textRef = useRef(text);
  const spacingRef = useRef(spacing);
  const followRef = useRef(followMouseDirection);
  const floatRef = useRef(randomFloat);
  const maxPointsRef = useRef(maxPoints);

  useEffect(() => { textRef.current = text; }, [text]);
  useEffect(() => { spacingRef.current = spacing; }, [spacing]);
  useEffect(() => { followRef.current = followMouseDirection; }, [followMouseDirection]);
  useEffect(() => { floatRef.current = randomFloat; }, [randomFloat]);
  useEffect(() => { maxPointsRef.current = maxPoints; }, [maxPoints]);

  const pickText = useCallback(() => {
    const pool = Array.isArray(textRef.current) ? textRef.current : [textRef.current];
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  const handleMouseMove = useCallback(e => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const createRandomData = () =>
      floatRef.current
        ? {
            randomX: Math.random() * 10 - 5,
            randomY: Math.random() * 10 - 5,
            randomRotate: Math.random() * 10 - 5
          }
        : {};

    setTrail(prev => {
      const newTrail = [...prev];

      if (newTrail.length === 0) {
        newTrail.push({
          id: idCounter.current++,
          x: mouseX,
          y: mouseY,
          angle: 0,
          text: pickText(),
          ...createRandomData()
        });
      } else {
        const last = newTrail[newTrail.length - 1];
        const dx = mouseX - last.x;
        const dy = mouseY - last.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance >= spacingRef.current) {
          const rawAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
          const computedAngle = followRef.current ? rawAngle : 0;
          const steps = Math.floor(distance / spacingRef.current);

          for (let i = 1; i <= steps; i++) {
            const t = (spacingRef.current * i) / distance;
            newTrail.push({
              id: idCounter.current++,
              x: last.x + dx * t,
              y: last.y + dy * t,
              angle: computedAngle,
              text: pickText(),
              ...createRandomData()
            });
          }
        }
      }

      const max = maxPointsRef.current;
      return newTrail.length > max ? newTrail.slice(newTrail.length - max) : newTrail;
    });

    lastMoveTimeRef.current = Date.now();
  }, [pickText]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastMoveTimeRef.current > 100) {
        setTrail(prev => (prev.length > 0 ? prev.slice(1) : prev));
      }
    }, removalInterval);
    return () => clearInterval(interval);
  }, [removalInterval]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {trail.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.5, rotate: item.angle }}
              animate={{
                opacity: 1,
                scale: 1,
                x: randomFloat ? [0, item.randomX || 0, 0] : 0,
                y: randomFloat ? [0, item.randomY || 0, 0] : 0,
                rotate: randomFloat
                  ? [item.angle, item.angle + (item.randomRotate || 0), item.angle]
                  : item.angle
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                opacity: { duration: exitDuration, ease: 'easeOut' },
                scale: { duration: 0.15, ease: 'easeOut' },
                ...(randomFloat && {
                  x: { duration: 2, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' },
                  y: { duration: 2, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' },
                  rotate: { duration: 2, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }
                })
              }}
              className="absolute select-none whitespace-nowrap text-3xl"
              style={{ left: item.x, top: item.y }}
            >
              {item.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TextCursor;
