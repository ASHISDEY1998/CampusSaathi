import { apiSuccess } from "@/lib/api/response";

export async function GET() {
  // Institutional profile boundary for real institute data
  const institutionProfile = {
    name: "Purnachandra Group of Institutions",
    code: "PGI",
    tagline: "Knowledge is Power",
    established: "2017",
    logo: "/branding/institute-logo.png",
    logoSvg: "/branding/institute-logo.svg",
    address: null,
    website: null,
    email: null,
    phone: null,
  };

  return apiSuccess(institutionProfile);
}
