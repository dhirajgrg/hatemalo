import { Schema, model } from "mongoose";

const listingSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Listing title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    price: Number,
    salary: Number,
    location: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
    images: [String],
    condition: {
      type: String,
      enum: ["New", "Used", "Like New", "Refurbished"],
    },
    listingType: {
      type: String,
      enum: ["For Sale", "For Rent", "Wanted", "Hiring"],
      default: "For Sale",
    },
    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    extraFields: Schema.Types.Mixed,
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "sold", "closed"],
      default: "pending",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ createdBy: 1 });
listingSchema.index({ "attributes.$**": 1 });

const Listing = model("Listing", listingSchema);

export default Listing;
