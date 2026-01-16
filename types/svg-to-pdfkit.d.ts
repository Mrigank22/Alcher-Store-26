declare module 'svg-to-pdfkit' {
  import PDFDocument from 'pdfkit';
  
  interface SVGtoPDFOptions {
    width?: number;
    height?: number;
    preserveAspectRatio?: string;
    useCSS?: boolean;
    fontCallback?: (family: string, bold: boolean, italic: boolean) => string;
    imageCallback?: (link: string) => string;
    documentCallback?: (file: string) => string;
    colorCallback?: (result: string) => string;
    warningCallback?: (str: string) => void;
    assumePt?: boolean;
    precision?: number;
  }
  
  function SVGtoPDF(
    doc: PDFDocument,
    svg: string,
    x?: number,
    y?: number,
    options?: SVGtoPDFOptions
  ): void;
  
  export = SVGtoPDF;
}
