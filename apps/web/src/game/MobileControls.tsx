import { useEffect, useRef } from 'react';
import { virtualKeys } from './virtualKeys';

const BTN = {
  background: 'rgba(34,197,94,0.15)',
  border: '2px solid rgba(34,197,94,0.6)',
  borderRadius: '50%',
  color: '#22c55e',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  userSelect: 'none' as const,
  WebkitUserSelect: 'none' as const,
  touchAction: 'none' as const,
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '0.75rem',
  fontFamily: 'monospace',
  letterSpacing: '0.05em',
};

function ActionButton({
  label,
  onStart,
  onEnd,
  color = '#22c55e',
  size = 60,
}: {
  label: string;
  onStart: () => void;
  onEnd: () => void;
  color?: string;
  size?: number;
}) {
  return (
    <div
      onPointerDown={e => { e.preventDefault(); onStart(); }}
      onPointerUp={e => { e.preventDefault(); onEnd(); }}
      onPointerLeave={e => { e.preventDefault(); onEnd(); }}
      onPointerCancel={e => { e.preventDefault(); onEnd(); }}
      style={{
        ...BTN,
        width: size,
        height: size,
        borderColor: `${color}99`,
        background: `${color}22`,
        color,
      }}
    >
      {label}
    </div>
  );
}

export function MobileControls() {
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activePointer = useRef<number | null>(null);
  const basePos = useRef({ x: 0, y: 0 });
  const RADIUS = 50;

  // Only show on touch devices
  if (!('ontouchstart' in window)) return null;

  const resetJoystick = () => {
    virtualKeys.up = false;
    virtualKeys.down = false;
    virtualKeys.left = false;
    virtualKeys.right = false;
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(-50%, -50%)';
    }
  };

  const handleJoystickMove = (clientX: number, clientY: number) => {
    const base = basePos.current;
    const dx = clientX - base.x;
    const dy = clientY - base.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(dist, RADIUS);
    const angle = Math.atan2(dy, dx);
    const nx = Math.cos(angle) * clampedDist;
    const ny = Math.sin(angle) * clampedDist;

    if (knobRef.current) {
      knobRef.current.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
    }

    // Dead zone
    const threshold = 0.3;
    const normX = dx / RADIUS;
    const normY = dy / RADIUS;
    virtualKeys.left  = normX < -threshold;
    virtualKeys.right = normX > threshold;
    virtualKeys.up    = normY < -threshold;
    virtualKeys.down  = normY > threshold;
  };

  useEffect(() => {
    const el = joystickRef.current;
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      e.preventDefault();
      if (activePointer.current !== null) return;
      const touch = e.changedTouches[0];
      activePointer.current = touch.identifier;
      const rect = el.getBoundingClientRect();
      basePos.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      handleJoystickMove(touch.clientX, touch.clientY);
    };

    const onMove = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === activePointer.current) {
          handleJoystickMove(t.clientX, t.clientY);
        }
      }
    };

    const onEnd = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activePointer.current) {
          activePointer.current = null;
          resetJoystick();
        }
      }
    };

    el.addEventListener('touchstart', onStart, { passive: false });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: false });
    el.addEventListener('touchcancel', onEnd, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, []);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 50,
    }}>
      {/* LEFT: Joystick */}
      <div
        ref={joystickRef}
        style={{
          position: 'absolute',
          bottom: 36,
          left: 36,
          width: 110,
          height: 110,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.25)',
          border: '2px solid rgba(34,197,94,0.4)',
          pointerEvents: 'auto',
          touchAction: 'none',
        }}
      >
        {/* Knob */}
        <div
          ref={knobRef}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(34,197,94,0.7)',
            transform: 'translate(-50%, -50%)',
            transition: 'none',
            pointerEvents: 'none',
            boxShadow: '0 0 12px rgba(34,197,94,0.5)',
          }}
        />
      </div>

      {/* RIGHT: Action Buttons */}
      <div style={{
        position: 'absolute',
        bottom: 36,
        right: 36,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        alignItems: 'center',
        pointerEvents: 'auto',
      }}>
        <ActionButton
          label="ATTACK"
          color="#22c55e"
          size={64}
          onStart={() => { virtualKeys.attack = true; }}
          onEnd={() => { virtualKeys.attack = false; }}
        />
        <ActionButton
          label="DODGE"
          color="#a855f7"
          size={56}
          onStart={() => { virtualKeys.dodge = true; }}
          onEnd={() => { virtualKeys.dodge = false; }}
        />
      </div>
    </div>
  );
}
