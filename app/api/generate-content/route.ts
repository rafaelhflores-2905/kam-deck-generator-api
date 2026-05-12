import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { assertToken, corsHeaders, preflight, unauthorized } from "@/lib/cors";
import { KAM_SYSTEM_CONTEXT } from "@/lib/kamKnowledge";
import { DeckRequest, DeckContent } from "@/lib/types";

export const runtime = "nodejs";

export async function OPTIONS(req: NextRequest) {
  return preflight(req);
}

function fallbackContent(req: Partial<DeckRequest>): DeckContent {
  return {
    title: req.title || `${req.presentationType || "KAM"} | Presentación`,
    subtitle: "Solución financiera para proyectos solares y almacenamiento",
    presentationType: req.presentationType || "BESS",
    audience: "EPC, integrador u offtaker",
    closingLine:
      "KAM convierte oportunidades energéticas en proyectos cerrados, financiados y en operación.",
    slides: [
      {
        eyebrow: "Contexto ejecutivo",
        title: "La energía ya no es solo un costo operativo",
        headline:
          "Una estructura financiera clara convierte la transición energética en una decisión viable.",
        bullets: [
          "Preserva liquidez y evita frenar proyectos por CAPEX.",
          "Ordena el caso de negocio para dirección, finanzas y jurídico.",
          "Reduce fricción entre alcance técnico, contrato y ejecución.",
          "Aporta claridad sobre pagos, responsabilidades y próximos pasos."
        ]
      },
      {
        eyebrow: "Propuesta de valor",
        title: `Qué resuelve ${req.presentationType || "KAM"}`,
        headline:
          "KAM entra como socio financiero especializado para convertir el proyecto en realidad.",
        bullets: [
          "Financiamiento estructurado para solar FV y BESS.",
          "Acompañamiento técnico-financiero durante todo el proceso.",
          "Contratos claros y proceso predecible.",
          "Respeto a la relación comercial del EPC con su cliente."
        ]
      },
      {
        eyebrow: "Beneficios comerciales",
        title: "Por qué avanzar con KAM",
        headline:
          "La estructura permite presentar el proyecto como una decisión financiera viable y no solo técnica.",
        bullets: [
          "Cero inversión inicial en esquemas aplicables.",
          "Cuotas, pagos o precio de energía definidos según producto.",
          "O&M, monitoreo y seguro integrados cuando aplique.",
          "Ruta clara de documentación, firma y ejecución."
        ]
      },
      {
        eyebrow: "Modelo de trabajo",
        title: "Cómo se estructura el proyecto",
        headline:
          "El EPC conserva la relación comercial y KAM entra como socio financiero especializado.",
        bullets: [
          "Evaluación técnica y financiera del proyecto.",
          "Validación documental del cliente y del inmueble.",
          "Definición de producto: PPA, PTO, Leasing, FV+BESS o BESS.",
          "Formalización contractual y acompañamiento hasta operación."
        ]
      },
      {
        eyebrow: "Siguientes pasos",
        title: "Ruta para avanzar",
        headline:
          "El objetivo es convertir la oportunidad en una propuesta clara, financiable y ejecutable.",
        bullets: [
          "Completar información del proyecto.",
          "Validar consumo, sitio y alcance técnico.",
          "Definir estructura económica.",
          "Integrar documentación.",
          "Agendar revisión con el cliente y EPC."
        ]
      }
    ]
  };
}

export async function POST(req: NextRequest) {
  if (!assertToken(req)) return unauthorized(req);

  const headers = corsHeaders(req);
  let body: Partial<DeckRequest> = {};

  try {
    body = (await req.json()) as Partial<DeckRequest>;
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Payload inválido",
        details: error?.message || String(error)
      },
      { status: 400, headers }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        content: fallbackContent(body),
        warning: "OPENAI_API_KEY no configurada; se usó contenido base."
      },
      { headers }
    );
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const schema = {
      type: "object",
      additionalProperties: false,
      required: [
        "title",
        "subtitle",
        "presentationType",
        "audience",
        "slides",
        "closingLine"
      ],
      properties: {
        title: { type: "string" },
        subtitle: { type: "string" },
        presentationType: { type: "string" },
        audience: { type: "string" },
        closingLine: { type: "string" },
        slides: {
          type: "array",
          minItems: 5,
          maxItems: 7,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["eyebrow", "title", "headline", "bullets"],
            properties: {
              eyebrow: { type: "string" },
              title: { type: "string" },
              headline: { type: "string" },
              bullets: {
                type: "array",
                minItems: 3,
                maxItems: 6,
                items: { type: "string" }
              }
            }
          }
        }
      }
    };

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      instructions: `${KAM_SYSTEM_CONTEXT}

Genera contenido para una presentación editable de KAM.
Debe ser ejecutivo, comercial y claro.
Evita párrafos largos. No incluyas markdown. No uses citas. No inventes cifras específicas del proyecto.
Estructura el contenido para slides de PowerPoint.`,
      input: JSON.stringify({
        titulo: body.title,
        tipoPresentacion: body.presentationType,
        contexto: body.context,
        informacionClave: body.keyInformation,
        temaDetalladoSolicitado: body.topicDetail
      }),
      text: {
        format: {
          type: "json_schema",
          name: "kam_deck_content",
          strict: true,
          schema
        }
      }
    } as any);

    const parsed = JSON.parse(response.output_text || "{}") as DeckContent;

    return NextResponse.json(
      {
        content: parsed
      },
      { headers }
    );
  } catch (error: any) {
    console.error("KAM generate-content error:", error);

    return NextResponse.json(
      {
        content: fallbackContent(body),
        warning:
          "No se pudo generar contenido con IA; se usó contenido base para continuar.",
        details: error?.message || String(error)
      },
      { headers }
    );
  }
}
