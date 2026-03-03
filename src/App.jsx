import { useEffect, useRef, useState } from "react";
import { generateLabelPDF, generateLabelPdfBlob } from "./pdfGenerator";
import "./App.css";
import PreviewPane from "./components/PreviewPane";
import GridLayoutSection from "./components/GridLayoutSection";
import LabelContentSection from "./components/LabelContentSection";
import QRCodeSettings from "./components/QRCodeSettings";
import OutputOptions from "./components/OutputOptions";
import ActionButtons from "./components/ActionButtons";
import InfoPanel from "./components/InfoPanel";
import useConfigState from "./hooks/useConfigState";
import { toPdfConfig } from "./utils/configConverter";

function App() {
  const { config, isQtyManual, handleChange, loadDefaults } = useConfigState();
  const [generating, setGenerating] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const previewUrlRef = useRef("");

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await generateLabelPDF(toPdfConfig(config));
    } catch (error) {
      alert("Error generating PDF: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    let canceled = false;
    const timeoutId = setTimeout(async () => {
      try {
        setPreviewLoading(true);
        setPreviewError("");

        const blob = await generateLabelPdfBlob(toPdfConfig(config), {
          preview: true,
        });

        if (canceled) return;

        const nextUrl = URL.createObjectURL(blob);
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
        }
        previewUrlRef.current = nextUrl;
        setPreviewUrl(nextUrl);
      } catch (error) {
        if (!canceled) {
          setPreviewError(error.message || "Failed to generate preview");
        }
      } finally {
        if (!canceled) {
          setPreviewLoading(false);
        }
      }
    }, 350);

    return () => {
      canceled = true;
      clearTimeout(timeoutId);
    };
  }, [config]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>ASN Label Generator</h1>
        <p>Generate printable A4 PDF sheets with QR code labels</p>
      </header>
      <div className="container">
        <div className="form-grid">
          <GridLayoutSection config={config} onChange={handleChange} />
          <QRCodeSettings config={config} onChange={handleChange} />
          <LabelContentSection config={config} onChange={handleChange} isQtyManual={isQtyManual} />
          <OutputOptions config={config} onChange={handleChange} />
        </div>

        <PreviewPane
          previewUrl={previewUrl}
          previewLoading={previewLoading}
          previewError={previewError}
        />

        <ActionButtons
          generating={generating}
          onGenerate={handleGenerate}
          onReset={loadDefaults}
        />

        <InfoPanel rows={config.rows} cols={config.cols} qty={config.qty} />
      </div>
    </div>
  );
}

export default App;
