import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'

const BG_IMAGE = "url('/images/truck-hiring-cta.png')"
const sectionStyle: CSSProperties = {
  backgroundImage: BG_IMAGE,
}

type HiringOpportunitiesCtaProps = {
  className?: string
}

export function HiringOpportunitiesCta({ className = '' }: HiringOpportunitiesCtaProps) {
  return (
    <section
      className={`relative min-h-[20rem] w-full overflow-hidden bg-slate-900 bg-cover bg-center sm:min-h-[24rem] ${className}`}
      style={sectionStyle}
      aria-labelledby="hiring-cta-heading"
    >
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30"
        aria-hidden="true"
      />
      <div className="relative flex h-full min-h-[20rem] flex-col items-center justify-center gap-4 px-5 py-8 text-center sm:min-h-[24rem] sm:px-8 sm:py-10">
        <h2
          id="hiring-cta-heading"
          className="max-w-xl text-xl font-semibold leading-snug text-white sm:text-2xl"
        >
          See companies hiring for your CDL and state
        </h2>
        <div className="flex justify-center">
          <Link
            to="/driver/opportunities"
            className="inline-flex min-h-touch items-center justify-center rounded-input bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
          >
            View companies
          </Link>
        </div>
      </div>
    </section>
  )
}
