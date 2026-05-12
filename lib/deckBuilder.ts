import PptxGenJS from "pptxgenjs";
import { DeckContent, DeckRequest } from "./types";

const C = {
  black: "010101",
  black2: "111217",
  white: "F6F6F6",
  pureWhite: "FFFFFF",
  gray: "C9CED6",
  gray2: "858B94",
  line: "30333A",
  cyan: "14B8A6",
  cyanSoft: "50D6CA"
};

const W = 13.333;
const H = 7.5;

async function fetchAsDataUrl(url?: string): Promise<string | undefined> {
  if (!url) return undefined;
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const contentType = response.headers.get("content-type") || guessMime(url);
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch {
    return undefined;
  }
}

function guessMime(url: string) {
  const lower = url.toLowerCase();
  if (lower.includes(".svg")) return "image/svg+xml";
  if (lower.includes(".png")) return "image/png";
  if (lower.includes(".webp")) return "image/webp";
  return "image/jpeg";
}

function textStyle(size: number, bold = false, color = C.white) {
  return { fontFace: "Montserrat", fontSize: size, bold, color, margin: 0 };
}

function addBg(slide: any, color = C.black) {
  slide.background = { color };
  slide.addShape("rect", {
    x: 0, y: 0, w: W, h: H,
    fill: { color },
    line: { color, transparency: 100 }
  });
}

function addLogo(slide: any, logoData?: string, x = 0.72, y = 0.58, w = 1.42, h = 0.42) {
  if (logoData) {
    slide.addImage({ data: logoData, x, y, w, h });
  } else {
    slide.addText("KAM", { x, y, w, h, ...textStyle(18, true, C.pureWhite), fit: "shrink" });
  }
}

function addFooter(slide: any, n: number, signerName?: string) {
  slide.addShape("line", { x: 0.72, y: 6.92, w: 11.9, h: 0, line: { color: C.line, width: 0.55 } });
  slide.addText(signerName ? `Kishoa Asset Management · ${signerName}` : "Kishoa Asset Management", {
    x: 0.72, y: 7.08, w: 4.8, h: 0.18, ...textStyle(6.7, false, C.gray)
  });
  slide.addText(String(n).padStart(2, "0"), {
    x: 12.15, y: 7.06, w: 0.45, h: 0.22, ...textStyle(7.5, true, C.gray), align: "right"
  });
}

function addHeader(slide: any, logoData: string | undefined, title: string, eyebrow: string, n: number, signerName?: string) {
  addLogo(slide, logoData, 0.72, 0.46, 1.05, 0.32);
  if (eyebrow) {
    slide.addText(eyebrow.toUpperCase(), {
      x: 0.72, y: 1.03, w: 6.2, h: 0.18, ...textStyle(7.5, true, C.cyan), charSpace: 1.2
    });
  }
  slide.addText(title, { x: 0.72, y: 1.30, w: 7.7, h: 0.72, ...textStyle(28.5, true, C.pureWhite), fit: "shrink" });
  addFooter(slide, n, signerName);
}

function addAccent(slide: any, x: number, y: number, w = 0.95) {
  slide.addShape("line", { x, y, w, h: 0, line: { color: C.cyan, width: 3 } });
}

function addTextBlock(slide: any, heading: string, body: string, x: number, y: number, w: number, h: number) {
  slide.addShape("line", { x, y: y + 0.06, w: 0, h: h - 0.1, line: { color: C.cyan, width: 2.1 } });
  slide.addText(heading, { x: x + 0.22, y, w: w - 0.22, h: 0.34, ...textStyle(13.2, true, C.pureWhite), fit: "shrink" });
  slide.addText(body, { x: x + 0.22, y: y + 0.48, w: w - 0.22, h: h - 0.5, ...textStyle(10.2, false, C.gray), fit: "shrink" });
}

function splitBullets(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(/\n|•|- /g)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function fallbackDeckContent(req: DeckRequest): DeckContent {
  const type = req.presentationType || "BESS";
  const infoBullets = splitBullets(req.keyInformation || req.context);
  const defaultBullets = infoBullets.length ? infoBullets : [
    "Cero inversión inicial para acelerar la decisión.",
    "Estructura clara de pagos, responsabilidades y próximos pasos.",
    "Acompañamiento técnico-financiero de KAM durante el proceso."
  ];

  return {
    title: req.title || `${type} | Presentación KAM`,
    subtitle: "Solución financiera para proyectos solares y almacenamiento",
    presentationType: type,
    audience: "EPC, integrador u offtaker",
    closingLine: "KAM convierte oportunidades energéticas en proyectos financiados, cerrados y en operación.",
    slides: [
      {
        eyebrow: "Contexto ejecutivo",
        title: "La energía ya no es solo un costo operativo",
        headline: "Un proyecto bien estructurado convierte la gestión energética en una herramienta de competitividad.",
        bullets: defaultBullets.slice(0, 4)
      },
      {
        eyebrow: "Propuesta de valor",
        title: `Qué resuelve ${type}`,
        headline: "KAM reduce la barrera financiera y ordena la toma de decisión.",
        bullets: [
          "Preserva liquidez del cliente.",
          "Alinea alcance técnico, contrato y calendario de pagos.",
          "Reduce fricción entre EPC, cliente final y equipo financiero.",
          "Integra una narrativa comercial clara para dirección y jurídico."
        ]
      },
      {
        eyebrow: "Beneficios",
        title: "Decisión financiera con menos fricción",
        bullets: [
          "Sin CAPEX inicial, sujeto a aprobación del caso.",
          "Cuotas o pagos claros conforme al producto financiero.",
          "O&M, monitoreo y seguros según la estructura aplicable.",
          "Proceso documentado para avanzar a firma y ejecución."
        ]
      },
      {
        eyebrow: "Modelo",
        title: "Cómo avanzamos del análisis a la ejecución",
        bullets: [
          "Evaluación técnica y de consumo.",
          "Definición de esquema financiero.",
          "Integración documental y aprobación.",
          "Firma contractual.",
          "Construcción, puesta en marcha y seguimiento."
        ]
      },
      {
        eyebrow: "Siguientes pasos",
        title: "Ruta de decisión",
        bullets: [
          "Validar objetivo energético y caso de negocio.",
          "Confirmar alcance técnico y sitio.",
          "Completar documentación.",
          "Definir condiciones económicas.",
          "Preparar versión final para firma."
        ]
      }
    ]
  };
}

export async function buildDeck(req: DeckRequest): Promise<Buffer> {
  const content = req.deckContent || fallbackDeckContent(req);

  const [logoWhite, isotype, heroImage, secondaryImage] = await Promise.all([
    fetchAsDataUrl(req.assets?.logoWhite),
    fetchAsDataUrl(req.assets?.isotype),
    fetchAsDataUrl(req.assets?.heroImages?.[0]),
    fetchAsDataUrl(req.assets?.heroImages?.[1] || req.assets?.heroImages?.[0])
  ]);

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Kishoa Asset Management";
  pptx.company = "Kishoa Asset Management";
  pptx.subject = "Presentación generada por KAM Deck Generator";
  pptx.title = content.title;
  pptx.lang = "es-MX";
  pptx.theme = {
    headFontFace: "Montserrat",
    bodyFontFace: "Montserrat",
    lang: "es-MX"
  };

  // Cover
  {
    const slide = pptx.addSlide();
    addBg(slide, C.black);
    if (heroImage) {
      slide.addImage({ data: heroImage, x: 5.75, y: 0, w: 7.58, h: 7.5 });
      slide.addShape("rect", { x: 5.75, y: 0, w: 7.58, h: 7.5, fill: { color: "000000", transparency: 25 }, line: { color: "000000", transparency: 100 } });
    }
    slide.addShape("rect", { x: 0, y: 0, w: 5.95, h: 7.5, fill: { color: C.black }, line: { color: C.black, transparency: 100 } });
    addLogo(slide, logoWhite, 0.70, 0.68, 1.55, 0.46);
    slide.addText(content.title, { x: 0.73, y: 2.45, w: 5.05, h: 1.55, ...textStyle(34, true, C.pureWhite), fit: "shrink", breakLine: false });
    slide.addText(content.subtitle, { x: 0.75, y: 4.72, w: 4.85, h: 0.78, ...textStyle(14.2, false, C.white), fit: "shrink", breakLine: false });
    slide.addText("Financiamiento ágil, transparente y especializado", { x: 0.75, y: 6.48, w: 5.0, h: 0.24, ...textStyle(10.5, false, C.white) });
    slide.addShape("rect", { x: 0.05, y: 0.05, w: 13.23, h: 7.40, fill: { color: C.black, transparency: 100 }, line: { color: C.white, transparency: 45, width: 0.4 } });
  }

  // Generated content slides
  content.slides.slice(0, 6).forEach((s, idx) => {
    const slide = pptx.addSlide();
    addBg(slide, C.black);
    addHeader(slide, logoWhite, s.title, s.eyebrow, idx + 2, req.signer?.name);

    if (idx === 0 && secondaryImage) {
      slide.addImage({ data: secondaryImage, x: 9.35, y: 0, w: 3.98, h: 7.5 });
      slide.addShape("rect", { x: 9.35, y: 0, w: 3.98, h: 7.5, fill: { color: "000000", transparency: 42 }, line: { color: "000000", transparency: 100 } });
    }

    if (s.headline) {
      slide.addText(s.headline, { x: 0.76, y: 2.42, w: 7.9, h: 0.92, ...textStyle(20.5, true, C.pureWhite), fit: "shrink", breakLine: false });
      addAccent(slide, 0.76, 3.55, 0.95);
    }

    const bullets = (s.bullets || []).slice(0, 6);
    const startY = s.headline ? 4.22 : 2.55;
    bullets.forEach((b, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.80 + col * 5.35;
      const y = startY + row * 0.92;
      addTextBlock(slide, String(i + 1).padStart(2, "0"), b, x, y, 4.55, 0.68);
    });

    if (isotype && idx === 1) {
      slide.addImage({ data: isotype, x: 10.40, y: 2.35, w: 1.95, h: 1.55, transparency: 78 });
    }
  });

  // Signer / closing slide
  {
    const slide = pptx.addSlide();
    addBg(slide, C.black);
    addLogo(slide, logoWhite, 0.70, 0.68, 1.55, 0.46);
    slide.addText("Siguientes pasos", { x: 0.75, y: 1.62, w: 5.6, h: 0.7, ...textStyle(32, true, C.pureWhite), fit: "shrink" });
    slide.addText(content.closingLine || "KAM convierte proyectos energéticos en decisiones financieras viables.", {
      x: 0.78, y: 2.58, w: 7.6, h: 0.7, ...textStyle(16.3, true, C.pureWhite), fit: "shrink", breakLine: false
    });
    addAccent(slide, 0.78, 3.52, 1.15);

    slide.addText("Contacto", { x: 0.78, y: 4.52, w: 2.4, h: 0.36, ...textStyle(16, true, C.cyan) });
    const signer = req.signer || { name: "", email: "", phone: "", address: "" };
    slide.addText(signer.name || "Nombre del asesor KAM", { x: 0.78, y: 5.03, w: 4.8, h: 0.32, ...textStyle(13.5, true, C.pureWhite) });
    slide.addText([signer.email, signer.phone, signer.address].filter(Boolean).join("\n"), {
      x: 0.78, y: 5.48, w: 6.3, h: 0.82, ...textStyle(10.2, false, C.gray), fit: "shrink", breakLine: false
    });

    if (heroImage) {
      slide.addImage({ data: heroImage, x: 8.2, y: 0, w: 5.13, h: 7.5 });
      slide.addShape("rect", { x: 8.2, y: 0, w: 5.13, h: 7.5, fill: { color: "000000", transparency: 38 }, line: { color: "000000", transparency: 100 } });
    }
    slide.addText("Documento comercial de apoyo. La versión contractual y anexos prevalecen en caso de diferencia.", {
      x: 0.78, y: 6.83, w: 7.0, h: 0.2, ...textStyle(7.2, false, C.gray2)
    });
  }

  const buffer = await pptx.write({ outputType: "nodebuffer" });
  return Buffer.from(buffer as ArrayBuffer);
}