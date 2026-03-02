export const asnTemplateValue = (template, asn) =>
  String(template)
    .split('{asn}')
    .join(String(asn))
    .replace(/\r?\n/g, ' ');
