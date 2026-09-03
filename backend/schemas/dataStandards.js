// Common Data Standards: Enterprise JSON Schemas for Citizen, Business & Civic Records

export const CitizenRecordSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "CitizenRecord",
  type: "object",
  properties: {
    citizenId: { type: "string", pattern: "^CTZ-[0-9]{6}-[0-9]{4}$" },
    fullName: { type: "string", minLength: 2 },
    email: { type: "string", format: "email" },
    phone: { type: "string", pattern: "^\\+?[0-9]{10,14}$" },
    address: {
      type: "object",
      properties: {
        street: { type: "string" },
        town: { type: "string" },
        district: { type: "string" },
        state: { type: "string" },
        pin: { type: "string" }
      },
      required: ["district", "state"]
    }
  },
  required: ["citizenId", "fullName", "email"]
};

export const BusinessRecordSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "BusinessRecord",
  type: "object",
  properties: {
    businessId: { type: "string", pattern: "^BIZ-[0-9]{6}-[0-9]{4}$" },
    businessName: { type: "string" },
    tradeCategory: { type: "string" },
    licenseStatus: { type: "string", enum: ["Active", "Pending", "Suspended"] },
    ownerCitizenId: { type: "string" }
  },
  required: ["businessId", "businessName", "ownerCitizenId"]
};

export default {
  CitizenRecordSchema,
  BusinessRecordSchema
};
