import { Fragment } from "react";
// GLOBAL CUSTOM COMPONENTS
import Newsletter from "components/newsletter";
import { ScrollReveal } from "components/scroll-reveal";
// LOCAL CUSTOM SECTION COMPONENTS
import Section1 from "../section-1";
import Section2 from "../section-2";
import Section3 from "../section-3";
import Section4 from "../section-4";
import Section5 from "../section-5";
import Section6 from "../section-6";
import Section7 from "../section-7";
import FeaturedBrandsSection from "../section-brands";
import SectionCommunity from "../section-community";

export default function HomePageView() {
  return (
    <Fragment>
      {/* HERO BANNERS — always visible, no reveal */}
      <Section1 />

      {/* SALE / FLASH DEALS */}
      <ScrollReveal>
        <Section2 />
      </ScrollReveal>

      {/* NEW ARRIVALS */}
      <ScrollReveal>
        <Section3 />
      </ScrollReveal>

      {/* FEATURED BRANDS */}
      <ScrollReveal>
        <FeaturedBrandsSection />
      </ScrollReveal>

      {/* PROMOTIONAL BANNER GRID */}
      <ScrollReveal>
        <Section4 />
      </ScrollReveal>

      {/* BEST SELLERS */}
      <ScrollReveal>
        <Section5 />
      </ScrollReveal>

      {/* TRENDING NOW */}
      <ScrollReveal>
        <Section6 />
      </ScrollReveal>

      {/* SERVICE CARDS */}
      <ScrollReveal>
        <Section7 />
      </ScrollReveal>

      {/* LATEST FROM COMMUNITY */}
      <ScrollReveal>
        <SectionCommunity />
      </ScrollReveal>

      {/* NEWSLETTER POPUP */}
      <Newsletter />
    </Fragment>
  );
}
