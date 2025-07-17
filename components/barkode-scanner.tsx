/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Camera, Scan, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

type CameraDevice = {
  deviceId: string;
  label: string;
};

export default function BarcodeScanner({
  onScan,
  onClose,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const stopScanning = useCallback(async () => {
    if (codeReaderRef.current) {
      console.log("ZXing taraması durduruldu.");
      setIsScanning(false);
      setError(null);
    }
  }, []);

  const startScanning = useCallback(
    async (deviceId: string | null) => {
      console.log("startScanning çağrıldı. Seçilen cihaz ID:", deviceId);
      setError(null);
      setIsScanning(true);
      console.log("Attempting to start scanning with deviceId:", deviceId);

      if (!videoRef.current) {
        setError("Video elementi bulunamadı.");
        setIsScanning(false);
        return;
      }

      // Önceki tarayıcıyı durdur
      await stopScanning();

      // ZXing okuyucusunu oluştur
      if (!codeReaderRef.current) {
        const hints = new Map();
        const formats = [
          BarcodeFormat.EAN_13,
          BarcodeFormat.CODE_128,
          BarcodeFormat.QR_CODE,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.ITF,
          BarcodeFormat.DATA_MATRIX,
          BarcodeFormat.AZTEC,
          BarcodeFormat.CODABAR,
          BarcodeFormat.CODE_39,
          BarcodeFormat.CODE_93,
          BarcodeFormat.MAXICODE,
          BarcodeFormat.PDF_417,
          BarcodeFormat.RSS_14,
          BarcodeFormat.RSS_EXPANDED,
        ];
        hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
        codeReaderRef.current = new BrowserMultiFormatReader(hints);
      }

      try {
        // Kamera akışını başlat ve barkodları çöz
        const videoInputDevice =
          deviceId ||
          (await BrowserMultiFormatReader.listVideoInputDevices())[0]?.deviceId;

        if (!videoInputDevice) {
          setError(
            "Kamera cihazı bulunamadı. Lütfen bir kamera bağlı olduğundan emin olun."
          );
          setIsScanning(false);
          return;
        }

        codeReaderRef.current.decodeFromVideoDevice(
          videoInputDevice,
          videoRef.current,
          (result, err) => {
            if (result) {
              console.log(`Code matched = ${result.getText()}`, result);
              onScan(result.getText());
              stopScanning(); // Başarılı taramadan sonra taramayı durdur
            }
            // Hata mesajlarını konsola yazdır, kullanıcıya gösterme
            // if (err && !(err instanceof NotFoundException)) {
            //   console.warn(`ZXing scanning error = ${err}`);
            // }
          }
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
    console.log("useEffect: Kamera cihazları listeleniyor...");
    BrowserMultiFormatReader.listVideoInputDevices()
      .then((videoInputDevices) => {
        console.log("Bulunan kamera cihazları:", videoInputDevices);
        if (videoInputDevices && videoInputDevices.length > 0) {
          const formattedDevices = videoInputDevices.map((device) => ({
            deviceId: device.deviceId,
            label: device.label || `Kamera ${device.deviceId}`,
          }));
          setDevices(formattedDevices);

          // Arka kamerayı (environment facing) bulmaya çalış
          const rearCamera = formattedDevices.find(
            (device) =>
              device.label.toLowerCase().includes("back") ||
              device.label.toLowerCase().includes("environment")
          );
          const initialDeviceId =
            rearCamera?.deviceId || formattedDevices[0].deviceId || null;
          setSelectedDeviceId(initialDeviceId);
          console.log("Seçilen cihaz ID (useEffect):", initialDeviceId);

          // Eğer bir cihaz bulunduysa, taramayı otomatik başlat
          if (initialDeviceId) {
            startScanning(initialDeviceId);
          }
        } else {
          setError(
            "Kamera cihazı bulunamadı. Lütfen bir kamera bağlı olduğundan emin olun."
          );
          console.error("Kamera cihazı bulunamadı.");
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
  }, [stopScanning, startScanning]); // startScanning bağımlılık olarak eklendi

  useEffect(() => {
    console.log("selectedDeviceId değişti:", selectedDeviceId);
    // Bu useEffect artık otomatik başlatma için kullanılmıyor,
    // sadece selectedDeviceId'ın değişimini izlemek için kalabilir.
  }, [selectedDeviceId]);

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
          {/* ZXing tarayıcıyı bu video elementi içine render edecek */}
          <video ref={videoRef} className="w-full h-full object-cover"></video>
          {/* Tarama kutusunu görselleştirmek için overlay */}
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
            <Button
              onClick={stopScanning}
              variant="outline"
              className="flex-1 bg-transparent"
            >
              <XCircle className="mr-2 h-4 w-4" /> Taramayı Durdur
            </Button>
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
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
