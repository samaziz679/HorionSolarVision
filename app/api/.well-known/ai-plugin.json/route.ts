import { NextResponse } from "next/server"

export async function GET() {
  const manifest = {
    schema_version: "v1",
    name_for_human: "Solar Vision ERP - Assistant Vocal",
    name_for_model: "solar_vision_erp",
    description_for_human: "Assistant de vente vocal pour le système ERP Solar Vision au Burkina Faso",
    description_for_model:
      "Un système ERP pour la gestion des ventes de produits solaires avec commandes vocales en français",
    auth: {
      type: "none",
    },
    api: {
      type: "openapi",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/.well-known/openapi.json`,
    },
    logo_url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
    contact_email: "support@solarvision.bf",
    legal_info_url: `${process.env.NEXT_PUBLIC_SITE_URL}/legal`,
  }

  return NextResponse.json(manifest)
}
