import "dotenv/config";
import { db } from "../src/lib/db";
import { brandProfiles } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import type { BrandGuide } from "../src/lib/db/schema";

const brandGuides: Record<string, { guide: BrandGuide; voiceGuidelines: string; tone: string }> = {
  "Ideal AI": {
    guide: {
      mission:
        "To empower human potential through AI by helping people and organizations grow into their ideal selves.",
      vision:
        "To democratize world-class coaching through AI and build workplaces where everyone can thrive and grow.",
      personality: ["Empowering", "Grounded", "Insightful", "Warmly bold"],
      toneDescription:
        "Confident, warm, clever, and honest. Modern, minimal, and emotionally intelligent.",
      values: [
        "Passion",
        "Humility",
        "Hunger",
        "Emotional intelligence",
        "Excellence",
      ],
      colors: {
        primary: "#288FFD",
        secondary: "#E50914",
        tertiary: "#004585",
        dark: "#212121",
        light: "#FBFBFB",
        accent: "#0170B8",
      },
      fonts: {
        header: "Roboto",
        body: "Roboto",
        accent: "Roboto Mono",
      },
      industry: "AI-powered coaching and team development software",
      targetAudience:
        "Businesses of all sizes — executives, C-suites, HR leaders, team managers, and individual employees",
    },
    voiceGuidelines:
      "Speak as a confident mentor who challenges norms with care and intelligence. Use empowering language that makes people feel seen, supported, and understood. Avoid corporate jargon — be honest and human. Focus on growth, potential, and transformation. The brand democratizes C-suite level mentorship through AI, making world-class coaching accessible to everyone.",
    tone: "Confident, warm, clever, honest",
  },

  IOSL: {
    guide: {
      mission:
        "To open the doors of senior living education to anyone with the drive to learn, using AI and accessible models to build skilled, compassionate professionals.",
      vision:
        "To be the world's leading platform for senior living knowledge, uniting care, business, and technology to transform the industry for future generations.",
      personality: ["Bold", "Innovative", "Empathetic", "Practical"],
      toneDescription:
        "Professional yet warm; modern, minimal design with approachable, trust-building colors.",
      values: [
        "Accessibility",
        "Respect for elders",
        "Continuous learning",
        "Innovation through AI",
        "Measurable impact",
      ],
      colors: {
        primary: "#A51C30",
        secondary: "#7B1423",
        tertiary: "#D59F25",
        dark: "#33050E",
        light: "#E3E3E3",
      },
      fonts: {
        header: "Merriweather",
        body: "Roboto",
        accent: "Roboto Mono",
      },
      industry: "Senior living education and professional training",
      targetAudience:
        "Aspiring caregivers, operators, and professionals from adjacent industries like housing, hospitality, and real estate",
    },
    voiceGuidelines:
      "Speak as an authoritative yet approachable educator. Combine practical industry knowledge with genuine care for the senior living sector. Emphasize accessibility and democratization of education. Show that AI and technology enhance — not replace — human-centered care. Content should feel like mentorship from a trusted industry leader.",
    tone: "Professional yet warm, bold, innovative",
  },

  "Colonial Oaks": {
    guide: {
      mission:
        "To foster environments where residents thrive, employees feel empowered, and communities prosper.",
      vision:
        "To lead the senior living industry nationwide through innovation, compassion, and strategic growth, enhancing the quality of life for every senior we serve.",
      personality: [
        "Compassionate",
        "Visionary",
        "Innovative",
        "Trustworthy",
        "Community-focused",
      ],
      toneDescription:
        "Professional yet warm, modern yet rooted in tradition, with a focus on trust, care, and forward-looking innovation.",
      values: [
        "Commitment to care",
        "Innovation",
        "Operational excellence",
        "Empowerment",
        "Community prosperity",
        "Continuous improvement",
      ],
      colors: {
        primary: "#638C3D",
        secondary: "#225717",
        dark: "#414042",
        light: "#FFFFFF",
        accent: "#E3E3E3",
      },
      fonts: {
        header: "Montserrat",
        body: "PT Sans",
        accent: "IBM Plex Mono",
      },
      industry: "Senior living communities — ownership, operations, and development",
      targetAudience:
        "Seniors, their families, employees, investors, and the communities where Colonial Oaks operates",
    },
    voiceGuidelines:
      "Speak with the authority of nearly 50 years in the industry and 120+ years of combined leadership experience. Balance tradition with forward-thinking innovation. Emphasize compassion, community, and the human side of senior living. Content should feel trustworthy, warm, and grounded — like a conversation with a respected community leader who genuinely cares.",
    tone: "Professional yet warm, compassionate, visionary",
  },
};

async function main() {
  for (const [name, data] of Object.entries(brandGuides)) {
    const result = await db
      .update(brandProfiles)
      .set({
        brandGuide: data.guide,
        voiceGuidelines: data.voiceGuidelines,
        tone: data.tone,
        updatedAt: new Date(),
      })
      .where(eq(brandProfiles.name, name))
      .returning({ id: brandProfiles.id, name: brandProfiles.name });

    if (result.length > 0) {
      console.log(`Updated: ${result[0].name} (${result[0].id})`);
    } else {
      console.log(`NOT FOUND: ${name}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
