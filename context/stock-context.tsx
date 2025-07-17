"use client";

import type React from "react";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { v4 as uuidv4 } from "uuid"; // For unique barcode IDs

// Define types for our stock data
export type BarcodeItem = {
  id: string;
  value: string;
  addedAt: string;
};

export type Model = {
  name: string;
  imageUrl?: string;
  barcodes: BarcodeItem[];
};

export type Brand = {
  name: string;
  imageUrl?: string;
  models: { [key: string]: Model };
};

export type StockState = {
  [brandName: string]: Brand;
};

type StockContextType = {
  stock: StockState;
  addStockItem: (
    brandName: string,
    modelName: string,
    barcodeValue: string,
    brandImageUrl?: string,
    modelImageUrl?: string
  ) => void;
  deleteBarcode: (
    brandName: string,
    modelName: string,
    barcodeId: string
  ) => void;
  deleteModel: (brandName: string, modelName: string) => void;
  deleteBrand: (brandName: string) => void;
  updateBrandImage: (brandName: string, imageUrl: string) => void;
  updateModelImage: (
    brandName: string,
    modelName: string,
    imageUrl: string
  ) => void;
};

const StockContext = createContext<StockContextType | undefined>(undefined);

export function StockProvider({ children }: { children: React.ReactNode }) {
  const [stock, setStock] = useState<StockState>({});

  // Load stock from localStorage on initial mount
  useEffect(() => {
    try {
      const storedStock = localStorage.getItem("leatherStock");
      if (storedStock) {
        setStock(JSON.parse(storedStock));
      }
    } catch (error) {
      console.error("Failed to load stock from localStorage:", error);
    }
  }, []);

  // Save stock to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("leatherStock", JSON.stringify(stock));
    } catch (error) {
      console.error("Failed to save stock to localStorage:", error);
    }
  }, [stock]);

  const addStockItem = useCallback(
    (
      brandName: string,
      modelName: string,
      barcodeValue: string,
      brandImageUrl?: string,
      modelImageUrl?: string
    ) => {
      setStock((prevStock) => {
        const newStock = { ...prevStock };

        // Ensure brand exists
        if (!newStock[brandName]) {
          newStock[brandName] = {
            name: brandName,
            imageUrl: brandImageUrl,
            models: {},
          };
        } else if (brandImageUrl && !newStock[brandName].imageUrl) {
          // Update brand image if not already set
          newStock[brandName].imageUrl = brandImageUrl;
        }

        // Ensure model exists within the brand
        if (!newStock[brandName].models[modelName]) {
          newStock[brandName].models[modelName] = {
            name: modelName,
            imageUrl: modelImageUrl,
            barcodes: [],
          };
        } else if (
          modelImageUrl &&
          !newStock[brandName].models[modelName].imageUrl
        ) {
          // Update model image if not already set
          newStock[brandName].models[modelName].imageUrl = modelImageUrl;
        }

        // Add barcode if it's not a duplicate for this model
        const newBarcode: BarcodeItem = {
          id: uuidv4(),
          value: barcodeValue,
          addedAt: new Date().toISOString(),
        };
        const existingBarcodes = newStock[brandName].models[modelName].barcodes;
        if (!existingBarcodes.some((item) => item.value === barcodeValue)) {
          newStock[brandName].models[modelName].barcodes.push(newBarcode);
        }

        return newStock;
      });
    },
    []
  );

  const deleteBarcode = useCallback(
    (brandName: string, modelName: string, barcodeId: string) => {
      setStock((prevStock) => {
        const newStock = { ...prevStock };
        if (newStock[brandName]?.models[modelName]) {
          newStock[brandName].models[modelName].barcodes = newStock[
            brandName
          ].models[modelName].barcodes.filter((item) => item.id !== barcodeId);
          // If no barcodes left, consider deleting the model (optional, but good for cleanup)
          if (newStock[brandName].models[modelName].barcodes.length === 0) {
            delete newStock[brandName].models[modelName];
            // If no models left, consider deleting the brand
            if (Object.keys(newStock[brandName].models).length === 0) {
              delete newStock[brandName];
            }
          }
        }
        return newStock;
      });
    },
    []
  );

  const deleteModel = useCallback((brandName: string, modelName: string) => {
    setStock((prevStock) => {
      const newStock = { ...prevStock };
      if (newStock[brandName]?.models[modelName]) {
        delete newStock[brandName].models[modelName];
        // If no models left, delete the brand
        if (Object.keys(newStock[brandName].models).length === 0) {
          delete newStock[brandName];
        }
      }
      return newStock;
    });
  }, []);

  const deleteBrand = useCallback((brandName: string) => {
    setStock((prevStock) => {
      const newStock = { ...prevStock };
      delete newStock[brandName];
      return newStock;
    });
  }, []);

  const updateBrandImage = useCallback(
    (brandName: string, imageUrl: string) => {
      setStock((prevStock) => {
        const newStock = { ...prevStock };
        if (newStock[brandName]) {
          newStock[brandName].imageUrl = imageUrl;
        }
        return newStock;
      });
    },
    []
  );

  const updateModelImage = useCallback(
    (brandName: string, modelName: string, imageUrl: string) => {
      setStock((prevStock) => {
        const newStock = { ...prevStock };
        if (newStock[brandName]?.models[modelName]) {
          newStock[brandName].models[modelName].imageUrl = imageUrl;
        }
        return newStock;
      });
    },
    []
  );

  const value = {
    stock,
    addStockItem,
    deleteBarcode,
    deleteModel,
    deleteBrand,
    updateBrandImage,
    updateModelImage,
  };

  return (
    <StockContext.Provider value={value}>{children}</StockContext.Provider>
  );
}

export function useStock() {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error("useStock must be used within a StockProvider");
  }
  return context;
}
