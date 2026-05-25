/**
 * extractor.js — Lectura inteligente de documentos (sin IA generativa)
 *
 * Estrategias:
 *   XML  → fast-xml-parser  (facturas electrónicas DIAN / CFDI / UBL)
 *   PDF  → pdf-parse + regex (PDFs digitales con texto embebido)
 *   IMG  → tesseract.js OCR  (imágenes y PDFs escaneados)
 */

const pdfParse     = require('pdf-parse');
const { XMLParser } = require('fast-xml-parser');
const Tesseract    = require('tesseract.js');
const path         = require('path');
const { createChatCompletion, isAiConfigured } = require('./aiClient');

// ── Utilidades ────────────────────────────────────────────────────────────────

function limpiarNumero(str) {
  if (str === null || str === undefined) return null;
  const s = String(str).replace(/\s/g, '');
  // Formato colombiano: 1.500.000,00  →  1500000.00
  const col = s.match(/^[\$]?([\d.]+),(\d{2})$/);
  if (col) return parseFloat(col[1].replace(/\./g, '') + '.' + col[2]);
  // Formato estándar: 1,500,000.00
  const std = s.replace(/,/g, '');
  const n   = parseFloat(std.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? null : n;
}

function limpiarFecha(str) {
  if (!str) return null;
  // YYYY-MM-DD
  const iso = str.match(/(\d{4})[\/\-](\d{2})[\/\-](\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  // DD/MM/YYYY o DD-MM-YYYY
  const dmy = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2,'0')}-${dmy[1].padStart(2,'0')}`;
  return null;
}

function calcularConfianzaGlobal(campos) {
  const claves = ['numero_factura','nit_proveedor','nombre_proveedor',
                  'fecha_emision','valor_base','iva','valor_total'];
  const encontrados = claves.filter(k => campos[k] !== null && campos[k] !== undefined).length;
  return Math.round((encontrados / claves.length) * 100);
}

function str(value) {
  if (value === null || value === undefined) return null;
  return String(value).trim() || null;
}

function parseJsonFromText(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text.match(/({[\s\S]*})/m)?.[1];
  if (!candidate) throw new Error('No se encontró JSON en la respuesta');
  return JSON.parse(candidate);
}

function normalizeAiFields(raw) {
  return {
    numero_factura: str(raw.numero_factura),
    nit_proveedor: str(raw.nit_proveedor),
    nombre_proveedor: str(raw.nombre_proveedor),
    fecha_emision: limpiarFecha(str(raw.fecha_emision)),
    fecha_vencimiento: limpiarFecha(str(raw.fecha_vencimiento)),
    cufe: str(raw.cufe),
    valor_base: limpiarNumero(raw.valor_base),
    iva: limpiarNumero(raw.iva),
    valor_total: limpiarNumero(raw.valor_total),
    orden_compra: str(raw.orden_compra),
    es_proforma: raw.es_proforma === true || /pro[\s\-]?forma/i.test(str(raw.es_proforma) || '') || false,
  };
}

function shouldUseAI(campos) {
  const required = ['numero_factura', 'nit_proveedor', 'nombre_proveedor', 'fecha_emision', 'valor_total'];
  if (!isAiConfigured()) return false;
  if (campos.confianza_global >= 70) return false;
  return required.some(key => !campos.campos?.[key]);
}

async function extractFromAI(text, metodo) {
  if (!isAiConfigured()) throw new Error('OpenAI API key no configurada');

  const outputText = await createChatCompletion([
    {
      role: 'system',
      content: 'Eres un extractor de facturas. Responde únicamente con JSON válido.',
    },
    {
      role: 'user',
      content:
        'Extrae estas propiedades: numero_factura, nit_proveedor, nombre_proveedor, fecha_emision, fecha_vencimiento, cufe, valor_base, iva, valor_total, orden_compra, es_proforma.\n' +
        'Usa fechas en formato YYYY-MM-DD y números sin separadores de miles. Si un valor no puede encontrarse, devuélvelo como null.\n\n' +
        `Texto:\n${text}`,
    },
  ], { json: true, temperature: 0 });

  const aiData = parseJsonFromText(outputText);
  const campos = normalizeAiFields(aiData);

  return {
    metodo: `${metodo}-ai`,
    campos,
    confianza_global: calcularConfianzaGlobal(campos),
  };
}

async function tryAiEnhancement(result, text, metodo) {
  if (!shouldUseAI(result)) return result;
  try {
    return await extractFromAI(text, metodo);
  } catch (e) {
    console.warn('⚠️  Extracción AI fallida:', e.message);
    return result;
  }
}

// ── 1. Extractor XML — Factura Electrónica DIAN (UBL 2.1) ────────────────────

function extractFromXML(buffer) {
  const parser = new XMLParser({
    ignoreAttributes:    false,
    attributeNamePrefix: '@_',
    removeNSPrefix:      true,   // elimina prefijos cbc:, cac:, fe:, etc.
  });

  let obj;
  try {
    obj = parser.parse(buffer.toString('utf8'));
  } catch (e) {
    throw new Error('XML inválido: ' + e.message);
  }

  // La factura puede estar directamente o dentro de extensiones
  const inv = obj?.Invoice || obj?.CreditNote || obj?.DebitNote || obj;

  const getPath = (root, ...keys) => {
    let cur = root;
    for (const k of keys) {
      if (cur === undefined || cur === null) return null;
      cur = cur[k];
    }
    return cur ?? null;
  };

  const str = (v) => (v !== null && v !== undefined ? String(v).trim() : null);

  const numero_factura    = str(getPath(inv, 'ID'));
  const cufe              = str(getPath(inv, 'UUID'));
  const fecha_emision     = limpiarFecha(str(getPath(inv, 'IssueDate')));
  const fecha_vencimiento = limpiarFecha(str(getPath(inv, 'DueDate')));

  // Proveedor
  const supplierParty = getPath(inv, 'AccountingSupplierParty', 'Party')
                     || getPath(inv, 'AccountingSupplierParty');
  const nombre_proveedor = str(
    getPath(supplierParty, 'PartyLegalEntity', 'RegistrationName') ||
    getPath(supplierParty, 'PartyName', 'Name')
  );
  const nit_proveedor = str(
    getPath(supplierParty, 'PartyIdentification', 'ID') ||
    getPath(supplierParty, 'PartyTaxScheme', 'CompanyID')
  );

  // Totales
  const legal       = getPath(inv, 'LegalMonetaryTotal');
  const valor_base  = limpiarNumero(getPath(legal, 'LineExtensionAmount') || getPath(legal, 'TaxExclusiveAmount'));
  const valor_total = limpiarNumero(getPath(legal, 'PayableAmount')        || getPath(legal, 'TaxInclusiveAmount'));

  // IVA (puede ser array o objeto)
  const taxTotal = getPath(inv, 'TaxTotal');
  const taxArr   = Array.isArray(taxTotal) ? taxTotal : taxTotal ? [taxTotal] : [];
  const iva      = limpiarNumero(taxArr.reduce((s, t) => s + (parseFloat(t?.TaxAmount) || 0), 0) || null);

  // Items
  const lines        = getPath(inv, 'InvoiceLine');
  const lineArr      = Array.isArray(lines) ? lines : lines ? [lines] : [];
  const descripcion_items = lineArr
    .map(l => str(getPath(l, 'Item', 'Description') || getPath(l, 'Item', 'Name')))
    .filter(Boolean)
    .join('; ')
    .slice(0, 500) || null;

  const campos = {
    numero_factura, nit_proveedor, nombre_proveedor,
    fecha_emision, fecha_vencimiento, cufe,
    valor_base, iva, valor_total,
    descripcion_items,
    es_proforma: false,
    orden_compra: null,
  };

  return {
    metodo:           'xml-parser',
    campos,
    confianza_global: calcularConfianzaGlobal(campos),
  };
}

// ── 2. Extractor PDF digital — pdf-parse + regex ──────────────────────────────

async function extractFromPDF(buffer) {
  let text = '';
  try {
    const data = await pdfParse(buffer);
    text = data.text || '';
  } catch (e) {
    throw new Error('No se pudo leer el PDF: ' + e.message);
  }

  if (text.trim().length < 30) {
    throw new Error('PDF sin texto embebido — usar OCR');
  }

  const extracted = await extractFromText(text, 'pdf-parse');
  const enhanced  = await tryAiEnhancement(extracted, text, 'pdf-parse');
  return { ...enhanced, texto_extraido: text.slice(0, 3000) };
}

// ── 3. Extractor imagen/PDF escaneado — Tesseract OCR ────────────────────────

async function extractFromImage(buffer) {
  let text = '';
  try {
    // Establecer timeout para Tesseract (30 segundos máximo)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Tesseract timeout después de 30s')), 30000)
    );
    
    const recognitionPromise = Tesseract.recognize(buffer, 'spa+eng', {
      logger: () => {},
    });
    
    const { data: { text: recognizedText } } = await Promise.race([recognitionPromise, timeoutPromise]);
    text = recognizedText || '';
  } catch (err) {
    console.warn('⚠️  Tesseract OCR error:', err.message);
    // Si Tesseract falla, retornar resultado vacío pero sin crashear
    return {
      metodo: 'tesseract-ocr-error',
      campos: {},
      confianza_global: 0,
      error: 'No se pudo procesar la imagen con OCR: ' + err.message,
      texto_extraido: '',
    };
  }

  const extracted = await extractFromText(text || '', 'tesseract-ocr');
  const enhanced  = await tryAiEnhancement(extracted, text || '', 'tesseract-ocr');
  return { ...enhanced, texto_extraido: text.slice(0, 3000) };
}

// ── Extracción de campos desde texto plano (compartida por PDF + OCR) ─────────

function extractFromText(text, metodo) {
  const find = (...patterns) => {
    for (const re of patterns) {
      const m = text.match(re);
      if (m) return (m[1] ?? m[0]).trim();
    }
    return null;
  };

  const numero_factura = find(
    /(?:factura\s*(?:n[oú°]\.?|número|electr[oó]nica)?|invoice\s*(?:no\.?|#)?|fv)[:\s#\-]*([A-Z0-9\-]{3,25})/i,
    /\b(FV?[-\s]?\d{3,})\b/i,
    /\b(F[EI]\d{5,})\b/,
  );

  const nit_proveedor = find(
    /(?:nit|r\.u\.t\.|rut)[:\.\s]*(\d{6,12}[\-\s]?\d?)/i,
    /\b(\d{9,10}[-]\d)\b/,
  );

  const nombre_proveedor = find(
    /(?:raz[oó]n\s*social|empresa|proveedor|emisor|señor(?:es)?)[:\s]+([^\n\r]{5,80})/i,
  );

  const fecha_emision = limpiarFecha(find(
    /(?:fecha\s*(?:de\s*)?(?:emisi[oó]n|factura|expedici[oó]n|elaboraci[oó]n))[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    /(?:fecha)[:\s]*(\d{4}-\d{2}-\d{2})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/,
  ));

  const fecha_vencimiento = limpiarFecha(find(
    /(?:vencimiento|vence\s*el|due\s*date|fecha\s*l[ií]mite\s*pago|fecha\s*de\s*pago)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
  ));

  const valor_total = limpiarNumero(find(
    /(?:total\s*(?:a\s*pagar|factura|comprobante)?|valor\s*total|grand\s*total|importe\s*total)[:\s\$COP]*([0-9]{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,
  ));

  const valor_base = limpiarNumero(find(
    /(?:subtotal|base\s*gravable|valor\s*base|base\s*imponible)[:\s\$COP]*([0-9]{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,
  ));

  const iva = limpiarNumero(find(
    /(?:iva\s*(?:19\s*%)?|i\.v\.a\.|impuesto\s*valor\s*agregado)[:\s\$COP]*([0-9]{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,
  ));

  const cufe = find(
    /(?:cufe|cuds)[:\s]*([A-Fa-f0-9]{60,100})/i,
  );

  const orden_compra = find(
    /(?:orden\s*de\s*compra|o\.?\s*c\.?|oc\s*n[oú°]?\.?)[:\s#]*([A-Z0-9\-]{4,20})/i,
  );

  const es_proforma = /pro[\s\-]?forma|cotizaci[oó]n|presupuesto/i.test(text);

  const campos = {
    numero_factura, nit_proveedor, nombre_proveedor,
    fecha_emision, fecha_vencimiento, cufe,
    valor_base, iva, valor_total,
    descripcion_items: null,
    es_proforma,
    orden_compra,
  };

  return { metodo, campos, confianza_global: calcularConfianzaGlobal(campos) };
}

// ── Dispatcher principal ──────────────────────────────────────────────────────

async function extractDocument(buffer, mimetype, filename) {
  const ext = path.extname(filename || '').toLowerCase();
  const inicio = Date.now();

  let resultado;
  try {
    if (mimetype === 'text/xml' || mimetype === 'application/xml' || ext === '.xml') {
      resultado = extractFromXML(buffer);
    } else if (mimetype === 'application/pdf' || ext === '.pdf') {
      try {
        resultado = await extractFromPDF(buffer);
      } catch (e) {
        // PDF escaneado sin texto — fallback a OCR
        console.log('⚠️  PDF sin texto embebido, usando OCR:', e.message);
        try {
          resultado = await extractFromImage(buffer);
          resultado.metodo = 'tesseract-ocr (pdf-fallback)';
        } catch (ocrErr) {
          console.warn('⚠️  OCR también falló:', ocrErr.message);
          resultado = {
            metodo: 'fallback-failed',
            campos: {},
            confianza_global: 0,
            error: 'No se pudo procesar el PDF: ' + ocrErr.message,
          };
        }
      }
    } else if (['image/jpeg','image/png','image/jpg'].includes(mimetype) || ['.jpg','.jpeg','.png'].includes(ext)) {
      resultado = await extractFromImage(buffer);
    } else {
      resultado = { metodo: 'none', campos: {}, confianza_global: 0 };
    }
  } catch (err) {
    console.error('❌ Error critical en extractDocument:', err.message);
    resultado = { metodo: 'error', campos: {}, confianza_global: 0, error: err.message };
  }

  resultado.tiempo_ms = Date.now() - inicio;
  return resultado;
}

module.exports = { extractDocument };
