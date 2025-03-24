import { toTypedRxJsonSchema } from "rxdb";
import type { ExtractDocumentTypeFromTypedRxJsonSchema } from "rxdb";

/**
 * Self Identity schema type definition
 */
export type SelfIdentityDocType = {
  id: string;
  ecdhSecretKey: string;
  ecdhPublicKey: string;
  eddsaSecretKey: string;
  eddsaPublicKey: string;
  userCode: string;
  name: string;
  createdAt: string;
};

/**
 * Connected Users schema type definition
 */
export type ConnectedUserDocType = {
  userCode: string;
  ecdhPublicKey: string;
  eddsaPublicKey: string;
  symmetricKey: string;
  name?: string;
  createdAt: string;
};

/**
 * Messages schema type definition
 */
export type MessageDocType = {
  id: string;
  conversationId: string;
  senderUserCode: string;
  content: string;
  timestamp: string;
};

/**
 * Self Identity schema definition
 */
const selfIdentitySchemaLiteral = {
  title: "selfIdentity",
  version: 0,
  description: "Schema for storing the user's own identity and keys",
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
      description: "Fixed value 'self' since there's only one document",
    },
    ecdhSecretKey: {
      type: "string",
      description: "ECDH secret key for key derivation",
      maxLength: 64,
    },
    ecdhPublicKey: {
      type: "string",
      description: "ECDH public key shared with others",
      maxLength: 64,
    },
    eddsaSecretKey: {
      type: "string",
      description: "EdDSA secret key for signing",
      maxLength: 64,
    },
    eddsaPublicKey: {
      type: "string",
      description: "EdDSA public key for verification",
      maxLength: 64,
    },
    userCode: {
      type: "string",
      description: "Unique code from server",
      maxLength: 255,
    },
    name: {
      type: "string",
      description: "User's name",
      maxLength: 255,
    },
    createdAt: {
      type: "string",
      format: "date-time",
      description: "Timestamp of creation",
    },
  },
  required: [
    "id",
    "ecdhSecretKey",
    "ecdhPublicKey",
    "eddsaSecretKey",
    "eddsaPublicKey",
    "userCode",
    "name",
  ],
} as const;

/**
 * Connected Users schema definition
 */
const connectedUsersSchemaLiteral = {
  title: "connectedUsers",
  version: 0,
  description: "Schema for storing connected users and their keys",
  primaryKey: "userCode",
  type: "object",
  properties: {
    userCode: {
      type: "string",
      description: "Unique identifier of the connected user",
      maxLength: 255,
    },
    ecdhPublicKey: {
      type: "string",
      description: "ECDH public key for key derivation",
      maxLength: 64,
    },
    eddsaPublicKey: {
      type: "string",
      description: "EdDSA public key for signature verification",
      maxLength: 64,
    },
    symmetricKey: {
      type: "string",
      description: "Derived symmetric key for message encryption",
    },
    name: {
      type: "string",
      description: "Connected user's name (optional)",
      maxLength: 255,
    },
    createdAt: {
      type: "string",
      format: "date-time",
      description: "Timestamp of connection",
    },
  },
  required: ["userCode", "ecdhPublicKey", "eddsaPublicKey", "createdAt"],
} as const;

/**
 * Messages schema definition
 */
const messagesSchemaLiteral = {
  title: "messages",
  version: 0,
  description: "Schema for storing chat messages",
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
      description: "Unique message identifier",
    },
    conversationId: {
      type: "string",
      description: "User code of the connected user (conversation identifier)",
      maxLength: 255,
    },
    senderUserCode: {
      type: "string",
      description: "User code of the sender",
      maxLength: 255,
    },
    content: {
      type: "string",
      description: "Decrypted message content",
    },
    timestamp: {
      type: "string",
      format: "date-time",
      description: "Message timestamp",
    },
  },
  required: ["id", "conversationId", "senderUserCode", "content", "timestamp"],
  indexes: ["conversationId"],
} as const;

// Create typed schemas
const selfIdentitySchema = toTypedRxJsonSchema(selfIdentitySchemaLiteral);
const connectedUsersSchema = toTypedRxJsonSchema(connectedUsersSchemaLiteral);
const messagesSchema = toTypedRxJsonSchema(messagesSchemaLiteral);

// Extract document types
export type SelfIdentityDocument = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof selfIdentitySchema
>;
export type ConnectedUserDocument = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof connectedUsersSchema
>;
export type MessageDocument = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof messagesSchema
>;

// Export the schemas
export const SELF_IDENTITY_SCHEMA = selfIdentitySchema;
export const CONNECTED_USERS_SCHEMA = connectedUsersSchema;
export const MESSAGES_SCHEMA = messagesSchema;
