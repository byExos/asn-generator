import { useState } from "react";

const createDefaultConfig = () => ({
  marginLeft: 10,
  marginRight: 10,
  marginTop: 10,
  marginBottom: 10,
  rows: 8,
  cols: 3,
  hSpacing: 5,
  vSpacing: 5,
  startAsn: 1,
  qty: 8 * 3,
  qrSizeMm: 25,
  qrError: "M",
  textTemplate: "ASN{asn}",
  fontSize: 9,
  showGrid: false,
  filename: "asn_labels.pdf",
  textPosition: "bottom",
});

const useConfigState = () => {
  const [config, setConfig] = useState(createDefaultConfig());
  const [isQtyManual, setIsQtyManual] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setConfig((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    if (name === "textTemplate") {
      const sanitized = String(value).replace(/\r?\n/g, " ");
      setConfig((prev) => ({ ...prev, textTemplate: sanitized }));
      return;
    }

    if (name === "qty") {
      setIsQtyManual(true);
      setConfig((prev) => ({ ...prev, qty: Math.max(1, Number(value) || 1) }));
      return;
    }

    if (name === "rows" || name === "cols") {
      const numericValue = Math.max(1, Number(value) || 1);
      setConfig((prev) => {
        const next = { ...prev, [name]: numericValue };
        if (!isQtyManual) {
          next.qty = Math.max(1, next.rows * next.cols);
        }
        return next;
      });
      return;
    }

    if (name === "textPosition") {
      setConfig((prev) => ({ ...prev, textPosition: value }));
      return;
    }

    if (type === "number") {
      setConfig((prev) => ({ ...prev, [name]: Number(value) }));
      return;
    }

    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const loadDefaults = () => {
    setIsQtyManual(false);
    setConfig(createDefaultConfig());
  };

  return {
    config,
    setConfig,
    isQtyManual,
    setIsQtyManual,
    handleChange,
    loadDefaults,
  };
};

export default useConfigState;
