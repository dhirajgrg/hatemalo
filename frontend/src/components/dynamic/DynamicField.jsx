import { Input, Select } from "../ui";

const FIELD_MAP = {
  text: TextField,
  number: NumberField,
  select: SelectField,
  multiselect: MultiselectField,
  checkbox: CheckboxField,
  textarea: TextareaField,
};

export default function DynamicField({ field, value, onChange, error }) {
  const Renderer = FIELD_MAP[field.type];
  if (!Renderer) return null;
  return (
    <Renderer field={field} value={value} onChange={onChange} error={error} />
  );
}

function TextField({ field, value, onChange, error }) {
  return (
    <Input
      label={field.label}
      id={`attr-${field.name}`}
      name={field.name}
      placeholder={field.placeholder || ""}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      error={error}
    />
  );
}

function NumberField({ field, value, onChange, error }) {
  return (
    <Input
      label={field.label + (field.unit ? ` (${field.unit})` : "")}
      id={`attr-${field.name}`}
      name={field.name}
      type="number"
      placeholder={field.placeholder || ""}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      min={field.min}
      max={field.max}
    />
  );
}

function SelectField({ field, value, onChange, error }) {
  return (
    <Select
      label={field.label}
      id={`attr-${field.name}`}
      name={field.name}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      options={(field.options || []).map((opt) => ({
        value: opt,
        label: opt,
      }))}
      error={error}
    />
  );
}

function MultiselectField({ field, value, onChange, error }) {
  const selected = Array.isArray(value) ? value : [];

  const toggle = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((v) => v !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1">
        {field.label}
      </label>
      <div className="flex flex-wrap gap-2">
        {(field.options || []).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              selected.includes(opt)
                ? "bg-primary-500 text-white border-primary-500"
                : "bg-surface border-border text-text-primary hover:border-primary-400"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function CheckboxField({ field, value, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500"
      />
      <span className="text-sm text-text-primary">{field.label}</span>
    </label>
  );
}

function TextareaField({ field, value, onChange, error }) {
  return (
    <div>
      <label
        htmlFor={`attr-${field.name}`}
        className="block text-sm font-medium text-text-secondary mb-1"
      >
        {field.label}
      </label>
      <textarea
        id={`attr-${field.name}`}
        name={field.name}
        rows={3}
        placeholder={field.placeholder || ""}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border px-3 py-2 text-sm bg-surface text-text-primary
          placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500
          ${error ? "border-red-500" : "border-border"}`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Export field map for extensibility
DynamicField.FIELD_MAP = FIELD_MAP;
