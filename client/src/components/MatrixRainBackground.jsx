import React, { useEffect, useRef } from 'react';

/**
 * MatrixRainBackground Component
 * Renders a high-performance, responsive HTML5 canvas background featuring
 * cascading crimson/red discount & luxury sale tokens of varying sizes and speeds.
 */
function MatrixRainBackground({ opacity = 0.65, speedMultiplier = 1 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Custom sale and luxury tokens with Rupee symbols
    const saleWords = [
      'SALE',
      '80% OFF',
      '-₹500',
      '50% OFF',
      '70% OFF',
      '-₹1000',
      'RØUGE',
      'VAULT',
      '-40%',
      '90% OFF',
      '-₹2000',
      'VIP',
      'LIMITED',
      'DEAL',
      '-60%',
      '-₹750',
      'CODE:RED',
      '₹₹₹',
      '-75%',
      'DROP',
      '-15%',
      'HOT',
      'EXCLUSIVE',
      '-₹5000',
      'CYBER',
      '-35%',
      '85% OFF'
    ];

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Responsive columns
    const columnCount = Math.floor(width / 32);
    const columns = [];

    // Initialize columns with randomized sizes, speeds, and word sequences
    for (let i = 0; i < columnCount; i++) {
      columns.push({
        x: i * 32 + (Math.random() * 8 - 4),
        y: Math.random() * -height * 1.5,
        speed: (Math.random() * 1.5 + 0.6) * speedMultiplier,
        fontSize: Math.floor(Math.random() * 11) + 10, // 10px to 20px
        opacity: Math.random() * 0.6 + 0.35,
        word: saleWords[Math.floor(Math.random() * saleWords.length)],
        charIndex: 0,
        switchInterval: Math.floor(Math.random() * 20) + 10,
        tick: 0,
        isBold: Math.random() > 0.65,
        layer: Math.random() > 0.7 ? 'front' : 'back'
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const newCount = Math.floor(width / 32);
      while (columns.length < newCount) {
        columns.push({
          x: columns.length * 32,
          y: Math.random() * -height,
          speed: (Math.random() * 1.5 + 0.6) * speedMultiplier,
          fontSize: Math.floor(Math.random() * 11) + 10,
          opacity: Math.random() * 0.6 + 0.35,
          word: saleWords[Math.floor(Math.random() * saleWords.length)],
          charIndex: 0,
          switchInterval: Math.floor(Math.random() * 20) + 10,
          tick: 0,
          isBold: Math.random() > 0.65,
          layer: Math.random() > 0.7 ? 'front' : 'back'
        });
      }
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      // Semi-transparent fade background to create the iconic trailing trail effect
      ctx.fillStyle = 'rgba(5, 5, 7, 0.16)';
      ctx.fillRect(0, 0, width, height);

      // Render matrix streams
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];

        ctx.font = `${col.isBold ? '700' : '500'} ${col.fontSize}px 'Space Grotesk', 'Courier New', monospace`;

        // Pick next character from current word sequence
        const char = col.word[col.charIndex % col.word.length];

        // Glow color styling
        if (col.layer === 'front') {
          // Bright leading head character with crimson neon glow
          ctx.shadowColor = '#ff2b4f';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#ff8fa3';
        } else {
          ctx.shadowColor = '#e11d48';
          ctx.shadowBlur = 4;
          ctx.fillStyle = `rgba(239, 68, 68, ${col.opacity})`;
        }

        ctx.fillText(char, col.x, col.y);

        // Reset shadow for performance
        ctx.shadowBlur = 0;

        // Move downward
        col.y += col.fontSize * 1.25 + col.speed;
        col.charIndex++;
        col.tick++;

        // Periodically mutate or change word token
        if (col.tick > col.switchInterval) {
          col.word = saleWords[Math.floor(Math.random() * saleWords.length)];
          col.tick = 0;
          if (Math.random() > 0.8) {
            col.fontSize = Math.floor(Math.random() * 11) + 10;
          }
        }

        // Reset if reached bottom
        if (col.y > height + 50) {
          col.y = Math.random() * -120;
          col.speed = (Math.random() * 1.5 + 0.6) * speedMultiplier;
          col.word = saleWords[Math.floor(Math.random() * saleWords.length)];
          col.charIndex = 0;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [speedMultiplier]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Cinematic Dark Vignette & Radial Glow Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(225,29,72,0.12)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,5,7,0.85)_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/30 via-transparent to-[#050507] pointer-events-none" />
    </div>
  );
}

export default MatrixRainBackground;