/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Crop } from "./types";

export const PRESET_CROPS: Crop[] = [
  {
    id: "preset-1",
    name: "Albahaca Genovesa",
    scientificName: "Ocimum basilicum",
    origin: "Originaria de las regiones tropicales de África central y el sudeste asiático.",
    description: "Planta herbácea anual de hojas de color verde brillante, muy aromáticas, de bordes dentados y flores blancas.",
    uses: "Excelente condimento culinario en la cocina mediterránea (Pesto). Posee propiedades digestivas, carminativas y ahuyenta moscas e insectos en el huerto.",
    careLevel: "Fácil",
    sunlight: "Sol directo moderado (4-6 horas diarias)",
    waterRequirements: "Riego regular constante sin encharcar (humedad media)",
    harvestTime: "60 días desde la siembra",
    recommendedPriceSol: 0.02,
    recommendedPriceUsdc: 2.0,
    recommendedPriceUsdt: 2.0,
    priceSol: 0.018, // Con un pequeño descuento del huertano
    priceUsdc: 1.8,
    priceUsdt: 1.8,
    stock: 12,
    scannedAt: "2026-05-29T10:00:00Z",
    isForSale: true,
    imageUrl: "https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?auto=format&fit=crop&q=80&w=400",
    notes: "Cultivada en macetas biodegradables, lista para trasplantar."
  },
  {
    id: "preset-2",
    name: "Lechuga Romana Orgánica",
    scientificName: "Lactuca sativa var. longifolia",
    origin: "Originaria del Mediterráneo y Asia Menor, cultivada desde el antiguo Egipto.",
    description: "Variedad de lechuga de hojas alargadas, crujientes, con un nervio central robusto y color verde brillante.",
    uses: "Utilizada principalmente en ensaladas frescas, como la ensalada César, por su textura crujiente y resistencia al aderezo.",
    careLevel: "Fácil",
    sunlight: "Sombra parcial o sol directo suave (4-5 horas diarias)",
    waterRequirements: "Riego frecuente para mantener la tierra húmeda constantemente",
    harvestTime: "60-70 días desde la siembra",
    recommendedPriceSol: 0.03,
    recommendedPriceUsdc: 3.0,
    recommendedPriceUsdt: 3.0,
    priceSol: 0.025,
    priceUsdc: 2.5,
    priceUsdt: 2.5,
    stock: 15,
    scannedAt: "2026-05-29T11:30:00Z",
    isForSale: true,
    imageUrl: "https://images.unsplash.com/photo-1622484211148-71622b4055f6?auto=format&fit=crop&q=80&w=400",
    notes: "Hojas frescas cultivadas de forma 100% ecológica sin pesticidas químicos."
  }
];
