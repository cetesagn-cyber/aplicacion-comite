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

  return { ...extractFromText(text, 'pdf-parse'), texto_extraido: text.slice(0, 3000) };
}

// ── 3. Extractor imagen/PDF escaneado — Tesseract OCR ────────────────────────

async function extractFromImage(buffer) {
  const { data: { text } } = await Tesseract.recognize(buffer, 'spa+eng', {
    logger: () => {},
  });
  return { ...extractFromText(text || '', 'tesseract-ocr'), texto_extraido: text.slice(0, 3000) };
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
        resultado = await extractFromImage(buffer);
        resultado.metodo = 'tesseract-ocr (pdf-fallback)';
      }
    } else if (['image/jpeg','image/png','image/jpg'].includes(mimetype) || ['.jpg','.jpeg','.png'].includes(ext)) {
      resultado = await extractFromImage(buffer);
    } else {
      resultado = { metodo: 'none', campos: {}, confianza_global: 0 };
    }
  } catch (err) {
    resultado = { metodo: 'error', campos: {}, confianza_global: 0, error: err.message };
  }

  resultado.tiempo_ms = Date.now() - inicio;
  return resultado;
}

module.exports = { extractDocument };
