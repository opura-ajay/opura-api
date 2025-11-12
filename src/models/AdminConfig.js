import mongoose from "mongoose";

// Field schema for individual configuration fields
const fieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "text",
        "textarea",
        "dropdown",
        "toggle",
        "slider",
        "color",
        "image",
        "number",
        "list",
        "voice_preview",
      ],
      required: true,
    },
    maxLength: { type: Number },
    options: [{ type: String }],
    factory_value: { type: mongoose.Schema.Types.Mixed, required: true },
    current_value: { type: mongoose.Schema.Types.Mixed, required: true },
    access_role: {
      type: String,
      enum: ["merchant", "super_user", "system"],
      required: true,
    },
    guideline: { type: String },
    mandatory: { type: Boolean, default: false },
    showInfoIcon: { type: Boolean, default: false },
    infoText: { type: String },
  },
  { _id: false }
);

// Section schema for grouping fields
const sectionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    description: { type: String },
    visible: { type: Boolean, default: true },
    showInfoIcon: { type: Boolean, default: false },
    infoText: { type: String },
    fields: [fieldSchema],
  },
  { _id: false }
);

// Main AdminConfig schema
const adminConfigSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // merchant_id as _id
    meta: {
      version: { type: String, required: true },
      schema_owner: { type: String, required: true },
      schema_created: { type: Date, required: true },
      description: { type: String },
      audit: {
        last_updated_at: { type: Date, default: Date.now },
        last_updated_by: {
          user_id: { type: String },
          full_name: { type: String },
          email: { type: String },
        },
        last_change_summary: { type: String },
        change_count: { type: Number, default: 0 },
        created_by: {
          user_id: { type: String },
          full_name: { type: String },
          email: { type: String },
        },
      },
    },
    sections: {
      ui_branding: sectionSchema,
      conversation_personality: sectionSchema,
      ai_settings: sectionSchema,
      knowledge_base: sectionSchema,
      voice_speech: sectionSchema,
      guardrails: sectionSchema,
      meta_controls: sectionSchema,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AdminConfig", adminConfigSchema);
