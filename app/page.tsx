"use client";

import { useState } from "react";
import { StockProvider } from "@/context/stock-context";
import BarcodeScanner from "@/components/barkode-scanner";
import AddItemDialog from "@/components/add-item-dialog";
import StockList from "@/components/stock-list";
import { Button } from "@/components/ui/button";
import { Plus, Scan } from "lucide-react";

export default function Home() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | undefined>(
    undefined
  );

  const handleScanResult = (result: string) => {
    setScannedBarcode(result);
    setIsScannerOpen(false); // Close scanner after scan
    setIsAddItemDialogOpen(true); // Open add item dialog with scanned barcode
  };

  const handleAddItemDialogClose = (open: boolean) => {
    setIsAddItemDialogOpen(open);
    if (!open) {
      setScannedBarcode(undefined); // Clear scanned barcode when dialog closes
    }
  };

  return (
    <StockProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
            Deri Stok Yönetimi
          </h1>
          <div className="flex gap-2">
            <Button onClick={() => setIsScannerOpen(true)}>
              <Scan className="mr-2 h-4 w-4" /> Barkod Tara
            </Button>
            <Button onClick={() => setIsAddItemDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Manuel Ekle
            </Button>
          </div>
        </header>

        <main className="grid gap-8">
          {isScannerOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
              <BarcodeScanner
                onScan={handleScanResult}
                onClose={() => setIsScannerOpen(false)}
              />
            </div>
          )}

          <AddItemDialog
            open={isAddItemDialogOpen}
            onOpenChange={handleAddItemDialogClose}
            initialBarcode={scannedBarcode}
          />

          <StockList />
        </main>
      </div>
    </StockProvider>
  );
}
