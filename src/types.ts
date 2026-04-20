export interface ImportProduct {
  id: string;
  pName: string;
  pEnglish: string;
  pSpecs: string;
  pKeys: string;
  pBrands: string;
  pPrice: string;
  pQty: string;
  pLink: string;
  pExtra: string;
  pAdditionalInfo: string;
  pImages: string[];
}

export interface ImportFicha {
  clientName: string;
  products: ImportProduct[];
}
