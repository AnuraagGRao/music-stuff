import { useEffect, useRef, useState } from 'react';

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  height?: number;
  barCount?: number;
  barColor?: string;
  className?: string;
}

export default function AudioVisualizer({
  audioElement,
  isPlaying,
  height = 60,
  barCount = 40,
  barColor = 'rgba(139, 92, 246, 0.8)',
  className = '',
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Initialize audio context and analyser
  useEffect(() => {
    if (!audioElement) return;

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 256;
      
      const source = ctx.createMediaElementSource(audioElement);
      source.connect(analyserNode);
      analyserNode.connect(ctx.destination);

      setAnalyser(analyserNode);

      return () => {
        source.disconnect();
        analyserNode.disconnect();
        ctx.close();
      };
    } catch (error) {
      console.warn('Audio visualization not supported:', error);
    }
  }, [audioElement]);

  // Animation loop
  useEffect(() => {
    if (!analyser || !canvasRef.current || !isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlaying) return;
      
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / barCount;
      const spacing = barWidth * 0.2;
      const actualBarWidth = barWidth - spacing;

      for (let i = 0; i < barCount; i++) {
        // Sample frequency data evenly across the spectrum
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const value = dataArray[dataIndex];
        const barHeight = (value / 255) * canvas.height;

        const x = i * barWidth;
        const y = canvas.height - barHeight;

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
        gradient.addColorStop(0, barColor);
        gradient.addColorStop(1, barColor.replace('0.8', '0.3'));

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, actualBarWidth, barHeight);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying, barCount, barColor, height]);

  // Idle animation when not playing
  useEffect(() => {
    if (isPlaying || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const idleAnimation = () => {
      animationRef.current = requestAnimationFrame(idleAnimation);
      frame++;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / barCount;
      const spacing = barWidth * 0.2;
      const actualBarWidth = barWidth - spacing;

      for (let i = 0; i < barCount; i++) {
        // Create a wave pattern
        const wave = Math.sin((i / barCount) * Math.PI * 4 + frame * 0.05);
        const barHeight = ((wave + 1) / 2) * canvas.height * 0.3;

        const x = i * barWidth;
        const y = canvas.height - barHeight;

        ctx.fillStyle = barColor.replace('0.8', '0.2');
        ctx.fillRect(x, y, actualBarWidth, barHeight);
      }
    };

    idleAnimation();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, barCount, barColor]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={height}
      className={`w-full rounded ${className}`}
      style={{ height: `${height}px` }}
    />
  );
}
