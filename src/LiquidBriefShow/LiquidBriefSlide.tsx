import { AbsoluteFill, useCurrentFrame, Easing } from 'remotion';
import React from 'react';

interface LiquidBriefSlideProps {
  title: string;
  subtitle: string;
  badge: string;
  items: Array<{ number: string; title: string; color?: string }>;
  index: number;
  totalSlides: number;
}

const defaultColors = ['#ffb6c1', '#a8e6cf', '#ffd3b6'];

export const LiquidBriefSlide: React.FC<LiquidBriefSlideProps> = ({
  title,
  subtitle,
  badge,
  items,
  index,
  totalSlides,
}) => {
  const frame = useCurrentFrame();

  // Card entrance animation
  const cardProgress = Math.min(frame / 25, 1);
  const cardEased = Easing.out(Easing.cubic)(cardProgress);
  const cardY = (1 - cardEased) * 60;
  const cardOpacity = cardEased;
  const cardScale = 0.95 + cardEased * 0.05;

  // Title entrance
  const titleProgress = Math.min(Math.max((frame - 6) / 20, 0), 1);
  const titleEased = Easing.out(Easing.cubic)(titleProgress);
  const titleY = (1 - titleEased) * 25;
  const titleOpacity = titleEased;

  // Subtitle entrance
  const subtitleProgress = Math.min(Math.max((frame - 16) / 18, 0), 1);
  const subtitleOpacity = subtitleProgress;

  // Underline animation
  const underlineProgress = Math.min(Math.max((frame - 10) / 14, 0), 1);
  const underlineEased = Easing.out(Easing.cubic)(underlineProgress);
  const underlineScaleX = underlineEased;

  // Items staggered entrance
  const getItemAnimation = (itemIndex: number) => {
    const delay = 26 + itemIndex * 8;
    const itemProgress = Math.min(Math.max((frame - delay) / 18, 0), 1);
    const itemEased = Easing.out(Easing.cubic)(itemProgress);

    return {
      y: (1 - itemEased) * 30,
      opacity: itemProgress,
      scale: 0.97 + itemEased * 0.03,
    };
  };

  const currentSlide = String(index + 1).padStart(2, '0');
  const totalSlidesStr = String(totalSlides).padStart(2, '0');

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 36px',
        position: 'relative',
        overflow: 'hidden',
        background: `
          linear-gradient(145deg,
            rgba(255, 192, 203, 0.55) 0%,
            rgba(230, 230, 250, 0.65) 35%,
            rgba(200, 220, 240, 0.55) 70%,
            rgba(176, 224, 230, 0.45) 100%
          )
        `,
      }}
    >
      {/* Soft gradient orbs - larger and more diffuse */}
      <div
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 182, 193, 0.5) 0%, transparent 65%)',
          top: -250,
          left: -200,
          filter: 'blur(80px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200, 180, 255, 0.4) 0%, transparent 65%)',
          top: -150,
          right: -150,
          filter: 'blur(70px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(180, 220, 230, 0.45) 0%, transparent 65%)',
          bottom: -200,
          left: '15%',
          filter: 'blur(70px)',
        }}
      />

      {/* Main glass card - larger and more spacious */}
      <div
        style={{
          width: '100%',
          maxWidth: 900,
          background: 'rgba(255, 255, 255, 0.78)',
          borderRadius: 36,
          padding: '56px 52px',
          boxShadow: `
            0 12px 48px rgba(0, 0, 0, 0.08),
            0 4px 12px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.9)
          `,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          transform: `translateY(${cardY}px) scale(${cardScale})`,
          opacity: cardOpacity,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header section */}
        <div style={{ marginBottom: 40 }}>
          {/* Top row: badge and counter */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 28,
            }}
          >
            {/* Badge */}
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: '#94a3b8',
                textTransform: 'uppercase',
              }}
            >
              {badge}
            </span>

            {/* Page counter */}
            <span
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: '#64748b',
                background: 'rgba(241, 245, 249, 0.9)',
                padding: '8px 16px',
                borderRadius: 24,
              }}
            >
              {currentSlide} / {totalSlidesStr}
            </span>
          </div>

          {/* Title - much larger */}
          <h1
            style={{
              fontSize: 76,
              fontWeight: 900,
              lineHeight: 1.12,
              color: '#1e293b',
              margin: '0 0 20px 0',
              transform: `translateY(${titleY}px)`,
              opacity: titleOpacity,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h1>

          {/* Gradient underline - thicker */}
          <div
            style={{
              width: 140,
              height: 8,
              background: 'linear-gradient(90deg, #ff9a9e 0%, #a8edea 50%, #fed6e3 100%)',
              borderRadius: 4,
              marginBottom: 20,
              transform: `scaleX(${underlineScaleX})`,
              transformOrigin: 'left',
            }}
          />

          {/* Subtitle - larger */}
          <p
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: '#64748b',
              margin: 0,
              lineHeight: 1.5,
              opacity: subtitleOpacity,
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Items list - larger gaps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {items.map((item, i) => {
            const anim = getItemAnimation(i);
            const color = item.color || defaultColors[i % defaultColors.length];

            return (
              <div
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  borderRadius: 24,
                  padding: '28px 32px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24,
                  boxShadow: `
                    0 4px 12px rgba(0, 0, 0, 0.04),
                    inset 0 1px 0 rgba(255, 255, 255, 0.95)
                  `,
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  transform: `translateY(${anim.y}px) scale(${anim.scale})`,
                  opacity: anim.opacity,
                }}
              >
                {/* Circular number badge - much larger */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${color} 0%, ${color}ee 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontWeight: 800,
                    color: '#1e293b',
                    flexShrink: 0,
                    boxShadow: `0 4px 16px ${color}60`,
                  }}
                >
                  {item.number}
                </div>

                {/* Item title - much larger */}
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: '#334155',
                    flex: 1,
                    lineHeight: 1.3,
                  }}
                >
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
