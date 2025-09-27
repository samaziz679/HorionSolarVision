import { NextResponse } from "next/server"

export async function GET() {
  const openApiSpec = {
    openapi: "3.0.1",
    info: {
      title: "Solar Vision ERP - Voice Sales API",
      description: "API pour l'assistant vocal de ventes en français",
      version: "v1.0.0",
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_SITE_URL || "https://solar-vision-burkina-erp.vercel.app",
      },
    ],
    paths: {
      "/api/mcp/process-voice-command": {
        post: {
          operationId: "processVoiceCommand",
          summary: "Traite une commande vocale en français",
          description: "Analyse et valide une commande vocale de vente en français",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    command: {
                      type: "string",
                      description:
                        "Commande vocale en français (ex: 'Vendre 3 batteries à M. Ouedraogo au prix grossiste')",
                    },
                  },
                  required: ["command"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Commande traitée avec succès",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      parsedData: {
                        type: "object",
                        properties: {
                          product: { type: "string" },
                          quantity: { type: "number" },
                          client: { type: "string" },
                          priceType: { type: "string" },
                        },
                      },
                      error: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/mcp/create-sale": {
        post: {
          operationId: "createSale",
          summary: "Crée une vente à partir des données vocales",
          description: "Enregistre une vente dans le système ERP",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    productId: { type: "string" },
                    clientId: { type: "string" },
                    quantity: { type: "number" },
                    pricePlan: { type: "string" },
                    unitPrice: { type: "number" },
                  },
                  required: ["productId", "clientId", "quantity", "pricePlan", "unitPrice"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Vente créée avec succès",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      saleId: { type: "string" },
                      message: { type: "string" },
                      error: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }

  return NextResponse.json(openApiSpec, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
