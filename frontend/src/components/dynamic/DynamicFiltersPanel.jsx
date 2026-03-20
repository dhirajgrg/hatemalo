import { Input, Select } from "../ui";

export default function DynamicFiltersPanel({ config, values, onChange }) {
  if (!config?.filters?.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
      {config.filters.map((filter) => (
        <FilterField
          key={filter.name}
          filter={filter}
          value={values[filter.name]}
          onChange={(val) => onChange(filter.name, val)}
        />
      ))}
    </div>
  );
}

function FilterField({ filter, value, onChange }) {
  switch (filter.type) {
    case "select":
      return (
        <Select
          id={`filter-${filter.name}`}
          placeholder={`All ${filter.label}`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          options={(filter.options || []).map((opt) => ({
            value: opt,
            label: opt,
          }))}
        />
      );

    case "range":
      return (
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            {filter.label}
          </label>
          <div className="flex gap-2">
            <Input
              id={`filter-${filter.name}-min`}
              placeholder="Min"
              type="number"
              value={value?.min || ""}
              onChange={(e) =>
                onChange({ ...(value || {}), min: e.target.value })
              }
            />
            <Input
              id={`filter-${filter.name}-max`}
              placeholder="Max"
              type="number"
              value={value?.max || ""}
              onChange={(e) =>
                onChange({ ...(value || {}), max: e.target.value })
              }
            />
          </div>
        </div>
      );

    case "checkbox":
      return (
        <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked ? "true" : "")}
            className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-text-primary">{filter.label}</span>
        </label>
      );

    case "multiselect":
      return (
        <Select
          id={`filter-${filter.name}`}
          placeholder={`All ${filter.label}`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          options={(filter.options || []).map((opt) => ({
            value: opt,
            label: opt,
          }))}
        />
      );

    default:
      return null;
  }
}
