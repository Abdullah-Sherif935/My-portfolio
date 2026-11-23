export interface ContactFormValues {
  name: string;
  email: string;
  organization: string;
  subject: string;
  message: string;
}

export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function sanitizeSingleLine(value: string): string {
  return value.replace(/[\r\n\t]+/g, ' ').trim();
}

export function validateContactForm(
  values: ContactFormValues
): { isValid: boolean; errors: ContactFormErrors } {
  const errors: ContactFormErrors = {};

  const name = sanitizeSingleLine(values.name);
  const email = sanitizeSingleLine(values.email);
  const organization = sanitizeSingleLine(values.organization);
  const subject = sanitizeSingleLine(values.subject);
  const message = values.message.trim();

  if (name.length < 2) {
    errors.name = 'validation.nameMin';
  } else if (name.length > 100) {
    errors.name = 'validation.nameMax';
  }

  if (!email || !EMAIL_PATTERN.test(email) || email.length > 160) {
    errors.email = 'validation.emailInvalid';
  }

  if (organization.length > 120) {
    errors.organization = 'validation.organizationMax';
  }

  if (subject.length < 3) {
    errors.subject = 'validation.subjectMin';
  } else if (subject.length > 150) {
    errors.subject = 'validation.subjectMax';
  }

  if (message.length < 15) {
    errors.message = 'validation.messageMin';
  } else if (message.length > 2000) {
    errors.message = 'validation.messageMax';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
