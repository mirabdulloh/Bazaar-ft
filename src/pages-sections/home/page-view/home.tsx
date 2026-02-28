import { Fragment } from "react";
// GLOBAL CUSTOM COMPONENTS
import Newsletter from "components/newsletter";
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
      {/* HERO BANNERS */}
      <Section1 />

      {/* SALE / FLASH DEALS */}
      <Section2 />

      {/* NEW ARRIVALS */}
      <Section3 />

      {/* FEATURED BRANDS */}
      <FeaturedBrandsSection />

      {/* PROMOTIONAL BANNER GRID */}
      <Section4 />

      {/* BEST SELLERS */}
      <Section5 />

      {/* TRENDING NOW */}
      <Section6 />

      {/* SERVICE CARDS */}
      <Section7 />

      {/* LATEST FROM COMMUNITY */}
      <SectionCommunity />

      {/* NEWSLETTER POPUP */}
      <Newsletter />
    </Fragment>
  );
}
