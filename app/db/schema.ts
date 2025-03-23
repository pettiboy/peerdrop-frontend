import { toTypedRxJsonSchema } from "rxdb";
import type { ExtractDocumentTypeFromTypedRxJsonSchema } from "rxdb";

/**
 * User schema type definition
 */
export type UserDocType = {
  id: string;
  name: string;
  deviceId: string;
  ecdhPublicKey: string;
  ecdhPrivateKey: string;
  eddsaPublicKey: string;
  eddsaPrivateKey: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * User schema definition following RxDB format
 */
const userSchemaLiteral = {
  title: "user schema",
  version: 0,
  description: "User schema for PeerDrop",
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
      maxLength: 100,
    },
    deviceId: {
      type: "string",
      maxLength: 100,
    },
    ecdhPublicKey: {
      type: "string",
    },
    ecdhPrivateKey: {
      type: "string",
    },
    eddsaPublicKey: {
      type: "string",
    },
    eddsaPrivateKey: {
      type: "string",
    },
    createdAt: {
      type: "string",
      format: "date-time",
    },
    updatedAt: {
      type: "string",
      format: "date-time",
    },
  },
  required: [
    "id",
    "name",
    "deviceId",
    "ecdhPublicKey",
    "ecdhPrivateKey",
    "eddsaPublicKey",
    "eddsaPrivateKey",
    "createdAt",
    "updatedAt",
  ],
  indexes: ["deviceId"],
} as const;

// Create typed schema
const userSchema = toTypedRxJsonSchema(userSchemaLiteral);

// Extract document type
export type UserDocument = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof userSchema
>;

// Export the schema
export const USER_SCHEMA = userSchema;
