import { useState } from "react";

const createDefaultConfig = () => ({
  marginLeft: 13.5,
  marginRight: 13.5,
  marginTop: 9,
  marginBottom: 9,
  rows: 27,
  cols: 7,
  hSpacing: 0,
  vSpacing: 2.5,
  startAsn: 1,
  qty: 27 * 7,
  qrSizeMm: 8,
  qrError: "M",
  textTemplate: "ASN{asn}",
  fontSize: 6,
  showGrid: false,
  filename: "asn_labels.pdf",
  textPosition: "right",
  labelRotated: false,
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
