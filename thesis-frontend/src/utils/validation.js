const EMAIL_REGEX = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function trim(value) {
  return typeof value === "string" ? value.trim() : value;
}

export function isValidEmail(email) {
  const value = trim(email);
  if (!value) return "Email is required.";
  const localPart = value.split("@")[0] || "";
  if (!/^[a-zA-Z]/.test(localPart)) {
    return "Email must start with a letter before the @ sign.";
  }
  if (!EMAIL_REGEX.test(value)) return "Enter a valid email address (e.g. name@example.com).";
  return null;
}

export function isValidName(name, fieldLabel = "Name") {
  const value = trim(name);
  if (!value) return `${fieldLabel} is required.`;
  if (value.length < 2) return `${fieldLabel} must be at least 2 characters.`;
  if (/^\d+$/.test(value)) return `${fieldLabel} cannot be numbers only.`;
  if (!/[a-zA-Z\u0600-\u06FF]/.test(value)) return `${fieldLabel} must contain at least one letter.`;
  if (/\d/.test(value)) return `${fieldLabel} cannot contain numbers.`;
  return null;
}

export function isValidText(value, fieldLabel, { required = true, minLength = 2, allowNumbers = false } = {}) {
  const text = trim(value);
  if (!text) return required ? `${fieldLabel} is required.` : null;
  if (text.length < minLength) return `${fieldLabel} must be at least ${minLength} characters.`;
  if (/^\d+$/.test(text)) return `${fieldLabel} cannot be numbers only.`;
  if (!allowNumbers && /\d/.test(text)) return `${fieldLabel} cannot contain numbers.`;
  return null;
}

export function isValidPhone(phone) {
  const value = trim(phone);
  if (!value) return null;
  if (!/^[\d\s+\-().]+$/.test(value)) return "Phone contains invalid characters.";
  const digits = value.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return "Phone must be 7–15 digits.";
  return null;
}

export function isValidSelectId(value, fieldLabel) {
  if (value === "" || value === null || value === undefined) return `${fieldLabel} is required.`;
  const num = Number(value);
  if (Number.isNaN(num) || num <= 0) return `Select a valid ${fieldLabel.toLowerCase()}.`;
  return null;
}

export function isValidScore(score) {
  if (score === "" || score === null || score === undefined) return "Score is required.";
  const num = Number(score);
  if (Number.isNaN(num)) return "Score must be a number.";
  if (num < 0 || num > 100) return "Score must be between 0 and 100.";
  return null;
}

export function isValidDate(date, fieldLabel, { required = false } = {}) {
  const value = trim(date);
  if (!value) return required ? `${fieldLabel} is required.` : null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${fieldLabel} must be a valid date.`;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return `${fieldLabel} must be a valid date.`;
  return null;
}

export function isValidComments(comments) {
  const value = trim(comments);
  if (!value) return null;
  if (value.length > 1000) return "Comments must be 1000 characters or less.";
  return null;
}

export function sanitizeNameInput(value) {
  return value.replace(/\d/g, "");
}

export function sanitizePhoneInput(value) {
  return value.replace(/[^\d\s+\-().]/g, "");
}

export function sanitizeScoreInput(value) {
  if (value === "") return "";
  if (!/^\d*\.?\d*$/.test(value)) {
    return value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
  }
  const num = Number(value);
  if (!Number.isNaN(num) && num > 100) return "100";
  return value;
}

export function inputClass(hasError) {
  const base =
    "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2";
  return hasError
    ? `${base} border-red-300 focus:ring-red-500`
    : `${base} border-slate-300 focus:ring-indigo-500`;
}

function collectErrors(checks) {
  const errors = {};
  for (const [field, message] of checks) {
    if (message) errors[field] = message;
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateLoginForm(name, email) {
  const { valid, errors } = collectErrors([
    ["name", isValidName(name, "Name")],
    ["email", isValidEmail(email)],
  ]);
  return {
    valid,
    errors,
    data: { name: trim(name), email: trim(email).toLowerCase() },
  };
}

export function validateStudentForm(form) {
  const { valid, errors } = collectErrors([
    ["Full_Name", isValidName(form.Full_Name, "Full name")],
    ["Email", isValidEmail(form.Email)],
    ["Phone", isValidPhone(form.Phone)],
    ["Department_ID", isValidSelectId(form.Department_ID, "Department")],
  ]);
  return {
    valid,
    errors,
    data: {
      ...form,
      Full_Name: trim(form.Full_Name),
      Email: trim(form.Email),
      Phone: trim(form.Phone) || null,
      Department_ID: Number(form.Department_ID),
    },
  };
}

export function validateSupervisorForm(form) {
  const { valid, errors } = collectErrors([
    ["Full_Name", isValidName(form.Full_Name, "Full name")],
    ["Email", isValidEmail(form.Email)],
    ["Specialization", isValidText(form.Specialization, "Specialization", { required: false, minLength: 2 })],
    ["Department_ID", isValidSelectId(form.Department_ID, "Department")],
  ]);
  return {
    valid,
    errors,
    data: {
      ...form,
      Full_Name: trim(form.Full_Name),
      Email: trim(form.Email),
      Specialization: trim(form.Specialization) || null,
      Department_ID: Number(form.Department_ID),
    },
  };
}

export function validateDepartmentForm(form) {
  const errors = {};
  const nameError = isValidText(form.Department_Name, "Department name", {
    minLength: 2,
    allowNumbers: true,
  });
  if (nameError) errors.Department_Name = nameError;

  if (trim(form.Department_Head)) {
    const headError = isValidName(form.Department_Head, "Department head");
    if (headError) errors.Department_Head = headError;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: {
      ...form,
      Department_Name: trim(form.Department_Name),
      Department_Head: trim(form.Department_Head) || null,
    },
  };
}

export function validateThesisForm(form) {
  const submissionRequired = form.Status === "Submitted" || form.Status === "Approved";
  const { valid, errors } = collectErrors([
    ["Title", isValidText(form.Title, "Title", { minLength: 3, allowNumbers: true })],
    ["Student_ID", isValidSelectId(form.Student_ID, "Student")],
    ["Supervisor_ID", isValidSelectId(form.Supervisor_ID, "Supervisor")],
    [
      "Submission_Date",
      isValidDate(form.Submission_Date, "Submission date", { required: submissionRequired }),
    ],
  ]);
  return {
    valid,
    errors,
    data: {
      ...form,
      Title: trim(form.Title),
      Student_ID: Number(form.Student_ID),
      Supervisor_ID: Number(form.Supervisor_ID),
      Submission_Date: trim(form.Submission_Date) || null,
    },
  };
}

export function validateEvaluationForm(form) {
  const { valid, errors } = collectErrors([
    ["Thesis_ID", isValidSelectId(form.Thesis_ID, "Thesis")],
    ["Examiner_Name", isValidName(form.Examiner_Name, "Examiner name")],
    ["Score", isValidScore(form.Score)],
    ["Comments", isValidComments(form.Comments)],
    ["Evaluation_Date", isValidDate(form.Evaluation_Date, "Evaluation date", { required: true })],
  ]);
  return {
    valid,
    errors,
    data: {
      ...form,
      Thesis_ID: Number(form.Thesis_ID),
      Examiner_Name: trim(form.Examiner_Name),
      Score: Number(form.Score),
      Comments: trim(form.Comments) || null,
      Evaluation_Date: trim(form.Evaluation_Date),
    },
  };
}
