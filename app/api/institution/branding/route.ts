import { apiSuccess } from "@/lib/api/response";

export async function GET() {
  const branding = {
    app: {
      name: "CampusSaathi",
      slogan: "Your Intelligent Campus Companion",
      logo: "/branding/campussaathi-logo.svg",
      mark: "/branding/campussaathi-mark.svg",
      wordmark: "/branding/campussaathi-wordmark.svg",
    },
    institution: {
      name: "Purnachandra Group of Institutions",
      tagline: "Knowledge is Power",
      established: "2017",
      logo: "/branding/institute-logo.png",
      logoSvg: "/branding/institute-logo.svg",
      configured: true,
    },
  };

  return apiSuccess(branding);
}
