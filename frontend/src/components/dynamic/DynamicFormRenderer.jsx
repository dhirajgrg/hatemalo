import DynamicField from "./DynamicField";

export default function DynamicFormRenderer({
  config,
  values,
  onChange,
  errors,
}) {
  if (!config?.fields?.length) return null;

  // Group fields by their 'group' property
  const groups = {};
  const ungrouped = [];

  config.fields.forEach((field) => {
    if (field.group) {
      if (!groups[field.group]) groups[field.group] = [];
      groups[field.group].push(field);
    } else {
      ungrouped.push(field);
    }
  });

  // Resolve options for dependent fields
  const resolveOptions = (field) => {
    if (field.dependsOn?.field) {
      const parentValue = values[field.dependsOn.field];
      return field.optionsMap?.[parentValue] || [];
    }
    return field.options;
  };

  const renderField = (field) => (
    <DynamicField
      key={field.name}
      field={{ ...field, options: resolveOptions(field) }}
      value={values[field.name] ?? ""}
      onChange={(val) => onChange(field.name, val)}
      error={errors?.[field.name]}
    />
  );

  return (
    <div className="space-y-4">
      {/* Ungrouped fields */}
      {ungrouped.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ungrouped.map(renderField)}
        </div>
      )}

      {/* Grouped fields */}
      {Object.entries(groups).map(([groupName, fields]) => (
        <div key={groupName}>
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 mt-2">
            {groupName}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(renderField)}
          </div>
        </div>
      ))}
    </div>
  );
}
