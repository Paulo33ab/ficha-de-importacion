/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  ClipboardList
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
    pExtra: ''
  });

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
      id: crypto.randomUUID(),
      pName: formData.pName!,
      pEnglish: formData.pEnglish || '',
      pSpecs: formData.pSpecs || '',
      pKeys: formData.pKeys || '',
      pBrands: formData.pBrands || '',
      pPrice: formData.pPrice || '',
      pQty: formData.pQty || '',
      pLink: formData.pLink || '',
      pExtra: formData.pExtra || ''
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
      pExtra: ''
    });
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
    setEditingProduct({ ...product });
  };

  const sendEmail = (toEmail: string) => {
    if (products.length === 0) {
      alert('La lista de productos está vacía.');
      return;
    }

    const client = clientName || 'Cliente No Identificado';
    const bcc = 'michelle.lincow@mingtagrouplatam.com,santiago.cirillo@mingtagrouplatam.com,administracion@mingtagrouplatam.com,paulo.buttice@mingtagrouplatam.com';
    const subject = `Nueva Ficha de Intención de Importación - ${client}`;
    
    let body = `SOLICITUD DE COTIZACIÓN DE IMPORTACIÓN\n\n`;
    body += `Cliente/Empresa: ${client}\n`;
    body += `Fecha: ${new Date().toLocaleDateString()}\n\n`;
    body += `--- DETALLE DE PRODUCTOS ---\n\n`;

    products.forEach((p, i) => {
      body += `PRODUCTO ${i + 1}:\n`;
      body += `- Nombre: ${p.pName}\n`;
      body += `- Nombre EN: ${p.pEnglish || 'N/A'}\n`;
      body += `- Especificaciones: ${p.pSpecs || 'N/A'}\n`;
      body += `- Puntos Clave: ${p.pKeys || 'N/A'}\n`;
      body += `- Marcas Ref: ${p.pBrands || 'N/A'}\n`;
      body += `- Precio Ref: ${p.pPrice || 'N/A'}\n`;
      body += `- Cantidad: ${p.pQty || 'N/A'}\n`;
      body += `- Link: ${p.pLink || 'N/A'}\n`;
      body += `- Certificaciones/Otros: ${p.pExtra || 'N/A'}\n\n`;
      body += `----------------------------\n\n`;
    });

    const mailtoUrl = `mailto:${toEmail}?bcc=${bcc}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="min-h-screen bg-light-bg text-black-nero p-6 md:p-10 flex flex-col font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end border-b-2 border-zinc-200 pb-8 mb-12">
        <div className="text-left">
          <h2 className="text-xl md:text-3xl font-serif text-black-nero tracking-tight leading-tight uppercase font-black">Ficha de Intención de Importación</h2>
        </div>
        <div className="flex items-center gap-5 mt-6 md:mt-0">
          <img 
            src="https://static.wixstatic.com/media/f0de02_bdc4442ec101402d919878e0530c3d03~mv2.png/v1/fill/w_308,h_90,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/LOGOG-PARA-LUCRECIA.png" 
            alt="Mingta Group" 
            className="h-16 object-contain active:scale-95 transition-transform cursor-pointer"
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
                <div className="grid grid-cols-2 gap-4">
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
                    <label className="label-tech block mb-2">Precio Ref (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">$</span>
                      <input
                        type="text"
                        name="pPrice"
                        value={formData.pPrice}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="input-field pl-6 border-zinc-200"
                      />
                    </div>
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
                  <label className="label-tech block mb-2">Puntos Clave / Certificaciones</label>
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
                            {p.pQty || 'Cant. no espec.'} | Ref: {p.pPrice ? `$${p.pPrice}` : '-'}
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
                  onClick={() => sendEmail('timoteo.monson@mingtagrouplatam.com')}
                  className="bg-black-nero text-white hover:bg-retro-orange py-4 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg"
                >
                  <Send className="w-4 h-4" /> Enviar por correo a Timoteo Monsón
                </button>
                <button
                  onClick={() => sendEmail('martin.almiron@mingtagrouplatam.com')}
                  className="bg-black-nero text-white hover:bg-retro-orange py-4 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg"
                >
                  <Send className="w-4 h-4" /> Enviar por correo a Martín Almirón
                </button>
              </div>
              <p className="text-[9px] text-center text-storm-dust italic">
                * Se enviará copia automática a Gerencia y Administración
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
                    <div className="grid grid-cols-2 gap-4">
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
                        <label className="label-tech block mb-2 font-black">Precio Ref (USD)</label>
                        <input
                          type="text"
                          value={editingProduct.pPrice}
                          onChange={(e) => setEditingProduct({ ...editingProduct, pPrice: e.target.value })}
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
                      <label className="label-tech block mb-2 font-black">Certificaciones</label>
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
