import { ArrowUpRight, Bell, ChevronDown, Sparkles } from 'lucide-react'

const navigation = ['Home', 'Features', 'Portfolio', 'For Recruiters', 'Pricing']

export function SkillPassportHero() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[45rem] bg-[radial-gradient(circle_at_38%_0%,rgba(32,183,137,0.3),transparent_28%,transparent_58%)]" />
      <div className="pointer-events-none absolute -right-40 top-72 size-[32rem] rounded-full bg-primary/5 blur-3xl" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10" aria-label="Main navigation">
        <a href="#top" className="flex items-center gap-3" aria-label="SkillPassport home">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_24px_rgba(57,226,170,0.3)]">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <span className="font-sans text-sm font-semibold tracking-tight sm:text-base">SkillPassport<span className="text-primary">.</span></span>
        </a>

        <div className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
          {navigation.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replaceAll(' ', '-')}`}
              className="transition-colors hover:text-foreground"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button type="button" className="hidden text-muted-foreground transition-colors hover:text-foreground sm:block" aria-label="View notifications">
            <Bell className="size-5" aria-hidden="true" />
          </button>
          <button type="button" className="flex items-center gap-2 rounded-full border border-border/70 bg-card/70 p-1 pr-2 text-sm transition-colors hover:bg-card" aria-label="Open account menu">
            <span className="grid size-7 place-items-center rounded-full bg-primary/20 text-xs font-semibold text-primary">AR</span>
            <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
          </button>
        </div>
      </nav>

      <section id="top" className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-5 pb-6 pt-20 text-center sm:px-8 sm:pt-24 lg:px-10 lg:pt-24">
        <p className="mb-7 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-primary">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" /> Verified. Trusted. Hired.
        </p>
        <h1 className="max-w-5xl text-balance font-sans text-[clamp(3.25rem,8vw,7.7rem)] font-light leading-[0.93] tracking-[-0.07em]">
          Build your career.
          <span className="block text-primary">Verify every skill.</span>
          <span className="font-serif italic tracking-[-0.06em]">Get discovered.</span>
        </h1>
        <div className="mt-10 flex flex-col items-center gap-7 sm:flex-row sm:items-center">
          <a href="#courses" className="group inline-flex items-center gap-3 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">
            Build My Passport
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </a>
          <p className="max-w-xs text-left text-xs leading-relaxed text-muted-foreground sm:max-w-[12rem]">
            Turn your projects, certificates, and skills into a verified digital portfolio recruiters actually trust.
          </p>
        </div>
      </section>

      <section id="courses" className="relative z-10 flex justify-center px-5 pb-6 pt-6 sm:px-8 lg:px-10">
        <div className="animate-fade-in grid grid-cols-3 gap-8 border-t border-border/70 pt-5 sm:gap-12 lg:gap-20">
          {[
            ['10k+', 'Students Onboarded'],
            ['500+', 'Verified Skills'],
            ['200+', 'Recruiter Partners'],
          ].map(([value, label]) => (
            <div key={label} className="text-left">
              <p className="font-sans text-2xl font-semibold tracking-tight sm:text-3xl">{value}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{label}</p>
            </div>
          ))}
        </div>


      </section>
    </main>
  )
}
