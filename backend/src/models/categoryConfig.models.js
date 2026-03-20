import { Schema, model } from "mongoose";

const fieldSchema = new Schema(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["text", "number", "select", "multiselect", "checkbox", "textarea"],
    },
    required: { type: Boolean, default: false },
    placeholder: String,
    options: [String],
    dependsOn: {
      field: String,
    },
    optionsMap: Schema.Types.Mixed,
    min: Number,
    max: Number,
    unit: String,
    group: String,
  },
  { _id: false },
);

const filterSchema = new Schema(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["select", "range", "checkbox", "multiselect"],
    },
    options: [String],
  },
  { _id: false },
);

const categoryConfigSchema = new Schema(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      unique: true,
    },
    fields: [fieldSchema],
    filters: [filterSchema],
    layout: {
      type: String,
      enum: ["grid", "list", "compact"],
      default: "grid",
    },
  },
  { timestamps: true },
);

const CategoryConfig = model("CategoryConfig", categoryConfigSchema);

export default CategoryConfig;
