/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, CheckCircle, ShieldAlert, Sparkles, Loader2, ArrowRight, ExternalLink, RefreshCw } from "lucide-react";
import { Crop, WalletState, SolanaTransaction } from "../types";

interface CheckoutGatewayProps {
  crop: Crop | null;
  wallet: WalletState;
  onClose: () => void;
  onPaymentSuccess: (transaction: SolanaTransaction) => void;
}

export default function CheckoutGateway({ crop, wallet, onClose, onPaymentSuccess }: CheckoutGatewayProps) {
  const [tokenUsed, setTokenUsed] = useState<"SOL" | "USDC" | "USDT">("SOL");
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<"idle" | "init" | "sign" | "broadcast" | "confirming" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [statusText, setStatusText] = useState("");
  const [txSignature, setTxSignature] = useState("");

  if (!crop) return null;

  // Obtener el precio unitario según el token seleccionado
  const getUnitPrice = () => {
    switch (tokenUsed) {
      case "SOL":
        return crop.priceSol;
      case "USDC":
        return crop.priceUsdc;
      case "USDT":
        return crop.priceUsdt;
    }
  };

  const unitPrice = getUnitPrice();
  const rawTotal = unitPrice * quantity;
  const discountApplied = wallet.hasVibePassNft;
  const finalTotal = discountApplied ? +(rawTotal * 0.85).toFixed(4) : +rawTotal.toFixed(4);

  // Verificar si la wallet tiene saldo suficiente
  const hasSufficientFunds = () => {
    if (!wallet.connected) return false;
    switch (tokenUsed) {
      case "SOL":
        return wallet.balanceSol >= finalTotal;
      case "USDC":
        return wallet.balanceUsdc >= finalTotal;
      case "USDT":
        return wallet.balanceUsdt >= finalTotal;
    }
  };

  // Mensaje de estado por cada step de la blockchain de Solana
  useEffect(() => {
    switch (step) {
      case "init":
        setStatusText("Inicializando canales de pago SPL en Solana Devnet...");
        break;
      case "sign":
        setStatusText("Esperando aprobación de firma digital en tu wallet...");
        break;
      case "broadcast":
        setStatusText("Enviando Payload firmado a los validadores del cluster de Solana...");
        break;
      case "confirming":
        setStatusText("Confirmando bloque en la red. Velocidad de Solana: ~400ms por bloque...");
        break;
      default:
        setStatusText("");
    }
  }, [step]);

  const handleStartPayment = () => {
    if (!wallet.connected) {
      setStep("error");
      setErrorMessage("Debes conectar tu wallet simulada primero para tramitar la transacción.");
      return;
    }

    if (quantity > crop.stock) {
      setStep("error");
      setErrorMessage(`No hay stock suficiente. Solo quedan ${crop.stock} unidades de este cultivo.`);
      return;
    }

    if (!hasSufficientFunds()) {
      setStep("error");
      setErrorMessage(
        `Saldo insuficiente. Necesitas ${finalTotal} ${tokenUsed} pero tu billetera tiene ${
          tokenUsed === "SOL"
            ? wallet.balanceSol
            : tokenUsed === "USDC"
            ? wallet.balanceUsdc
            : wallet.balanceUsdt
        } ${tokenUsed}. ¡Recarga saldo usando el Faucet de tu Wallet Hub!`
      );
      return;
    }

    // Comenzar el pipeline realista de confirmación de Solana
    setStep("init");

    setTimeout(() => {
      // Step 2: firma de cartera
      setStep("sign");

      setTimeout(() => {
        // Step 3: Transmisión
        setStep("broadcast");

        setTimeout(() => {
          // Step 4: Confirmación
          setStep("confirming");

          setTimeout(() => {
            // Éxito
            const signature =
              "3zP" +
              Math.random().toString(36).substring(2, 12).toUpperCase() +
              "x7F" +
              Math.random().toString(36).substring(2, 10).toUpperCase() +
              "gH2W";
            setTxSignature(signature);

            const transaction: SolanaTransaction = {
              id: "tx-" + Math.random().toString(36).substring(2, 9),
              signature,
              timestamp: new Date().toISOString(),
              buyerAddress: wallet.publicKey,
              sellerAddress: "HuertoCommunitySeller444444444444444444",
              cropId: crop.id,
              cropName: crop.name,
              quantity,
              tokenUsed,
              totalAmountPaid: finalTotal,
              discountApplied,
              status: "success",
            };

            setStep("success");
            onPaymentSuccess(transaction);
          }, 1200); // Solana confirma brutalmente rápido (1.2 segundos realistas!)
        }, 800);
      }, 1000);
    }, 900);
  };

  return (
    <div id="checkout-gateway-overlay" className="fixed inset-0 bg-emerald-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div id="checkout-gateway-modal" className="bg-white border-4 border-emerald-500 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl relative text-emerald-950 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Encabezado del modal */}
        <div className="flex justify-between items-center px-6 py-4.5 border-b-4 border-emerald-500 bg-emerald-50 text-emerald-950">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="font-sans font-black text-base text-emerald-900 flex items-center gap-2 uppercase tracking-tight">
              Solana Pay Checkout
              <span className="text-[10px] tracking-widest bg-yellow-400 text-emerald-950 px-2.5 py-1 rounded-full font-sans font-black">
                DEVNET
              </span>
            </h3>
          </div>
          <button
            id="close-checkout-btn"
            onClick={onClose}
            className="text-emerald-850 hover:text-white bg-emerald-250/50 hover:bg-emerald-500 p-1.5 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5 font-black" />
          </button>
        </div>

        {/* Pipeline de Estados */}
        {step !== "idle" && step !== "success" && step !== "error" ? (
          <div id="checkout-progress-view" className="p-8 text-center space-y-6 flex flex-col items-center bg-white text-emerald-950">
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin flex items-center justify-center" />
              <div className="absolute w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center font-mono font-black text-xs text-emerald-900 border border-emerald-200">
                {step === "init" && "1/4"}
                {step === "sign" && "2/4"}
                {step === "broadcast" && "3/4"}
                {step === "confirming" && "4/4"}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-md font-black font-sans uppercase tracking-tight text-emerald-900">
                {step === "init" && "Verificando Cluster Solana"}
                {step === "sign" && "Solicitando Firma de Wallet"}
                {step === "broadcast" && "Difundiendo Transacción"}
                {step === "confirming" && "Confirmando en Blockchain"}
              </h4>
              <p className="text-xs text-emerald-600 font-bold px-4 min-h-12 leading-relaxed">
                {statusText}
              </p>
            </div>

            {/* Stepper Visual */}
            <div className="flex items-center gap-2 w-full max-w-xs justify-center pt-2">
              <div className={`w-3.5 h-3.5 rounded-full ${step !== "init" ? "bg-emerald-500" : "bg-emerald-450 animate-ping"}`} />
              <div className="h-0.5 w-8 bg-emerald-100" />
              <div className={`w-3.5 h-3.5 rounded-full ${step === "broadcast" || step === "confirming" ? "bg-emerald-500" : "bg-emerald-100"}`} />
              <div className="h-0.5 w-8 bg-emerald-100" />
              <div className={`w-3.5 h-3.5 rounded-full ${step === "confirming" ? "bg-emerald-500" : "bg-emerald-100"}`} />
            </div>
          </div>
        ) : step === "success" ? (
          /* Transacción Exitosa */
          <div id="checkout-success-view" className="p-8 text-center space-y-6 flex flex-col items-center bg-white text-emerald-950">
            <div className="w-16 h-16 rounded-3xl bg-yellow-405 text-emerald-905 border-2 border-emerald-950 flex items-center justify-center bg-yellow-400 text-emerald-950 shadow-[3px_3px_0px_0px_rgba(6,78,59,1)]">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-black font-sans uppercase text-emerald-900 tracking-tight">
                ¡Compra Confirmada!
              </h4>
              <p className="text-xs text-emerald-705 leading-relaxed px-4 font-semibold text-emerald-700">
                La transacción se liquidó instantáneamente en la red Solana Devnet. Tu stock local ya se ha actualizado.
              </p>
            </div>

            {/* Ficha de recibo de Solana Pay */}
            <div className="w-full bg-emerald-50 p-4.5 rounded-2xl border-2 border-emerald-100 text-left text-xs font-mono space-y-2">
              <div className="flex justify-between border-b border-emerald-100/50 pb-1.5 text-emerald-700">
                <span>CONTRATO:</span>
                <span className="text-emerald-950 font-sans font-black">Solana SPL-Pay</span>
              </div>
              <div className="flex justify-between border-b border-emerald-100/50 pb-1.5 text-emerald-700">
                <span>PRODUCTO:</span>
                <span className="text-emerald-950 font-sans font-black">{crop.name} (x{quantity})</span>
              </div>
              <div className="flex justify-between border-b border-emerald-100/50 pb-1.5 text-emerald-700">
                <span>TOTAL DEBITADO:</span>
                <span className="text-emerald-600 font-black">
                  {finalTotal} {tokenUsed}
                </span>
              </div>
              <div className="pt-1 text-[10px] space-y-1">
                <span className="block text-emerald-500 font-bold font-sans">TRANSACTION SIGNATURE:</span>
                <span className="block text-emerald-800 break-all select-all font-semibold leading-relaxed bg-white p-2 rounded-xl border border-emerald-200">
                  {txSignature}
                </span>
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <a
                id="solana-explorer-link"
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center justify-center text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-3 rounded-xl border-2 border-emerald-200 font-bold tracking-tight shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                Ver Explorer
                <ExternalLink className="w-3.5" />
              </a>
              <button
                id="finish-checkout-btn"
                onClick={onClose}
                className="flex-1 text-xs text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-3 rounded-xl font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(6,78,59,1)] hover:scale-102 transition-all cursor-pointer"
              >
                Volver al Huerto
              </button>
            </div>
          </div>
        ) : step === "error" ? (
          /* Errores de Validación o Fondos */
          <div id="checkout-error-view" className="p-8 text-center space-y-5 flex flex-col items-center bg-white text-emerald-950">
            <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 border-2 border-red-500/20 flex items-center justify-center">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h4 className="text-md font-black font-sans uppercase tracking-tight text-red-600">
                Fallo de Transacción Cripto
              </h4>
              <p className="text-xs text-emerald-700 font-semibold leading-relaxed px-2">
                {errorMessage}
              </p>
            </div>

            <div className="flex gap-3 w-full">
              <button
                id="retry-checkout-btn"
                onClick={() => setStep("idle")}
                className="flex-1 text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-3 rounded-xl border-2 border-emerald-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 font-bold tracking-tight shadow-xs"
              >
                <RefreshCw className="w-4" />
                Regresar y Corregir
              </button>
              <button
                id="dismiss-checkout-error-btn"
                onClick={onClose}
                className="flex-1 text-xs text-white bg-red-500 hover:bg-red-600 px-4 py-3 rounded-xl font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#991b1b] transition-all cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        ) : (
          /* Vista Principal de Configulación de Pago */
          <div id="checkout-main-view" className="p-6 space-y-6 bg-white text-emerald-950">
            
            {/* Resumen del cultivo de la comunidad */}
            <div className="flex gap-4 items-center bg-emerald-50 p-4 rounded-3xl border-2 border-emerald-100">
              {crop.imageUrl && (
                <img
                  src={crop.imageUrl}
                  alt={crop.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 border-2 border-emerald-200"
                />
              )}
              <div className="space-y-1 min-w-0">
                <span className="text-[9px] text-emerald-600 font-sans font-black tracking-widest block uppercase">
                  CULTIVO DE LA COMUNIDAD
                </span>
                <h4 className="font-extrabold text-sm text-emerald-900 truncate pr-2 leading-none">{crop.name}</h4>
                <p className="text-xs text-emerald-700 font-bold">
                  Stock Disponible: <b className="text-emerald-900">{crop.stock} raciones</b>
                </p>
              </div>
            </div>

            {/* Control de Cantidad */}
            <div className="flex items-center justify-between bg-emerald-50/40 p-3 rounded-2xl border border-emerald-100">
              <span className="text-xs font-black uppercase text-emerald-800">Cantidad a Comprar:</span>
              <div className="flex items-center gap-3">
                <button
                  id="decrease-quantity-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center text-emerald-800 text-sm font-black cursor-pointer shadow-xs active:scale-95 transition-transform"
                >
                  -
                </button>
                <span className="font-sans font-black text-emerald-950 text-md w-6 text-center">{quantity}</span>
                <button
                  id="increase-quantity-btn"
                  onClick={() => setQuantity(Math.min(crop.stock, quantity + 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center text-emerald-800 text-sm font-black cursor-pointer shadow-xs active:scale-95 transition-transform"
                >
                  +
                </button>
              </div>
            </div>

            {/* Token Selector */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-emerald-800 block">Seleccione el Token de Pago:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "SOL" as const, name: "Solana", color: "border-purple-500 text-purple-950 bg-purple-50 hover:bg-purple-100/50", rate: "1 SOL ~ $180" },
                  { id: "USDC" as const, name: "USDC SPL", color: "border-emerald-500 text-emerald-950 bg-emerald-50 hover:bg-emerald-100/50", rate: "1 USDC = $1.00" },
                  { id: "USDT" as const, name: "Tether SPL", color: "border-teal-500 text-teal-950 bg-teal-50 hover:bg-teal-100/50", rate: "1 USDT = $1.00" },
                ].map((token) => (
                  <button
                    key={token.id}
                    id={`token-${token.id.toLowerCase()}-btn`}
                    onClick={() => {
                      setTokenUsed(token.id);
                    }}
                    className={`p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                      tokenUsed === token.id
                        ? `${token.color} scale-102 shadow-[2px_2px_0px_0px_rgba(6,78,59,1)]`
                        : "border-emerald-100 bg-emerald-50/20 text-emerald-600 hover:text-emerald-900 hover:border-emerald-300"
                    }`}
                  >
                    <span className="block text-xs font-black">{token.id}</span>
                    <span className="block text-[10px] text-emerald-700 font-bold leading-tight mt-0.5">{token.name}</span>
                    <span className="block text-[9px] text-emerald-500 font-black tracking-tighter mt-1">{token.rate}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Visualización del desglose de costos */}
            <div className="bg-emerald-50/40 p-4 rounded-3xl border-2 border-emerald-100 space-y-2">
              <div className="flex justify-between items-center text-xs text-emerald-850 font-semibold">
                <span>Precio Unitario:</span>
                <span className="font-mono font-bold">
                  {unitPrice} {tokenUsed}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-xs text-emerald-850 font-semibold pb-2 border-b border-emerald-100">
                <span>Subtotal ({quantity} raciones):</span>
                <span className="font-mono font-bold">
                  {+(unitPrice * quantity).toFixed(4)} {tokenUsed}
                </span>
              </div>

              {discountApplied ? (
                <div className="flex justify-between items-center text-xs text-emerald-700 py-1 font-black animate-pulse bg-emerald-100/30 px-3 rounded-xl border border-emerald-100">
                  <span className="flex items-center gap-1.5 uppercase font-black text-[10px]">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-yellow-500" />
                    Descuento Pase NFT (-15%):
                  </span>
                  <span className="font-mono text-emerald-700 font-black">
                    -{+(rawTotal * 0.15).toFixed(4)} {tokenUsed}
                  </span>
                </div>
              ) : (
                <div className="text-[10px] text-emerald-500 leading-relaxed py-1 italic font-semibold">
                  * Tip: Reclama el pase NFT en el "Solana Wallet Hub" para aplicar descuentos en tu compra.
                </div>
              )}

              <div className="flex justify-between items-center text-sm pt-2 border-t-2 border-emerald-100">
                <span className="font-black uppercase text-emerald-800 text-xs text-slate-800">Total Neto a Pagar:</span>
                <span className="font-mono font-black text-emerald-600 text-base">
                  {finalTotal} {tokenUsed}
                </span>
              </div>
            </div>

            {/* Botón Principal de Firma */}
            <button
              id="confirm-solana-transaction-btn"
              onClick={handleStartPayment}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-xs tracking-wider py-4 px-4 rounded-2xl border-2 border-emerald-750 shadow-[3px_3px_0px_0px_rgba(6,78,59,1)] hover:scale-101 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Confirmar Pago en Red Solana
              <ArrowRight className="w-4" />
            </button>

            {/* Aviso de Red Ficticia Educacional */}
            <div className="flex items-center gap-1.5 justify-center text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
              <span>Red: Solana Devnet</span>
              <span>•</span>
              <span>Transacciones instantáneas libres de costo real</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
