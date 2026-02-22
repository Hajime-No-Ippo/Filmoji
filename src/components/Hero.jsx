import MoodInput from './MoodInput'
import WaveDivider from './WaveDivider'

function Hero() {
  return (
    <section className="relative">
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/bg-video.mp4" type="video/mp4" />
        </video>

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-[#0d0d0d]" />

        {/* Content */}
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-light tracking-[0.15em] text-white mb-4">
            FILMOJI
          </h1>
          <p className="text-xs sm:text-sm md:text-base tracking-[0.2em] sm:tracking-[0.4em] uppercase text-white/80 mb-12">
            A Film Recommendation Platform
          </p>
          <MoodInput />
        </div>
      </div>
      <WaveDivider />
    </section>
  )
}

export default Hero
