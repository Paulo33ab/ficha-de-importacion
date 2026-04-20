/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Send, 
  Package, 
  Globe, 
  FileText, 
  CheckCircle2, 
  DollarSign, 
  Layers, 
  Link as LinkIcon, 
  Stamp,
  ExternalLink,
  ClipboardList,
  Download,
  ImagePlus,
  X
} from 'lucide-react';
import { ImportProduct } from './types';

const STORAGE_KEY = 'mingta_ficha_data';

export default function App() {
  const [products, setProducts] = useState<ImportProduct[]>([]);
  const [clientName, setClientName] = useState('');
  const [editingProduct, setEditingProduct] = useState<ImportProduct | null>(null);
  const [formData, setFormData] = useState<Partial<ImportProduct>>({
    pName: '',
    pEnglish: '',
    pSpecs: '',
    pKeys: '',
    pBrands: '',
    pPrice: '',
    pQty: '',
    pLink: '',
    pExtra: '',
    pAdditionalInfo: '',
    pCurrency: '',
    pImages: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.clientName) setClientName(parsed.clientName);
      } catch (e) {
        console.error('Error loading saved data', e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ products, clientName }));
  }, [products, clientName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addProduct = () => {
    if (!formData.pName) {
      alert('Por favor, ingrese al menos el nombre del producto.');
      return;
    }

    const newProduct: ImportProduct = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      pName: formData.pName!,
      pEnglish: formData.pEnglish || '',
      pSpecs: formData.pSpecs || '',
      pKeys: formData.pKeys || '',
      pBrands: formData.pBrands || '',
      pPrice: formData.pPrice || '',
      pQty: formData.pQty || '',
      pLink: formData.pLink || '',
      pExtra: formData.pExtra || '',
      pAdditionalInfo: formData.pAdditionalInfo || '',
      pCurrency: formData.pCurrency || '',
      pImages: formData.pImages || []
    };

    setProducts(prev => [...prev, newProduct]);
    setFormData({
      pName: '',
      pEnglish: '',
      pSpecs: '',
      pKeys: '',
      pBrands: '',
      pPrice: '',
      pQty: '',
      pLink: '',
      pExtra: '',
      pAdditionalInfo: '',
      pCurrency: '',
      pImages: []
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateProduct = () => {
    if (!editingProduct || !editingProduct.pName) {
      alert('Por favor, ingrese al menos el nombre del producto.');
      return;
    }

    setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
    setEditingProduct(null);
  };

  const openEditModal = (product: ImportProduct) => {
    setEditingProduct({ ...product, pImages: product.pImages || [], pAdditionalInfo: product.pAdditionalInfo || '' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'form' | 'edit') => {
    const files = e.target.files;
    if (!files) return;

    const currentImages = target === 'form' ? (formData.pImages || []) : (editingProduct?.pImages || []);
    const remaining = 5 - currentImages.length;

    if (remaining <= 0) {
      alert('Máximo 5 imágenes por producto.');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remaining);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        if (target === 'form') {
          setFormData(prev => ({ ...prev, pImages: [...(prev.pImages || []), base64] }));
        } else if (editingProduct) {
          setEditingProduct(prev => prev ? { ...prev, pImages: [...(prev.pImages || []), base64] } : prev);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number, target: 'form' | 'edit') => {
    if (target === 'form') {
      setFormData(prev => ({ ...prev, pImages: (prev.pImages || []).filter((_, i) => i !== index) }));
    } else if (editingProduct) {
      setEditingProduct(prev => prev ? { ...prev, pImages: (prev.pImages || []).filter((_, i) => i !== index) } : prev);
    }
  };

  const generatePDF = () => {
    if (products.length === 0) {
      alert('La lista de productos está vacía.');
      return;
    }

    import('jspdf').then(({ jsPDF }) => {
      import('jspdf-autotable').then(({ default: autoTable }) => {
        const doc = new jsPDF();
        const client = clientName || 'Cliente No Identificado';
        
        // Add Header
        doc.setFillColor(232, 81, 18); // Retro Orange
        doc.rect(0, 0, 210, 20, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('FICHA DE INTENCIÓN DE IMPORTACIÓN', 14, 13);
        
        // Add Subheader / Client Info
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(10);
        doc.text(`CLIENTE / EMPRESA: ${client.toUpperCase()}`, 14, 30);
        doc.text(`FECHA: ${new Date().toLocaleDateString()}`, 160, 30);
        
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 34, 196, 34);

        let currentY = 42;

        products.forEach((p, i) => {
          doc.setFillColor(245, 245, 245);
          doc.rect(14, currentY, 182, 8, 'F');
          
          doc.setTextColor(30, 30, 30);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text(`PRODUCTO ${i + 1}: ${p.pName.toUpperCase()}`, 16, currentY + 6);
          currentY += 12;

          const data = [
            ['Nombre Comercial', p.pName],
            ['Nombre en Inglés', p.pEnglish || '-'],
            ['Especificaciones', p.pSpecs || '-'],
            ['Puntos Clave / Cert.', p.pKeys || '-'],
            ['Marcas de Referencia', p.pBrands || '-'],
            ['Precio (IVA incluido)', p.pPrice ? `${p.pPrice} ${p.pCurrency || ''}`.trim() : '-'],
            ['Cantidad Estimada', p.pQty || '-'],
            ['URL de Referencia', p.pLink || '-'],
            ['Info. Adicional', p.pAdditionalInfo || '-']
          ];

          autoTable(doc, {
            startY: currentY,
            body: data,
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 2 },
            columnStyles: {
              0: { fontStyle: 'bold', textColor: [100, 100, 100], cellWidth: 50 },
              1: { textColor: [40, 40, 40] }
            },
            margin: { left: 14, right: 14 }
          });

          // @ts-ignore
          currentY = doc.lastAutoTable.finalY + 8;

          if (p.pImages && p.pImages.length > 0) {
            if (currentY + 40 > 280) {
              doc.addPage();
              currentY = 20;
            }
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text('Imágenes de Referencia:', 14, currentY);
            currentY += 4;
            
            p.pImages.forEach((img, imgIdx) => {
              const xInfo = 14 + (imgIdx * 34);
              try {
                doc.addImage(img, 'JPEG', xInfo, currentY, 30, 30);
              } catch (e) {
                console.error("Error adding image to PDF", e);
              }
            });
            currentY += 38;
          }

          if (currentY > 260 && i < products.length - 1) {
            doc.addPage();
            currentY = 20;
          }
        });

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generado por Mingta Group Latam App', 14, 290);

        doc.save(`Ficha_Importacion_${client.replace(/\s+/g, '_')}.pdf`);
      });
    });
  };

  return (
    <div className="min-h-screen bg-light-bg text-black-nero p-6 md:p-10 flex flex-col font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center border-b border-zinc-200 pb-6 mb-10">
        <div className="text-left">
          <h2 className="text-2xl md:text-3xl font-serif text-black-nero tracking-normal font-medium">Ficha de Intención de Importación</h2>
        </div>
        <div className="flex items-center mt-6 md:mt-0">
          <img 
            src="https://static.wixstatic.com/media/f0de02_bdc4442ec101402d919878e0530c3d03~mv2.png/v1/fill/w_308,h_90,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/LOGOG-PARA-LUCRECIA.png" 
            alt="Mingta Group" 
            className="h-10 opacity-90 object-contain hover:opacity-100 transition-opacity"
            referrerPolicy="no-referrer"
          />
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Form Section - Col 7 */}
        <section className="md:col-span-7 flex flex-col space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-7 bg-retro-orange"></div>
            <h3 className="text-xl font-serif text-black-nero">Especificaciones de Producto</h3>
          </div>

          <div className="bg-white p-8 rounded-lg border border-zinc-200 flex-1 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-5">
                <div>
                  <label className="label-tech block mb-2">Nombre Comercial *</label>
                  <input
                    type="text"
                    name="pName"
                    value={formData.pName}
                    onChange={handleInputChange}
                    placeholder="Ej: Inversor Híbrido 5kW"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-tech block mb-2">Nombre en Inglés (Aduana)</label>
                  <input
                    type="text"
                    name="pEnglish"
                    value={formData.pEnglish}
                    onChange={handleInputChange}
                    placeholder="Hybrid Solar Inverter"
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label-tech block mb-2">Cant. Estimada</label>
                    <input
                      type="text"
                      name="pQty"
                      value={formData.pQty}
                      onChange={handleInputChange}
                      placeholder="1 x 20FT"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label-tech block mb-2">Precio (IVA inc.)</label>
                    <input
                      type="text"
                      name="pPrice"
                      value={formData.pPrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label-tech block mb-2">Moneda</label>
                    <input
                      type="text"
                      name="pCurrency"
                      value={formData.pCurrency}
                      onChange={handleInputChange}
                      placeholder="USD, ARS..."
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="label-tech block mb-2">Marcas de Referencia</label>
                  <input
                    type="text"
                    name="pBrands"
                    value={formData.pBrands}
                    onChange={handleInputChange}
                    placeholder="Growatt, Deye, Huawei"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="label-tech block mb-2">Especificación Técnica</label>
                  <textarea
                    name="pSpecs"
                    value={formData.pSpecs}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Detalles de composición, materiales, potencias..."
                    className="input-field h-28 resize-none"
                  />
                </div>
                <div>
                  <label className="label-tech block mb-2">Puntos clave que debe cumplir el producto / Certificaciones</label>
                  <input
                    type="text"
                    name="pKeys"
                    value={formData.pKeys}
                    onChange={handleInputChange}
                    placeholder="ISO, CE, RETIE"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-tech block mb-2">URL de Referencia</label>
                  <input
                    type="url"
                    name="pLink"
                    value={formData.pLink}
                    onChange={handleInputChange}
                    placeholder="https://alibaba.com/item/..."
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Full-width additional fields */}
            <div className="mt-6 space-y-5">
              <div>
                <label className="label-tech block mb-2">Información Relevante Adicional</label>
                <textarea
                  name="pAdditionalInfo"
                  value={formData.pAdditionalInfo}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Normas específicas, requisitos especiales, observaciones..."
                  className="input-field h-20 resize-none"
                />
              </div>
              <div>
                <label className="label-tech block mb-2">Imágenes de Referencia (máx. 5)</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {(formData.pImages || []).map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-200 group">
                      <img src={img} alt={`Ref ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx, 'form')}
                        className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {(formData.pImages || []).length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-xs text-storm-dust border border-dashed border-zinc-300 rounded-lg px-4 py-3 hover:border-retro-orange hover:text-retro-orange transition-colors"
                  >
                    <ImagePlus className="w-4 h-4" /> Agregar imágenes
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'form')}
                />
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                onClick={addProduct}
                className="btn-orange w-full py-4 rounded text-sm tracking-widest font-bold uppercase transition-all"
              >
                + Añadir a la Ficha Actual
              </button>
            </div>
          </div>
        </section>

        {/* Resume Section - Col 5 */}
        <section className="md:col-span-5 flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-7 bg-zinc-200"></div>
              <h3 className="text-xl font-serif text-black-nero">Resumen de Carga</h3>
            </div>
            <span className="bg-zinc-100 text-zinc-500 px-3 py-1 text-[10px] rounded-full font-bold uppercase tracking-wider border border-zinc-200">
              {products.length} {products.length === 1 ? 'Producto' : 'Productos'}
            </span>
          </div>

          <div className="flex-1 bg-white border border-zinc-200 rounded-lg flex flex-col shadow-sm relative overflow-hidden min-h-[400px]">
            {/* List area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[500px]">
              <AnimatePresence mode="popLayout">
                {products.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-300 py-12">
                    <Package className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Lista vacía</p>
                  </div>
                ) : (
                  products.map((p, idx) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="border-l-2 border-retro-orange pl-4 py-2 group relative transition-all hover:bg-zinc-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-black-nero text-sm tracking-wide">{p.pName}</h4>
                          <span className="text-[10px] text-storm-dust font-bold tracking-tight">
                            {p.pQty || 'Cant. no espec.'} | Ref: {p.pPrice ? `${p.pPrice} ${p.pCurrency || ''}`.trim() : '-'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(p)}
                            className="text-zinc-300 hover:text-retro-orange transition-colors p-1"
                            title="Editar"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeProduct(p.id)}
                            className="text-zinc-300 hover:text-red-500 transition-colors p-1"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {p.pSpecs && (
                        <p className="text-[11px] text-storm-dust mt-1 italic line-clamp-1">{p.pSpecs}</p>
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Actions area */}
            <div className="p-6 bg-zinc-50 border-t border-zinc-200 space-y-5">
              <div>
                <label className="label-tech block mb-2">Empresa / Solicitante</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej: Soluciones Energéticas S.A."
                  className="input-field py-3 border-zinc-200"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={generatePDF}
                  className="bg-black-nero text-white hover:bg-retro-orange py-4 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg"
                >
                  <Download className="w-4 h-4" /> Descargar Ficha en PDF
                </button>
              </div>
              <p className="text-[9px] text-center text-storm-dust italic">
                * El PDF se generará con diseño corporativo
              </p>
            </div>
            
            {/* Decorator */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-retro-orange/5 to-transparent rotate-45 translate-x-8 -translate-y-8" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center text-[10px] text-storm-dust uppercase tracking-[0.2em] font-medium gap-4">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <span>&copy; 2024 Mingta Group Latinoamérica | Todos los derechos reservados</span>
          <span className="hidden md:inline text-zinc-200">|</span>
          <a 
            href="https://f0de022f-0d87-4da4-a0f1-1b38e34e7558.usrfiles.com/ugd/f0de02_87c824d769e544048283961448d97d2a.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-retro-orange transition-colors underline underline-offset-4"
          >
            Términos y condiciones
          </a>
        </div>
        <div className="flex gap-4 md:gap-8 flex-wrap justify-center font-bold">
          <span>China</span>
          <span className="text-zinc-200">|</span>
          <span>Argentina</span>
          <span className="text-zinc-200">|</span>
          <span>Paraguay</span>
          <span className="text-zinc-200">|</span>
          <span>España</span>
          <span className="text-zinc-200">|</span>
          <span>EEUU</span>
        </div>
      </footer>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProduct(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                <div className="flex items-center gap-3">
                  <div className="bg-retro-orange p-2 rounded-lg text-white">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold font-serif">Editar Producto</h3>
                </div>
                <button 
                  onClick={() => setEditingProduct(null)}
                  className="text-zinc-400 hover:text-black-nero transition-colors font-bold text-xl p-2"
                >
                  &times;
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="label-tech block mb-2 font-black">Nombre Comercial *</label>
                      <input
                        type="text"
                        value={editingProduct.pName}
                        onChange={(e) => setEditingProduct({ ...editingProduct, pName: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label-tech block mb-2 font-black">Nombre en Inglés</label>
                      <input
                        type="text"
                        value={editingProduct.pEnglish}
                        onChange={(e) => setEditingProduct({ ...editingProduct, pEnglish: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="label-tech block mb-2 font-black">Cantidad</label>
                        <input
                          type="text"
                          value={editingProduct.pQty}
                          onChange={(e) => setEditingProduct({ ...editingProduct, pQty: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label-tech block mb-2 font-black">Precio (IVA inc.)</label>
                        <input
                          type="text"
                          value={editingProduct.pPrice}
                          onChange={(e) => setEditingProduct({ ...editingProduct, pPrice: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label-tech block mb-2 font-black">Moneda</label>
                        <input
                          type="text"
                          value={editingProduct.pCurrency || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, pCurrency: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label-tech block mb-2 font-black">Marcas de Referencia</label>
                      <input
                        type="text"
                        value={editingProduct.pBrands}
                        onChange={(e) => setEditingProduct({ ...editingProduct, pBrands: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="label-tech block mb-2 font-black">Especificación Técnica</label>
                      <textarea
                        value={editingProduct.pSpecs}
                        onChange={(e) => setEditingProduct({ ...editingProduct, pSpecs: e.target.value })}
                        rows={4}
                        className="input-field h-28 resize-none"
                      />
                    </div>
                    <div>
                      <label className="label-tech block mb-2 font-black">Puntos clave / Certificaciones</label>
                      <input
                        type="text"
                        value={editingProduct.pKeys}
                        onChange={(e) => setEditingProduct({ ...editingProduct, pKeys: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label-tech block mb-2 font-black">URL de Referencia</label>
                      <input
                        type="url"
                        value={editingProduct.pLink}
                        onChange={(e) => setEditingProduct({ ...editingProduct, pLink: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
                {/* Full-width fields in modal */}
                <div className="mt-6 space-y-5">
                  <div>
                    <label className="label-tech block mb-2 font-black">Información Relevante Adicional</label>
                    <textarea
                      value={editingProduct.pAdditionalInfo || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, pAdditionalInfo: e.target.value })}
                      rows={3}
                      placeholder="Normas específicas, requisitos especiales..."
                      className="input-field h-20 resize-none"
                    />
                  </div>
                  <div>
                    <label className="label-tech block mb-2 font-black">Imágenes de Referencia (máx. 5)</label>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {(editingProduct.pImages || []).map((img, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-200 group">
                          <img src={img} alt={`Ref ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(idx, 'edit')}
                            className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {(editingProduct.pImages || []).length < 5 && (
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="flex items-center gap-2 text-xs text-storm-dust border border-dashed border-zinc-300 rounded-lg px-4 py-3 hover:border-retro-orange hover:text-retro-orange transition-colors"
                      >
                        <ImagePlus className="w-4 h-4" /> Agregar imágenes
                      </button>
                    )}
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'edit')}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="px-6 py-3 rounded font-bold uppercase tracking-widest text-xs border border-zinc-200 hover:bg-zinc-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={updateProduct}
                  className="px-8 py-3 bg-retro-orange text-white rounded font-bold uppercase tracking-widest text-xs hover:bg-retro-orange/90 transition-colors shadow-lg"
                >
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
