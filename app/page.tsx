"use client";

import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Results } from "@/components/results";
import { WhyChoose } from "@/components/why-choose";
import { DashboardCta } from "@/components/dashboard-cta";
import { ComparisonTable } from "@/components/comparison-table";
import { ServicesCards } from "@/components/services-cards";
import { HowWeWork } from "@/components/how-we-work";
import { SolutionsGrid } from "@/components/solutions-grid";
import { ContactForm } from "@/components/contact-form";
import { Footer } from "@/components/footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Results />
      <WhyChoose />
      <DashboardCta />
      <ComparisonTable />
      <ServicesCards />
      <HowWeWork />
      <SolutionsGrid />
      <ContactForm />
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
