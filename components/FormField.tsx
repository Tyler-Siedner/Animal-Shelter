// Authors: Tyler Siedner and Tyler Harris
export default function FormField({
  name,
  label,
  type = "text",
  defaultValue = "",
  required = true,
  multiline = false,
  maxLength = 2000,
  minLength,
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  multiline?: boolean;
  maxLength?: number;
  minLength?: number;
  autoComplete?: string;
}) {
  const props = {
    id: name,
    name,
    defaultValue,
    required,
    maxLength,
    minLength,
    autoComplete,
  };
  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label}
        {!required && " (optional)"}
      </label>
      {multiline ? (
        <textarea {...props} rows={4} />
      ) : (
        <input {...props} type={type} />
      )}
    </div>
  );
}
