// Links for sharing a certificate. Pure functions, safe in the browser.
type Shareable = { code: string; completedOn: string };

/** LinkedIn's "Add licence or certification" form, filled in. */
export function linkedInAddUrl(certificate: Shareable, title: string, verifyUrl: string) {
  const issued = new Date(certificate.completedOn);
  const query = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: title,
    organizationName: "Buggle Learn",
    issueYear: String(issued.getUTCFullYear()),
    issueMonth: String(issued.getUTCMonth() + 1),
    certUrl: verifyUrl,
    certId: certificate.code,
  });
  return `https://www.linkedin.com/profile/add?${query}`;
}

export const linkedInShareUrl = (verifyUrl: string) =>
  `https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({ url: verifyUrl })}`;
