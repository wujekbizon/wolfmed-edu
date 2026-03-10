export default function GradientOverlay() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-0 animate-fadeInUp">
        <div className="absolute inset-0 animate-gradientPosition bg-linear-to-r from-[#ff5b5b]/40 via-purple-500/25 to-[#ff5b5b]/40 bg-size-[200%_200%]" />
      </div>
      <div className="absolute inset-0">
        <div className="absolute inset-0 animate-gradientRotate bg-linear-to-r from-[#ff5b5b]/30 via-[#3b82f6]/18 to-[#ff5b5b]/30" />
      </div>
      <div className="absolute inset-0">
        <div className="absolute inset-0 animate-radialPulse bg-[radial-gradient(circle_at_20%_20%,rgba(255,91,91,0.30),rgba(147,51,234,0.14)_50%,transparent_70%)]" />
      </div>
      <div className="absolute inset-0">
        <div className="absolute inset-0 animate-radialPulse [animation-delay:-4s] bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.20),rgba(255,91,91,0.22)_50%,transparent_70%)]" />
      </div>
    </div>
  )
}
