import Image from "next/image";

export function HomeHeroArt() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(251,191,36,0.22),transparent_42%),radial-gradient(ellipse_at_0%_100%,rgba(37,99,235,0.16),transparent_40%),radial-gradient(ellipse_at_100%_90%,rgba(234,88,12,0.18),transparent_38%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.2)_0%,transparent_30%,rgba(0,0,0,0.65)_100%)]" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />

      {/* Left operative — slides in from the right (opposite), then floats */}
      <div className="animate-hero-slide-left absolute bottom-0 left-0 z-[1] h-[80%] w-[min(60vw,600px)] max-sm:h-[58%] max-sm:opacity-50 lg:h-[96%] lg:w-[48%]">
        <div className="animate-hero-float relative h-full w-full">
          <Image
            src="/ui/hero-left.png"
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 55vw, (max-width: 1024px) 50vw, 48vw"
            className="object-contain object-left-bottom brightness-110 contrast-110 drop-shadow-[0_0_55px_rgba(251,146,60,0.4)]"
          />
        </div>
      </div>

      {/* Right operative — matte + grade hide cutout fringe / low-res */}
      <div className="animate-hero-slide-right absolute bottom-0 right-0 z-[1] h-[72%] w-[min(50vw,500px)] max-sm:h-[52%] max-sm:opacity-40 lg:h-[90%] lg:w-[44%]">
        <div className="animate-hero-float-alt relative h-full w-full opacity-90 [mask-image:radial-gradient(ellipse_72%_82%_at_58%_58%,#000_28%,rgba(0,0,0,0.75)_52%,transparent_78%)] [-webkit-mask-image:radial-gradient(ellipse_72%_82%_at_58%_58%,#000_28%,rgba(0,0,0,0.75)_52%,transparent_78%)]">
          {/* Expanded dark matte covers residual cutout fringe */}
          <Image
            src="/ui/hero-right-matte.png"
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 48vw, (max-width: 1024px) 42vw, 44vw"
            className="object-contain object-right-bottom scale-[1.12] opacity-100 blur-[4px]"
          />
          <Image
            src="/ui/hero-right-v3.png"
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 48vw, (max-width: 1024px) 42vw, 44vw"
            className="object-contain object-right-bottom [filter:brightness(0.58)_contrast(1.55)_saturate(0.25)_blur(0.3px)_drop-shadow(0_0_8px_rgb(2_8_18))_drop-shadow(0_0_26px_rgba(4_16_32_/_1))_drop-shadow(0_32px_64px_rgba(0_0_0_/_1))]"
          />
        </div>
      </div>

      {/* Soft floor fade only — keep flanks readable */}
      <div className="absolute inset-x-0 bottom-0 z-[2] h-28 bg-gradient-to-t from-background via-background/60 to-transparent" />
    </div>
  );
}
