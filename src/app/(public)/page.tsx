export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import PropertyCard from "@/components/property/PropertyCard";
import {
  ShieldCheck,
  UserCheck,
  Ban,
  PiggyBank,
  ListChecks,
  Zap,
  ScanEye,
  ArrowRight,
} from "lucide-react";
import StackedCards from "@/components/ui/stacked-cards";
import ListPropertyCTA from "@/components/property/ListPropertyCTA";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import ProcessSection from "@/components/ui/ProcessSection";

// Cached across requests — the page still renders per request (session in the
// root layout), but these 4 DB queries only run once a minute
const getHomeData = unstable_cache(async () => {
  const [featured, stats] = await Promise.all([
    prisma.property.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        type: true,
        listingType: true,
        locality: true,
        building: true,
        bedrooms: true,
        areaSqft: true,
        furnished: true,
        price: true,
        deposit: true,
        images: {
          select: { id: true, url: true, isPrimary: true },
          orderBy: { isPrimary: "desc" },
          take: 1,
        },
      },
    }),
    Promise.all([
      prisma.property.count({ where: { status: "ACTIVE" } }),
      prisma.inquiry.count({ where: { status: "COMPLETED" } }),
      prisma.user.count({ where: { role: "OWNER" } }),
    ]),
  ]);

  return { featured, stats };
}, ["home-data"], { revalidate: 60 });

export default async function HomePage() {
  const { featured, stats } = await getHomeData();
  const [activeListings, completedDeals, owners] = stats;


  return (
    <div className="bg-[#f9f9f9] text-[#2d3435]">

      {/* ══════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-dvh flex items-center px-5 sm:px-8 overflow-hidden">

        {/* Full-bleed background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1920&auto=format&fit=crop&q=80"
            alt="Hiranandani Estate architecture"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Dark overlay — full bleed */}
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.80)" }} />
          {/* Top + bottom vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.55) 100%)",
            }}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-[1440px] mx-auto w-full pt-24 sm:pt-28">
          <div className="max-w-3xl">

            {/* Glass pill badge */}
            <div
              className="mb-5 sm:mb-6 inline-flex items-center gap-2 py-1.5 px-3 sm:px-4 rounded-full"
              style={{
                background: "rgba(221,228,229,0.4)",
                backdropFilter: "blur(20px)",
              }}
            >
              <ShieldCheck
                className="text-white shrink-0"
                style={{ width: 16, height: 16 }}
                strokeWidth={1.5}
              />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white">
                Trusted Real Estate Advisors · Zero Brokerage
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tighter text-white leading-[1.1] mb-6 sm:mb-8">
              Discover Exceptional Living in Hiranandani Estate
            </h1>

            {/* Sub-copy */}
            <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-xl leading-relaxed mb-8 sm:mb-10">
              Browse verified listings, register interest for free, and connect
              directly with owners. No commissions. Completely free.
            </p>

            {/* CTA */}
            <div className="flex items-start">
              <Link
                href="/listings"
                className="bg-white text-[#0B0B0C] py-3.5 px-8 sm:py-4 sm:px-10 rounded-xl text-sm sm:text-base font-bold hover:opacity-90 active:scale-95 transition-all duration-200"
              >
                Browse Listings
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FEATURE HIGHLIGHTS  (bento grid) — dark bg
      ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#111111] py-16 sm:py-24 px-5 sm:px-8">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              icon: ShieldCheck,
              title: "Manually Verified",
              desc: "Every listing is scrutinized by our curation team to ensure accuracy and authenticity.",
            },
            {
              icon: UserCheck,
              title: "Owner Only",
              desc: "We maintain a direct ecosystem where only property owners are permitted to list.",
            },
            {
              icon: Ban,
              title: "Zero Brokerage.",
              desc: "Deal directly with verified owners — you never pay a rupee in brokerage or commissions.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-[#1c1c1c] p-7 sm:p-10 rounded-xl">
              <Icon
                className="text-white/50 mb-4 sm:mb-6"
                style={{ width: 28, height: 28 }}
                strokeWidth={1.4}
              />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">{title}</h3>
              <p className="text-sm sm:text-base text-white/45 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 bg-[#f9f9f9] px-5 sm:px-8">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            <AnimatedCounter key="listings" end={activeListings} suffix="+" label="Active Listings" dark />,
            <AnimatedCounter key="deals" end={completedDeals} suffix="+" label="Deals Closed" dark />,
            <AnimatedCounter key="owners" end={owners} suffix="+" label="Verified Owners" dark />,
            <div key="free">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-1">Always</div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/45">Free</div>
            </div>,
          ].map((child, i) => (
            <div key={i} className="bg-[#1c1c1c] rounded-lg p-6 sm:p-8">
              {child}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          ADVANTAGE  (2-col: features left, dark card right)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-32 px-5 sm:px-8 max-w-[1440px] mx-auto overflow-visible">
        <div className="flex flex-col lg:flex-row gap-12 sm:gap-20 items-start">

          {/* ── Left: feature list ── */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-32">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-[#0B0B0C] mb-6 sm:mb-8 leading-tight">
              Experience the Hiranandani Advantage
            </h2>
            <div className="space-y-6 sm:space-y-8">
              {[
                { icon: PiggyBank, title: "Completely Free", desc: "Zero subscription fees or platform costs for tenants and buyers." },
                { icon: ListChecks, title: "Verified Listings", desc: "Say goodbye to bait-and-switch. Every photo and detail is real." },
                { icon: Zap, title: "Instant Access", desc: "Direct contact lines with owners for immediate viewings." },
                { icon: ScanEye, title: "Price Transparency", desc: "View true market rates with complete price history." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 sm:gap-6">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 flex items-center justify-center rounded-lg"
                    style={{ background: "#e4e9ea" }}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#5a6061]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-[#0B0B0C] mb-1">{title}</h4>
                    <p className="text-sm sm:text-base text-[#5a6061]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: stacked card scroll ── */}
          <div className="w-full lg:w-[55%]">
            <StackedCards
              cards={[
                {
                  label: "Our Promise",
                  title: "Zero Brokerage.\nFull Transparency.",
                  description:
                    "We\u2019ve redefined real estate in Hiranandani Estate by removing the middleman, creating a direct bridge between you and your future home.",
                },
                {
                  label: "Verified Only",
                  title: "Every Listing.\nManually Checked.",
                  description:
                    "Our curation team scrutinizes every property listing to ensure accuracy, authenticity, and up-to-date information.",
                },
                {
                  label: "Direct Access",
                  title: "Owner Contact.\nDirect Connect.",
                  description:
                    "Connect directly with property owners for immediate viewings and honest conversations about your future home.",
                },
                {
                  label: "Market Insight",
                  title: "True Prices.\nFull Transparency.",
                  description:
                    "View real market rates with full price history so you can make informed decisions without inflated numbers.",
                },
                {
                  label: "Always Free",
                  title: "No Fees.\nNo Subscriptions.",
                  description:
                    "Our platform is completely free for tenants and buyers. No platform costs, no surprises.",
                },
              ]}
            />
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          LATEST LISTINGS  — dark bg, white heading
      ══════════════════════════════════════════════════════════════════ */}
      {featured.length > 0 && (
        <section className="py-16 sm:py-24 bg-[#111111] px-5 sm:px-8">
          <div className="max-w-[1440px] mx-auto">

            {/* Section header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 sm:mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white">
                  Latest Listings
                </h2>
                <p className="text-white/45 mt-1 sm:mt-2 text-sm sm:text-base">
                  New properties hand-picked for you this week.
                </p>
              </div>
              <Link
                href="/listings"
                className="text-white font-bold flex items-center gap-2 group text-sm sm:text-base"
              >
                View All
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1.5" />
              </Link>
            </div>

            {/* Property cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 items-stretch">
              {featured.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SIMPLE PROCESS
      ══════════════════════════════════════════════════════════════════ */}
      <ProcessSection />

      {/* ══════════════════════════════════════════════════════════════════
          OWNER CTA  (dark split card)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-8 sm:py-24 px-4 sm:px-8 max-w-[1440px] mx-auto">
        <div className="bg-[#0B0B0C] rounded-xl overflow-hidden flex flex-col md:flex-row items-center">

          {/* Text side */}
          <div className="w-full md:w-1/2 p-6 sm:p-12 lg:p-20">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tighter mb-3 sm:mb-6 leading-tight">
              Own a Property in Hiranandani?
            </h2>
            <p className="text-[#adb3b4] text-sm sm:text-lg mb-6 sm:mb-10 leading-relaxed max-w-md">
              List it for free and reach thousands of verified seekers directly.
              We help you find the best tenants or buyers without commissions.
            </p>
            <div className="flex justify-center md:justify-start">
              <ListPropertyCTA />
            </div>
          </div>
          {/* Image side */}
          <div className="w-full md:w-1/2 h-40 sm:h-64 md:h-auto self-stretch">
            <img
              src="/images/hiranandanilol.jpeg"
              alt="Hiranandani Estate"
              className="w-full h-full object-cover"
            />
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-32 text-center px-5 sm:px-8">
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-[#0B0B0C] mb-8 sm:mb-10">
          Ready to find your home?
        </h2>
        <Link
          href="/listings"
          className="inline-block bg-[#0c0f0f] text-[#f9f9f9] py-4 px-10 sm:py-5 sm:px-16 rounded-full text-base sm:text-lg font-bold shadow-2xl shadow-[#0c0f0f]/10 hover:scale-105 active:scale-95 transition-transform duration-200"
        >
          Explore Listings
        </Link>
      </section>

    </div>
  );
}
