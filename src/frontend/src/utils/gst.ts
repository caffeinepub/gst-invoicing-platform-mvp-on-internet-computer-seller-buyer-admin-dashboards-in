import type { GSTType } from '../backend';

export function formatGSTType(gstType: GSTType): string {
  if (gstType.__kind__ === 'cgstSgst') {
    return `CGST/SGST ${gstType.cgstSgst}%`;
  }
  return `IGST ${gstType.igst}%`;
}

export function calculateGSTAmount(taxableAmount: number, gstType: GSTType): number {
  const rate = gstType.__kind__ === 'cgstSgst' ? gstType.cgstSgst : gstType.igst;
  return (taxableAmount * rate) / 100;
}

export function getGSTBreakdown(taxableAmount: number, gstType: GSTType) {
  const totalGST = calculateGSTAmount(taxableAmount, gstType);
  
  if (gstType.__kind__ === 'cgstSgst') {
    const cgst = totalGST / 2;
    const sgst = totalGST / 2;
    return {
      type: 'CGST/SGST',
      cgst,
      sgst,
      igst: 0,
      total: totalGST,
    };
  }
  
  return {
    type: 'IGST',
    cgst: 0,
    sgst: 0,
    igst: totalGST,
    total: totalGST,
  };
}
