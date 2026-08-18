"use client";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown" },
  { value: "multiselect", label: "Multi Select" },
  { value: "textarea", label: "Long Text" },
];

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "8px",
  background: "#f7f3f2",
  border: "1px solid #e5e7eb",
  color: "#131313",
  fontSize: "12px",
  outline: "none",
};

const labelStyleSm = {
  display: "block",
  fontSize: "10px",
  fontFamily: "var(--font-mono)",
  letterSpacing: "0.1em",
  color: "#6b7280",
  fontWeight: 700,
  marginBottom: "4px",
  textTransform: "uppercase",
};

export default function FormFieldsEditor({ fields = [], onChange }) {
  const addField = () => {
    onChange([...fields, { label: "", type: "text", required: false, options: "" }]);
  };

  const updateField = (index, key, value) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  };

  const removeField = (index) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const moveField = (index, direction) => {
    const updated = [...fields];
    const target = index + direction;
    if (target < 0 || target >= updated.length) return;
    [updated[index], updated[target]] = [updated[target], updated[index]];
    onChange(updated);
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-gray-200/90 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
        <div>
          <h3 className="font-mono-label text-xs uppercase font-bold tracking-widest text-[#131313]">
            Custom Registration Form Fields
          </h3>
          <p className="font-body-md text-xs text-gray-500 mt-0.5">
            Configure the questions attendees must complete to register.
          </p>
        </div>
        <span className="font-mono-label text-xs text-gray-500 font-semibold">
          {fields.length} {fields.length === 1 ? "Field" : "Fields"}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {fields.map((field, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-[#f7f3f2] border border-gray-200/90 flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              {/* Move buttons */}
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => moveField(i, -1)}
                  disabled={i === 0}
                  className="text-gray-400 hover:text-black disabled:opacity-20 text-[10px] cursor-pointer"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveField(i, 1)}
                  disabled={i === fields.length - 1}
                  className="text-gray-400 hover:text-black disabled:opacity-20 text-[10px] cursor-pointer"
                >
                  ▼
                </button>
              </div>

              {/* Label */}
              <div className="flex-1">
                <label style={labelStyleSm}>Field Label / Question</label>
                <input
                  style={{ ...inputStyle, background: "#ffffff" }}
                  value={field.label}
                  onChange={(e) => updateField(i, "label", e.target.value)}
                  placeholder="e.g. Roll Number or Department"
                  required
                />
              </div>

              {/* Type */}
              <div className="w-[140px]">
                <label style={labelStyleSm}>Input Type</label>
                <select
                  style={{ ...inputStyle, background: "#ffffff", cursor: "pointer" }}
                  value={field.type}
                  onChange={(e) => updateField(i, "type", e.target.value)}
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Required */}
              <div className="pt-4 flex items-center">
                <label className="flex items-center gap-1.5 font-mono-label text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(i, "required", e.target.checked)}
                    className="accent-black"
                  />
                  Required
                </label>
              </div>

              {/* Remove */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => removeField(i)}
                  className="text-red-400 hover:text-red-600 font-mono-label text-base px-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Options if select */}
            {(field.type === "select" || field.type === "multiselect") && (
              <div className="pl-6">
                <label style={labelStyleSm}>Options (Comma separated)</label>
                <input
                  style={{ ...inputStyle, background: "#ffffff" }}
                  value={field.options || ""}
                  onChange={(e) => updateField(i, "options", e.target.value)}
                  placeholder="e.g. First Year, Second Year, Third Year, Final Year"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addField}
        className="w-full mt-4 py-2.5 rounded-xl border border-dashed border-gray-300 hover:border-black text-gray-700 font-mono-label text-xs font-bold uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5"
      >
        + Add Question Field
      </button>
    </div>
  );
}
