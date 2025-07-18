"use client";

import { useEffect, useRef, useState } from "react";
import {
  Html5Qrcode,
  Html5QrcodeScanner,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";

export default function QrCodeReader() {
  const [result, setResult] = useState<string | null>(null);
  const qrRef = useRef<Html5Qrcode | null>(null);
  const scannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const initScanner = async () => {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        const cameraId = devices[0].id;

        qrRef.current = new Html5Qrcode("qr-reader", {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });

        qrRef.current
          .start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              setResult(decodedText);
              stopScanner();
            },
            (errorMessage) => {
              console.warn("Tarama hatası:", errorMessage);
            }
          )
          .catch((err) => {
            console.error("Başlatma hatası:", err);
          });
      }
    };

    initScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = () => {
    if (qrRef.current) {
      qrRef.current
        .stop()
        .then(() => {
          qrRef.current?.clear();
          console.log("QR tarayıcı durduruldu.");
        })
        .catch((err) => {
          console.error("Durdurma hatası:", err);
        });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">📷 QR Kod Okuyucu</h1>
      <div
        id="qr-reader"
        className="w-[300px] h-[300px] border"
        ref={scannerRef}
      ></div>
      {result && (
        <div className="mt-4 text-green-600 font-semibold">
          ✅ Sonuç: {result}
        </div>
      )}
      <button
        onClick={stopScanner}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Durdur
      </button>
    </div>
  );
}
