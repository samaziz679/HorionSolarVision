import { NextResponse } from "next/server"

export async function GET() {
  const manifest = {
    schema_version: "v1",
    name_for_human: "Solar Vision ERP - Assistant Vocal",
    name_for_model: "solar_vision_voice_sales",
    description_for_human: "Assistant vocal pour les ventes en français - Système ERP solaire Burkina Faso",
    description_for_model:
      "Voice assistant for French sales commands in Solar Vision ERP system. Processes voice commands like 'Vendre 3 batteries à M. Ouedraogo au prix grossiste' and creates sales transactions.",
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

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
