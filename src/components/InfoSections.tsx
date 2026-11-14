import React from 'react';
import { Camera, Cpu, Sparkles, Check, HelpCircle, ArrowRight, Instagram, Mail } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Upload & Visual Ingest',
      desc: 'Selecteer een JPG, PNG of WEBP foto vanaf je computer. De interface analyseert de foto met behoud van originele kleurtinten en contrast.',
    },
    {
      num: '02',
      title: 'Context & Storyline',
      desc: 'Voeg optioneel details toe over de artiest, het festival, de locatie of het intieme moment voor een persoonlijke tone of voice.',
    },
    {
      num: '03',
      title: 'Multimodale AI-Analyse',
      desc: 'De AI ontleedt lichtinval, sfeer, emotie, personen, podium-energie en de visuele context van het beeld.',
    },
    {
      num: '04',
      title: '3 Gecureerde Captions met Interactievraag',
      desc: 'Ontvang direct 3 redactionele opties, elk afgesloten met een unieke stimulerende vraag voor maximale reacties in de comments.',
    },
  ];

  return (
    <section id="hoe-het-werkt" className="my-20 py-16 border-t border-neutral-200">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.2em] block mb-2">
          Method &amp; Process
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-black uppercase tracking-[0.06em]">
          Hoe AI jouw perfecte Instagram-captions samenstelt
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-2.5 max-w-xl mx-auto leading-relaxed">
          Geen inspiratieloze standaardteksten, maar authentieke captions afgestemd op de compositie, dynamiek en verhaallijn van je foto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="p-6 bg-white border border-neutral-200 hover:border-black transition-colors"
          >
            <div className="text-xl font-bold text-black mb-3 font-mono">
              {s.num}
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-black mb-2">
              {s.title}
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-sans">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export const FaqSection: React.FC = () => {
  const faqs = [
    {
      q: 'Welke bestandsformaten worden ondersteund?',
      a: 'Je kunt afbeeldingen uploaden in JPG, JPEG, PNG en WEBP. De bestanden mogen tot maximaal 20 MB groot zijn.',
    },
    {
      q: 'Wat analyseert de AI precies in mijn foto?',
      a: 'De AI kijkt naar de onderwerpdetails, personen, herkenbare locaties, uitgevoerde activiteiten, het kleurenpalet, de lichtsfeer en het moment van de dag of podiumsetting.',
    },
    {
      q: 'Eindigt elke caption met een stimulerende vraag voor interactie?',
      a: 'Ja! Elke gegenereerde caption wordt afgesloten met een unieke, natuurlijke vraag die specifiek aansluit op het onderwerp en de sfeer van je foto. Dit nodigt volgers uit om hun eigen ervaringen, keuzes of mening te delen in de comments, wat het algoritme-bereik aanzienlijk vergroot.',
    },
    {
      q: 'Kan ik de gegenereerde teksten nog aanpassen?',
      a: 'Absoluut. Elke optie kan direct in de app bewerkt worden. Ook kun je met de "Verfijn met AI" knop specifieke instructies meegeven zoals korter, meer festival-vibe of een andere invalshoek voor de vraag.',
    },
    {
      q: 'Worden er ook relevante hashtags gegenereerd?',
      a: 'Ja, de AI genereert gerichte niche- en community-hashtags afgestemd op de inhoud van je foto. Je kunt kiezen voor 3-5 hashtags (maximaal 5, aanbevolen door Instagram), 1-3 hashtags (ultra-minimalistisch) of 0 hashtags.',
    },
  ];

  return (
    <section id="faq" className="my-16 py-12 border-t border-neutral-200">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.2em] block mb-2">
            Informatie
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-black uppercase tracking-[0.06em]">
            Veelgestelde vragen
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-6 bg-white border border-neutral-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-2 flex items-center gap-2">
                <span>— {faq.q}</span>
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed pl-4 font-sans">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="mt-24 py-12 border-t border-neutral-200 bg-white text-xs text-neutral-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="text-base font-bold tracking-[0.2em] text-black uppercase editorial-logo mb-1">
            ROOSJPLOEG
          </div>
          <div className="text-[11px] text-neutral-600">
            Music, Concerts, Nightlife &amp; Portrait Photography Studio
          </div>
        </div>

        <div className="flex items-center gap-6 text-[11px] uppercase tracking-widest text-neutral-700">
          <a
            href="https://www.roosjploeg.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black transition-colors"
          >
            Portfolio
          </a>
          <a
            href="https://instagram.com/roosjploeg"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black transition-colors flex items-center gap-1"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>@roosjploeg</span>
          </a>
          <a
            href="mailto:roosjploeg@gmail.com"
            className="hover:text-black transition-colors flex items-center gap-1"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact</span>
          </a>
        </div>

        <div className="text-[11px] text-neutral-500 text-center md:text-right font-mono">
          &copy; {new Date().getFullYear()} ROOSJPLOEG. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
