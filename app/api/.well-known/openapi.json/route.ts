import { NextResponse } from "next/server"

export async function GET() {
  const openApiSpec = {
    openapi: "3.0.1",
    info: {
      title: "Solar Vision ERP API",
      description: "API pour l'assistant de vente vocal du système ERP Solar Vision",
      version: "1.0.0",
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
          summary: "Traiter une commande vocale de vente",
          description: "Analyse et traite une commande vocale en français pour créer une vente",
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
                          productId: { type: "string" },
                          product: { type: "string" },
                          clientId: { type: "string" },
                          client: { type: "string" },
                          quantity: { type: "number" },
                          priceType: { type: "string", enum: ["detail_1", "detail_2", "gros"] },
                          unitPrice: { type: "number" },
                          total: { type: "number" },
                        },
                      },
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
          summary: "Créer une vente",
          description: "Crée une nouvelle vente dans le système ERP",
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
                    priceType: { type: "string" },
                    unitPrice: { type: "number" },
                    total: { type: "number" },
                  },
                  required: ["productId", "clientId", "quantity", "unitPrice", "total"],
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
                      sale: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          total: { type: "number" },
                          product: { type: "string" },
                          client: { type: "string" },
                          quantity: { type: "number" },
                        },
                      },
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

  return NextResponse.json(openApiSpec)
}
