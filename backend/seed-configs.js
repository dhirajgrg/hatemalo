import "dotenv/config";
import mongoose from "mongoose";
import dns from "dns";
import Category from "./src/models/category.models.js";
import CategoryConfig from "./src/models/categoryConfig.models.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Configs keyed by category name
const configs = {
  "Real Estate": {
    fields: [
      {
        name: "bedrooms",
        label: "Bedrooms",
        type: "number",
        required: true,
        min: 0,
        max: 20,
        group: "Property Details",
      },
      {
        name: "bathrooms",
        label: "Bathrooms",
        type: "number",
        required: true,
        min: 0,
        max: 10,
        group: "Property Details",
      },
      {
        name: "area",
        label: "Area",
        type: "number",
        unit: "sq ft",
        group: "Property Details",
      },
      {
        name: "furnishing",
        label: "Furnishing",
        type: "select",
        options: ["Furnished", "Semi-Furnished", "Unfurnished"],
        group: "Property Details",
      },
      {
        name: "parking",
        label: "Parking",
        type: "select",
        options: ["Yes", "No", "Garage"],
        group: "Amenities",
      },
      {
        name: "yearBuilt",
        label: "Year Built",
        type: "number",
        min: 1950,
        max: 2026,
        group: "Property Details",
      },
    ],
    filters: [
      { name: "bedrooms", label: "Bedrooms", type: "range" },
      { name: "bathrooms", label: "Bathrooms", type: "range" },
      { name: "area", label: "Area (sq ft)", type: "range" },
      {
        name: "furnishing",
        label: "Furnishing",
        type: "select",
        options: ["Furnished", "Semi-Furnished", "Unfurnished"],
      },
    ],
    layout: "grid",
  },

  Cars: {
    fields: [
      {
        name: "brand",
        label: "Brand",
        type: "select",
        required: true,
        options: [
          "Toyota",
          "Honda",
          "Hyundai",
          "Suzuki",
          "Tata",
          "Mahindra",
          "Kia",
          "Nissan",
          "BMW",
          "Mercedes",
        ],
        group: "Vehicle Info",
      },
      {
        name: "model",
        label: "Model",
        type: "select",
        dependsOn: { field: "brand" },
        optionsMap: {
          Toyota: ["Corolla", "Camry", "RAV4", "Hilux", "Fortuner"],
          Honda: ["Civic", "City", "CR-V", "Jazz", "Amaze"],
          Hyundai: ["Creta", "i20", "Venue", "Verna", "Tucson"],
          Suzuki: ["Swift", "Baleno", "Brezza", "Ertiga", "Alto"],
          Tata: ["Nexon", "Harrier", "Safari", "Punch", "Altroz"],
          Mahindra: ["Scorpio", "XUV700", "Thar", "Bolero", "XUV300"],
          Kia: ["Seltos", "Sonet", "Carnival", "EV6"],
          Nissan: ["Magnite", "Kicks", "X-Trail"],
          BMW: ["3 Series", "5 Series", "X1", "X3", "X5"],
          Mercedes: ["C-Class", "E-Class", "GLA", "GLC", "GLE"],
        },
        group: "Vehicle Info",
      },
      {
        name: "year",
        label: "Year",
        type: "number",
        required: true,
        min: 1990,
        max: 2026,
        group: "Vehicle Info",
      },
      {
        name: "mileage",
        label: "Mileage",
        type: "number",
        unit: "km",
        group: "Vehicle Info",
      },
      {
        name: "fuelType",
        label: "Fuel Type",
        type: "select",
        required: true,
        options: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"],
        group: "Specifications",
      },
      {
        name: "transmission",
        label: "Transmission",
        type: "select",
        required: true,
        options: ["Manual", "Automatic"],
        group: "Specifications",
      },
      {
        name: "condition",
        label: "Condition",
        type: "select",
        required: true,
        options: ["New", "Used", "Certified Pre-Owned"],
        group: "Specifications",
      },
    ],
    filters: [
      {
        name: "brand",
        label: "Brand",
        type: "select",
        options: [
          "Toyota",
          "Honda",
          "Hyundai",
          "Suzuki",
          "Tata",
          "Mahindra",
          "Kia",
          "Nissan",
          "BMW",
          "Mercedes",
        ],
      },
      {
        name: "fuelType",
        label: "Fuel Type",
        type: "select",
        options: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"],
      },
      {
        name: "transmission",
        label: "Transmission",
        type: "select",
        options: ["Manual", "Automatic"],
      },
      {
        name: "condition",
        label: "Condition",
        type: "select",
        options: ["New", "Used", "Certified Pre-Owned"],
      },
      { name: "year", label: "Year", type: "range" },
      { name: "mileage", label: "Mileage (km)", type: "range" },
    ],
    layout: "grid",
  },

  Jobs: {
    fields: [
      {
        name: "jobType",
        label: "Job Type",
        type: "select",
        required: true,
        options: ["Full-time", "Part-time", "Contract", "Remote", "Freelance"],
        group: "Job Details",
      },
      {
        name: "experience",
        label: "Experience",
        type: "select",
        required: true,
        options: [
          "Fresher",
          "1-2 years",
          "3-5 years",
          "5-10 years",
          "10+ years",
        ],
        group: "Job Details",
      },
      {
        name: "qualification",
        label: "Qualification",
        type: "select",
        options: [
          "SLC/SEE",
          "+2/Intermediate",
          "Bachelor's",
          "Master's",
          "PhD",
          "Any",
        ],
        group: "Requirements",
      },
      {
        name: "skills",
        label: "Skills",
        type: "multiselect",
        options: [
          "Communication",
          "MS Office",
          "Typing",
          "Accounting",
          "Sales",
          "Marketing",
          "Programming",
          "Design",
          "Management",
          "Customer Service",
        ],
        group: "Requirements",
      },
    ],
    filters: [
      {
        name: "jobType",
        label: "Job Type",
        type: "select",
        options: ["Full-time", "Part-time", "Contract", "Remote", "Freelance"],
      },
      {
        name: "experience",
        label: "Experience",
        type: "select",
        options: [
          "Fresher",
          "1-2 years",
          "3-5 years",
          "5-10 years",
          "10+ years",
        ],
      },
    ],
    layout: "list",
  },

  "Mobile Phones": {
    fields: [
      {
        name: "brand",
        label: "Brand",
        type: "select",
        required: true,
        options: [
          "Apple",
          "Samsung",
          "Xiaomi",
          "OnePlus",
          "Vivo",
          "Oppo",
          "Realme",
          "Nokia",
          "Google",
          "Nothing",
        ],
        group: "Phone Details",
      },
      {
        name: "storage",
        label: "Storage",
        type: "select",
        options: ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"],
        group: "Specifications",
      },
      {
        name: "ram",
        label: "RAM",
        type: "select",
        options: ["2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB"],
        group: "Specifications",
      },
      {
        name: "condition",
        label: "Condition",
        type: "select",
        required: true,
        options: ["Brand New", "Like New", "Good", "Fair"],
        group: "Phone Details",
      },
      {
        name: "color",
        label: "Color",
        type: "text",
        group: "Phone Details",
      },
    ],
    filters: [
      {
        name: "brand",
        label: "Brand",
        type: "select",
        options: [
          "Apple",
          "Samsung",
          "Xiaomi",
          "OnePlus",
          "Vivo",
          "Oppo",
          "Realme",
          "Nokia",
          "Google",
          "Nothing",
        ],
      },
      {
        name: "condition",
        label: "Condition",
        type: "select",
        options: ["Brand New", "Like New", "Good", "Fair"],
      },
      {
        name: "storage",
        label: "Storage",
        type: "select",
        options: ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"],
      },
    ],
    layout: "grid",
  },

  "Laptops & Notebooks": {
    fields: [
      {
        name: "brand",
        label: "Brand",
        type: "select",
        required: true,
        options: [
          "Apple",
          "Dell",
          "HP",
          "Lenovo",
          "Asus",
          "Acer",
          "MSI",
          "Samsung",
        ],
        group: "Laptop Details",
      },
      {
        name: "processor",
        label: "Processor",
        type: "text",
        placeholder: "e.g. Intel i7-12700H",
        group: "Specifications",
      },
      {
        name: "ram",
        label: "RAM",
        type: "select",
        options: ["4GB", "8GB", "16GB", "32GB", "64GB"],
        group: "Specifications",
      },
      {
        name: "storage",
        label: "Storage",
        type: "select",
        options: [
          "128GB SSD",
          "256GB SSD",
          "512GB SSD",
          "1TB SSD",
          "1TB HDD",
          "2TB HDD",
        ],
        group: "Specifications",
      },
      {
        name: "screenSize",
        label: "Screen Size",
        type: "select",
        options: ['13"', '14"', '15.6"', '16"', '17"'],
        group: "Display",
      },
      {
        name: "condition",
        label: "Condition",
        type: "select",
        required: true,
        options: ["Brand New", "Like New", "Good", "Fair"],
        group: "Laptop Details",
      },
    ],
    filters: [
      {
        name: "brand",
        label: "Brand",
        type: "select",
        options: [
          "Apple",
          "Dell",
          "HP",
          "Lenovo",
          "Asus",
          "Acer",
          "MSI",
          "Samsung",
        ],
      },
      {
        name: "condition",
        label: "Condition",
        type: "select",
        options: ["Brand New", "Like New", "Good", "Fair"],
      },
      {
        name: "ram",
        label: "RAM",
        type: "select",
        options: ["4GB", "8GB", "16GB", "32GB", "64GB"],
      },
    ],
    layout: "grid",
  },

  "Fashion & Accessories": {
    fields: [
      {
        name: "size",
        label: "Size",
        type: "select",
        options: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"],
        group: "Details",
      },
      { name: "color", label: "Color", type: "text", group: "Details" },
      {
        name: "condition",
        label: "Condition",
        type: "select",
        required: true,
        options: [
          "Brand New with Tags",
          "Brand New",
          "Like New",
          "Good",
          "Fair",
        ],
        group: "Details",
      },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        options: ["Men", "Women", "Unisex", "Kids"],
        group: "Details",
      },
      { name: "brand", label: "Brand", type: "text", group: "Details" },
    ],
    filters: [
      {
        name: "condition",
        label: "Condition",
        type: "select",
        options: [
          "Brand New with Tags",
          "Brand New",
          "Like New",
          "Good",
          "Fair",
        ],
      },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        options: ["Men", "Women", "Unisex", "Kids"],
      },
    ],
    layout: "grid",
  },

  "Electronics & Appliances": {
    fields: [
      {
        name: "brand",
        label: "Brand",
        type: "text",
        group: "Product Details",
      },
      {
        name: "condition",
        label: "Condition",
        type: "select",
        required: true,
        options: ["Brand New", "Like New", "Good", "Fair"],
        group: "Product Details",
      },
      {
        name: "warranty",
        label: "Warranty",
        type: "select",
        options: ["Under Warranty", "Expired", "No Warranty"],
        group: "Product Details",
      },
    ],
    filters: [
      {
        name: "condition",
        label: "Condition",
        type: "select",
        options: ["Brand New", "Like New", "Good", "Fair"],
      },
      {
        name: "warranty",
        label: "Warranty",
        type: "select",
        options: ["Under Warranty", "Expired", "No Warranty"],
      },
    ],
    layout: "grid",
  },

  "Motors / Vehicles": {
    fields: [
      { name: "brand", label: "Brand", type: "text", required: true },
      { name: "year", label: "Year", type: "number", min: 1990, max: 2026 },
      { name: "mileage", label: "Mileage", type: "number", unit: "km" },
      {
        name: "fuelType",
        label: "Fuel Type",
        type: "select",
        options: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"],
      },
      {
        name: "condition",
        label: "Condition",
        type: "select",
        required: true,
        options: ["New", "Used"],
      },
    ],
    filters: [
      {
        name: "fuelType",
        label: "Fuel Type",
        type: "select",
        options: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"],
      },
      {
        name: "condition",
        label: "Condition",
        type: "select",
        options: ["New", "Used"],
      },
      { name: "year", label: "Year", type: "range" },
    ],
    layout: "grid",
  },

  "Animals & Pets": {
    fields: [
      { name: "breed", label: "Breed", type: "text", required: true },
      {
        name: "age",
        label: "Age",
        type: "text",
        placeholder: "e.g. 2 months, 1 year",
      },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        options: ["Male", "Female"],
      },
      { name: "vaccinated", label: "Vaccinated", type: "checkbox" },
    ],
    filters: [
      {
        name: "gender",
        label: "Gender",
        type: "select",
        options: ["Male", "Female"],
      },
      { name: "vaccinated", label: "Vaccinated", type: "checkbox" },
    ],
    layout: "grid",
  },

  "Home, Garden & Pool": {
    fields: [
      {
        name: "condition",
        label: "Condition",
        type: "select",
        required: true,
        options: ["Brand New", "Like New", "Good", "Fair"],
        group: "Details",
      },
      { name: "brand", label: "Brand", type: "text", group: "Details" },
      {
        name: "material",
        label: "Material",
        type: "text",
        group: "Details",
      },
    ],
    filters: [
      {
        name: "condition",
        label: "Condition",
        type: "select",
        options: ["Brand New", "Like New", "Good", "Fair"],
      },
    ],
    layout: "grid",
  },

  "Hobbies, Sports & Leisure": {
    fields: [
      {
        name: "condition",
        label: "Condition",
        type: "select",
        required: true,
        options: ["Brand New", "Like New", "Good", "Fair"],
      },
      { name: "brand", label: "Brand", type: "text" },
    ],
    filters: [
      {
        name: "condition",
        label: "Condition",
        type: "select",
        options: ["Brand New", "Like New", "Good", "Fair"],
      },
    ],
    layout: "grid",
  },

  "Computers & Gaming": {
    fields: [
      {
        name: "brand",
        label: "Brand",
        type: "text",
        group: "Product Details",
      },
      {
        name: "condition",
        label: "Condition",
        type: "select",
        required: true,
        options: ["Brand New", "Like New", "Good", "Fair"],
        group: "Product Details",
      },
      {
        name: "warranty",
        label: "Warranty",
        type: "select",
        options: ["Under Warranty", "Expired", "No Warranty"],
        group: "Product Details",
      },
    ],
    filters: [
      {
        name: "condition",
        label: "Condition",
        type: "select",
        options: ["Brand New", "Like New", "Good", "Fair"],
      },
    ],
    layout: "grid",
  },

  "Mobile Phones & Communication": {
    fields: [
      { name: "brand", label: "Brand", type: "text", required: true },
      {
        name: "condition",
        label: "Condition",
        type: "select",
        required: true,
        options: ["Brand New", "Like New", "Good", "Fair"],
      },
    ],
    filters: [
      {
        name: "condition",
        label: "Condition",
        type: "select",
        options: ["Brand New", "Like New", "Good", "Fair"],
      },
    ],
    layout: "grid",
  },
};

const seedConfigs = async () => {
  try {
    const mongoUri = process.env.MONGO_URI.replace(
      "<db_password>",
      process.env.DB_PASSWORD,
    );
    await mongoose.connect(mongoUri);
    console.log("Connected to DB");

    await CategoryConfig.deleteMany({});
    console.log("Cleared existing configs");

    const allCategories = await Category.find().lean();

    for (const [categoryName, configData] of Object.entries(configs)) {
      const cat = allCategories.find((c) => c.name === categoryName);
      if (!cat) {
        console.log(`⚠ Category "${categoryName}" not found, skipping`);
        continue;
      }

      await CategoryConfig.create({
        category: cat._id,
        fields: configData.fields,
        filters: configData.filters,
        layout: configData.layout,
      });
      console.log(`✓ Config created for "${categoryName}"`);
    }

    console.log("\nConfig seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Config seeding failed:", err.message);
    process.exit(1);
  }
};

seedConfigs();
