import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';
import { MobileControls } from './MobileControls';

export function GameComponent({ playerClass }: { playerClass: 'vanguard' | 'rogue' }) {
  const darkMode = document.documentElement.getAttribute('data-theme') === 'dark';
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current && !phaserGameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: gameRef.current,
        // Scale to fill the container while preserving aspect ratio
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: '100%',
          height: '100%',
        },
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
          }
        },
        scene: [MainScene],
        backgroundColor: darkMode ? '#0b120b' : '#f1f5f1',
      };

      phaserGameRef.current = new Phaser.Game(config);
      phaserGameRef.current.scene.start('MainScene', { playerClass, darkMode });
    }

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 0 }}>
      <div ref={gameRef} style={{ width: '100%', height: '100%' }} />
      <MobileControls />
    </div>
  );
}
