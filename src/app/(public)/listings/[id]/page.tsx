import { notFound } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import PropertyMapSection from "@/components/map/PropertyMapSection";
import InquiryButton from "@/components/payment/InquiryButton";
import PropertyGallery from "@/components/property/PropertyGallery";
import { WhatsAppShareButton } from "@/components/property/WhatsAppShare";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Building2,
  Wifi,
  Car,
  Dumbbell,
  ShieldCheck,
  Droplets,
  Wind,
  Zap,
  Trees,
} from "lucide-react";
import {
  formatPrice,
  formatArea,
  formatDate,
  parseAmenities,
} from "@/lib/utils/formatters";
import {
  PROPERTY_TYPE_LABELS,
  LISTING_TYPE_LABELS,
  FURNISHED_LABELS,
} from "@/lib/constants";
import type { Metadata } from "next";

export const revalidate = 3600;

// cache() dedupes the query between generateMetadata and the page render
const getProperty = cache(async (id: string) => {
  return prisma.property.findUnique({
    where: { id, status: "ACTIVE" },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      listingType: true,
      building: true,
      address: true,
      locality: true,
      bedrooms: true,
      bathrooms: true,
      areaSqft: true,
      floor: true,
      totalFloors: true,
      furnished: true,
      amenities: true,
      price: true,
      deposit: true,
      rentNegotiable: true,
      lockInMonths: true,
      lockInNegotiable: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      images: {
        select: { id: true, url: true, isPrimary: true },
        orderBy: { isPrimary: "desc" },
      },
      priceHistory: {
        select: { price: true, recordedAt: true, source: true },
        orderBy: { recordedAt: "asc" },
      },
      owner: { select: { id: true, name: true, image: true } },
    },
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) return { title: "Property Not Found" };

  return {
    title: property.title,
    description: property.description.slice(0, 160),
    openGraph: {
      title: property.title,
      images: property.images[0] ? [property.images[0].url] : [],
    },
  };
}

/* ── Amenity icon mapping ── */
const AMENITY_ICONS: Record<string, React.ElementType> = {
  "High-speed Wifi": Wifi,
  "Wi-Fi": Wifi,
  WiFi: Wifi,
  "Covered Parking": Car,
  Parking: Car,
  "Private Gym": Dumbbell,
  Gym: Dumbbell,
  "24x7 Security": ShieldCheck,
  "24/7 Security": ShieldCheck,
  Security: ShieldCheck,
  "Swimming Pool": Droplets,
  "Infinity Pool": Droplets,
  Pool: Droplets,
  "Air Conditioning": Wind,
  "Laundry Service": Wind,
  AC: Wind,
  "Power Backup": Zap,
  Garden: Trees,
};

function getAmenityIcon(name: string) {
  return AMENITY_ICONS[name] ?? ShieldCheck;
}

/* ── Section label ── */
function SectionLabel({ title, compact, withLine }: { title: string; compact?: boolean; withLine?: boolean }) {
  return (
    <div className={`flex items-center gap-4 mb-5 sm:mb-8 ${compact ? "mt-0" : "mt-10 sm:mt-16"}`}>
      <p className="text-[11px] sm:text-[13px] font-bold tracking-[0.25em] text-[#1A1A1A]/80 uppercase shrink-0">{title}</p>
      {withLine && <div className="flex-1 h-px bg-[#1A1A1A]/20" />}
    </div>
  );
}

export default async function PropertyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ showInterest?: string }>;
}) {
  const [{ id }, resolvedSearch] = await Promise.all([params, searchParams]);
  const [property, session] = await Promise.all([getProperty(id), auth()]);

  if (!property) notFound();

  // Count the view for analytics (never block the page on failure)
  await prisma.property
    .update({ where: { id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  const isRent = property.listingType === "RENT";

  const galleryImages = property.images;

  let hasRegistered = false;
  if (session?.user?.id) {
    const inquiry = await prisma.inquiry.findUnique({
      where: {
        propertyId_seekerId: {
          propertyId: id,
          seekerId: session.user.id,
        },
      },
      select: { status: true },
    });
    hasRegistered = inquiry != null;
  }

  const amenities = parseAmenities(property.amenities);

  /* Split title for italic portion after comma */
  const titleParts = property.title.split(",");
  const mainTitle = titleParts[0];
  const italicTitle =
    titleParts.length > 1 ? ", " + titleParts.slice(1).join(",").trim() : null;

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero Gallery ──────────────────────────────────────────────────── */}
      <div className="pt-[72px] sm:pt-[84px] max-w-6xl mx-auto px-3 sm:px-6 lg:px-10">
        <PropertyGallery images={galleryImages} title={property.title} />
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">

        {/* ── Title row + Price Card ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6 lg:gap-12 items-start mt-6 sm:mt-10">

          {/* Left: Badges + Title + Location */}
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              {[
                `For ${LISTING_TYPE_LABELS[property.listingType]}`,
                PROPERTY_TYPE_LABELS[property.type],
                FURNISHED_LABELS[property.furnished],
              ].map((label) => (
                <span
                  key={label}
                  className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#1A1A1A]/55 border border-gray-200 px-3 py-1 rounded-full"
                >
                  {label}
                </span>
              ))}
            </div>

            <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-5xl lg:text-6xl font-bold text-[#0B0B0C] mt-4 sm:mt-5 leading-tight tracking-tight break-words">
              {mainTitle}
              {italicTitle && (
                <span className="italic font-normal text-[#0B0B0C]/80">
                  {italicTitle}
                </span>
              )}
            </h1>

            <div className="flex items-start gap-1.5 text-[#1A1A1A]/45 text-[13px] mt-3">
              <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>
                {property.building}, {property.locality}, Hiranandani Estate, Thane
              </span>
            </div>
          </div>

          {/* Right: Price Card — sticky on desktop, inline on mobile */}
          <div className="lg:sticky lg:top-24">
            <div className="border border-gray-150 bg-[#fafafa] p-5 sm:p-8 rounded-sm">
              <p className="text-[9px] tracking-[0.25em] text-[#1A1A1A]/45 uppercase mb-3">
                {isRent ? "Price Per Month" : "Sale Price"}
              </p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-3xl sm:text-4xl font-bold text-[#0B0B0C] font-[family-name:var(--font-playfair)]">
                  {formatPrice(property.price)}
                </span>
                {isRent && (
                  <span className="text-[#1A1A1A]/40 text-sm font-normal">/mo</span>
                )}
              </div>

              {property.rentNegotiable && (
                <span className="inline-block text-[10px] tracking-wide text-gray-400 border border-gray-200 px-2 py-0.5 mb-2">
                  Negotiable
                </span>
              )}
              {isRent && property.deposit && (
                <p className="text-xs text-gray-400 mb-1">
                  Deposit: {formatPrice(property.deposit)}
                </p>
              )}
              {isRent && property.lockInMonths != null && property.lockInMonths > 0 && (
                <p className="text-xs text-gray-400 mb-1">
                  Lock-in: {property.lockInMonths} month
                  {property.lockInMonths > 1 ? "s" : ""}
                  {property.lockInNegotiable ? " (negotiable)" : ""}
                </p>
              )}

              <div className="mt-5">
                <InquiryButton
                  propertyId={property.id}
                  hasRegistered={hasRegistered}
                  isLoggedIn={!!session}
                  userName={session?.user?.name ?? ""}
                  userEmail={session?.user?.email ?? ""}
                  autoOpen={resolvedSearch?.showInterest === "1" && !!session && !hasRegistered}
                />
              </div>

              <div className="mt-3">
                <WhatsAppShareButton
                  property={{
                    id: property.id,
                    title: property.title,
                    type: property.type,
                    listingType: property.listingType,
                    building: property.building,
                    locality: property.locality,
                    bedrooms: property.bedrooms,
                    bathrooms: property.bathrooms,
                    areaSqft: property.areaSqft,
                    furnished: property.furnished,
                    price: property.price,
                    deposit: property.deposit,
                  }}
                />
              </div>

              <p className="text-[10px] text-center text-[#1A1A1A]/40 mt-4 leading-relaxed tracking-wide">
                100% Verified Property
              </p>
            </div>
          </div>
        </div>

        {/* ── Key Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 mt-6 sm:mt-10 gap-3">
          {[
            {
              icon: BedDouble,
              label: "BEDROOM",
              value: property.bedrooms ? `${property.bedrooms} BHK` : "N/A",
            },
            {
              icon: Bath,
              label: "BATHROOM",
              value: property.bathrooms ?? "N/A",
            },
            {
              icon: Maximize2,
              label: "SQ.FT AREA",
              value: formatArea(property.areaSqft),
            },
            {
              icon: Building2,
              label: "FLOOR",
              value:
                property.floor != null
                  ? `${property.floor}${property.totalFloors ? `/${property.totalFloors}` : ""}`
                  : "N/A",
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center py-6 sm:py-9 px-3 sm:px-4 bg-[#f5f5f5] rounded-lg"
            >
              <Icon className="h-5 w-5 text-[#0B0B0C]/35 mb-3 sm:mb-4" strokeWidth={1.5} />
              <p className="font-bold text-[#0B0B0C] text-xl sm:text-2xl leading-none tracking-tight">
                {value}
              </p>
              <p className="text-[9px] tracking-[0.22em] text-[#1A1A1A]/45 mt-2 sm:mt-2.5 uppercase">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* ── About + Amenities ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 lg:gap-8 items-stretch mt-6 sm:mt-10">
          {/* Left 60%: About */}
          <div className="bg-[#fafafa] px-5 sm:px-8 pb-6 sm:pb-8 pt-5 sm:pt-6 rounded-sm">
            <SectionLabel title="About This Property" compact />
            <p className="text-[#0B0B0C]/75 leading-[1.85] text-[14px] sm:text-[15px] whitespace-pre-line italic">
              {property.description}
            </p>
          </div>

          {/* Right 40%: Amenities */}
          {amenities.length > 0 && (
            <div className="bg-[#fafafa] px-5 sm:px-8 pb-6 sm:pb-8 pt-5 sm:pt-6 rounded-sm">
              <SectionLabel title="Amenities" compact />
              <div className="flex flex-wrap gap-6 sm:gap-10">
                {amenities.map((amenity) => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <div key={amenity} className="flex flex-col items-center gap-2">
                      <Icon className="h-[18px] w-[18px] text-[#0B0B0C]/40" strokeWidth={1.5} />
                      <span className="text-[11px] text-[#1A1A1A]/55 text-center leading-tight">
                        {amenity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Location / Map ── */}
        {property.latitude && property.longitude && (
          <>
            <SectionLabel title="Location" withLine />
            <PropertyMapSection
              lat={property.latitude}
              lng={property.longitude}
              propertyId={property.id}
              isLoggedIn={!!session}
            />

          </>
        )}


        {/* ── Footer meta ── */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#1A1A1A]/30 mt-10 sm:mt-16 pt-6 pb-16 sm:pb-20 border-t border-gray-100">
          <span>Listed {formatDate(property.createdAt)}</span>
          <span>&middot;</span>
<span className="text-gray-400 font-medium">Verified Owner</span>
        </div>
      </div>
    </div>
  );
}
