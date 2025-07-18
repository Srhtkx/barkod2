"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

export default function QrCodeReader() {
  const [result, setResult] = useState<string | null>(null);
  const qrRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const startScanner = async () => {
      qrRef.current = new Html5Qrcode("reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });

      try {
        await qrRef.current.start(
          { facingMode: "environment" }, // Arka kamera için
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText) => {
            setResult(decodedText);
            stopScanner();
          },
          (errorMessage) => {
            // Sessizce geç
          }
        );
      } catch (err) {
        console.error("Kamera başlatma hatası:", err);
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = () => {
    qrRef.current
      ?.stop()
      .then(() => {
        qrRef.current?.clear();
      })
      .catch((err) => {
        console.error("QR durdurulamadı:", err);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-xl font-bold mb-4">📷 QR Kod Okuyucu</h1>

      <div
        id="reader"
        className="w-[90vw] max-w-[320px] aspect-square bg-white rounded shadow-md overflow-hidden"
      ></div>

      {result && (
        <div className="mt-4 text-green-700 font-semibold text-center break-words max-w-xs">
          ✅ Sonuç: {result}
        </div>
      )}

      <button
        onClick={stopScanner}
        className="mt-6 px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Durdur
      </button>
    </div>
  );
}
