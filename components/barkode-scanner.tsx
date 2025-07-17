/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Html5QrcodeSupportedFormats, Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Camera, Scan, XCircle, Zap, ZapOff } from "lucide-react"; // Zap ve ZapOff eklendi
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

type Html5QrcodeCameraDevice = {
  id: string;
  label: string;
};

export default function BarcodeScanner({
  onScan,
  onClose,
}: BarcodeScannerProps) {
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<Html5QrcodeCameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false); // Flaş durumu için state

  const qrCodeRegionId = "qr-code-full-region"; // Tarayıcının render edileceği div ID'si

  const stopScanning = useCallback(async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        console.log("QR Code scanning stopped.");
        setIsScanning(false);
        setError(null);
        setIsTorchOn(false); // Tarayıcı durunca flaşı kapat
      } catch (err) {
        console.error("Unable to stop scanning.", err);
        setError("Tarayıcı durdurulurken hata oluştu.");
      }
    }
  }, []);

  const toggleTorch = useCallback(async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        const newTorchState = !isTorchOn;
        // 'torch' özelliğini içeren objeyi 'any' olarak tip dönüştürüyoruz
        await html5QrCodeRef.current.applyVideoConstraints({
          advanced: [{ torch: newTorchState }] as any,
        });
        setIsTorchOn(newTorchState);
      } catch (err) {
        console.error("Failed to toggle torch:", err);
        setError("Flaş açılıp kapatılamadı.");
      }
    }
  }, [isTorchOn]);

  const startScanning = useCallback(
    async (deviceId: string | null) => {
      setError(null);
      setIsScanning(true);
      console.log("Attempting to start scanning with deviceId:", deviceId);

      const config = {
        fps: 10, // Saniyedeki kare sayısı
        qrbox: { width: 250, height: 250 }, // Tarama kutusu boyutu
        disableFlip: false, // Ters çevrilmiş barkodları okuma
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
          Html5QrcodeSupportedFormats.AZTEC,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.MAXICODE,
          Html5QrcodeSupportedFormats.PDF_417,
          Html5QrcodeSupportedFormats.RSS_14,
          Html5QrcodeSupportedFormats.RSS_EXPANDED,
        ],
        videoConstraints: {
          facingMode: "environment", // Arka kamerayı tercih et
          width: { ideal: 1280 }, // Daha yüksek ideal genişlik
          height: { ideal: 720 }, // Daha yüksek ideal yükseklik
          aspectRatio: 1.7777777778, // 16:9 en boy oranı (yaygın telefon kameraları için)
        },
      };

      const onScanSuccess = (decodedText: string, decodedResult: any) => {
        console.log(`Code matched = ${decodedText}`, decodedResult);
        onScan(decodedText);
        stopScanning(); // Başarılı taramadan sonra taramayı durdur
      };

      const onScanError = (errorMessage: string) => {
        // Hata mesajlarını konsola yazdır, kullanıcıya gösterme
        // console.warn(`QR Code scanning error = ${errorMessage}`);
        // setError(errorMessage); // Çok fazla hata mesajı gösterebilir, dikkatli kullanın
      };

      // Önceki tarayıcıyı durdur
      await stopScanning();

      // Html5Qrcode instance'ını oluştur veya mevcutsa kullan
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);
      }

      try {
        await html5QrCodeRef.current.start(
          deviceId || { facingMode: "environment" },
          config,
          onScanSuccess,
          onScanError
        );
        setIsScanning(true);
      } catch (err: any) {
        console.error("Kamera başlatılamadı:", err);
        if (err.name === "NotAllowedError") {
          setError(
            "Kamera erişimi reddedildi. Lütfen tarayıcı ayarlarınızdan kamera izinlerini verin."
          );
        } else if (err.name === "NotFoundError") {
          setError(
            "Kamera bulunamadı. Lütfen bir kamera bağlı olduğundan emin olun."
          );
        } else {
          setError(
            `Kamera başlatılamadı: ${err.message}. Lütfen tarayıcı ayarlarınızı kontrol edin.`
          );
        }
        setIsScanning(false);
      }
    },
    [onScan, stopScanning]
  );

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((videoInputDevices) => {
        if (videoInputDevices && videoInputDevices.length > 0) {
          setDevices(videoInputDevices);
          setSelectedDeviceId(videoInputDevices[0].id || null);
        } else {
          setError("Kamera cihazı bulunamadı.");
        }
      })
      .catch((err) => {
        console.error("Kamera cihazları listelenirken hata:", err);
        setError(
          "Kamera cihazları listelenirken hata oluştu. Lütfen izinleri kontrol edin."
        );
      });

    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  useEffect(() => {
    if (selectedDeviceId) {
      startScanning(selectedDeviceId);
    }
  }, [selectedDeviceId, startScanning]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-6 w-6" /> Barkod Tarayıcı
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Hata!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="relative w-full h-64 bg-gray-200 rounded-md overflow-hidden">
          <div id={qrCodeRegionId} className="w-full h-full object-cover"></div>
          {isScanning && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                border: "2px dashed rgba(255, 255, 255, 0.7)",
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                borderRadius: "8px",
                width: "70%",
                height: "70%",
                maxWidth: "250px",
                maxHeight: "250px",
                margin: "auto",
              }}
            ></div>
          )}
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
              <Camera className="h-12 w-12" />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {!isScanning ? (
            <Button
              onClick={() => startScanning(selectedDeviceId)}
              className="flex-1"
              disabled={!selectedDeviceId}
            >
              <Scan className="mr-2 h-4 w-4" /> Taramayı Başlat
            </Button>
          ) : (
            <>
              <Button
                onClick={stopScanning}
                variant="outline"
                className="flex-1 bg-transparent"
              >
                <XCircle className="mr-2 h-4 w-4" /> Taramayı Durdur
              </Button>
              {/* Flaş butonu, sadece tarama yapılıyorsa ve cihaz flaş destekliyorsa göster */}
              {html5QrCodeRef.current && html5QrCodeRef.current.isScanning && (
                <Button
                  onClick={toggleTorch}
                  variant="outline"
                  className="bg-transparent"
                >
                  {isTorchOn ? (
                    <ZapOff className="h-4 w-4" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {isTorchOn ? "Flaş Kapat" : "Flaş Aç"}
                  </span>
                </Button>
              )}
            </>
          )}
          <Button onClick={onClose} variant="secondary">
            Kapat
          </Button>
        </div>
        {devices.length > 1 && (
          <div className="mt-4">
            <label
              htmlFor="camera-select"
              className="block text-sm font-medium text-gray-700"
            >
              Kamera Seç:
            </label>
            <select
              id="camera-select"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedDeviceId || ""}
              onChange={(e) => {
                setSelectedDeviceId(e.target.value || null);
              }}
            >
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.label || `Kamera ${device.id}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
