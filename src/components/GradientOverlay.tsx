export default function GradientOverlay() {
  return (
    <>
      {/* Base gradient layer with combined position and scale animation */}
      <div className="absolute inset-0 opacity-0 animate-fadeInUp">
        <div className="absolute inset-0 animate-gradientPosition bg-linear-to-r from-[#ff5b5b]/20 via-purple-500/10 to-[#ff5b5b]/20 bg-size-[200%_200%]" />
      </div>

      {/* Rotating gradient overlay with opacity transitions */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 animate-gradientRotate bg-linear-to-r from-[#ff5b5b]/15 via-[#3b82f6]/10 to-[#ff5b5b]/15" />
      </div>

      {/* Primary radial gradient with pulse */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 animate-radialPulse bg-[radial-gradient(circle_at_20%_20%,rgba(255,91,91,0.15),rgba(147,51,234,0.05)_50%,transparent_70%)]" />
      </div>

      {/* Secondary radial gradient with offset pulse */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 animate-radialPulse [animation-delay:-4s] bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.1),rgba(255,91,91,0.1)_50%,transparent_70%)]" />
      </div>
    </>
  )
}
