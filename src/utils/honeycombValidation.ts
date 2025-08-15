import { z } from 'zod';

// Validation schemas for Honeycomb Protocol data structures
export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(50, 'Project name too long'),
  authority: z.string().min(1, 'Authority address is required'),
  metadata: z.object({
    achievements: z.array(z.string()).optional(),
    customDataFields: z.array(z.string()).optional(),
  }).optional(),
});

export const userInfoSchema = z.object({
  name: z.string().min(1, 'Name is required').max(32, 'Name too long'),
  bio: z.string().max(256, 'Bio too long').optional(),
  pfp: z.string().url('Invalid profile picture URL').optional(),
});

export const profileSchema = z.object({
  identity: z.string().min(1, 'Profile identity is required'),
  info: userInfoSchema,
});

export const characterTraitsSchema = z.object({
  strength: z.number().int().min(1).max(100),
  agility: z.number().int().min(1).max(100),
  intelligence: z.number().int().min(1).max(100),
  element: z.enum(['Fire', 'Water', 'Earth', 'Air']),
  rarity: z.enum(['Common', 'Rare', 'Legendary']).optional(),
});

export const treeConfigSchema = z.object({
  basic: z.object({
    numAssets: z.number().int().min(1).max(1000000),
  }).optional(),
});

// Utility functions for validation
export const validateProjectData = (data: unknown) => {
  return projectSchema.safeParse(data);
};

export const validateUserInfo = (data: unknown) => {
  return userInfoSchema.safeParse(data);
};

export const validateProfileData = (data: unknown) => {
  return profileSchema.safeParse(data);
};

export const validateCharacterTraits = (data: unknown) => {
  return characterTraitsSchema.safeParse(data);
};

export const validateTreeConfig = (data: unknown) => {
  return treeConfigSchema.safeParse(data);
};

// Error handling utilities
export const formatValidationErrors = (errors: z.ZodError) => {
  return errors.errors.map(error => ({
    path: error.path.join('.'),
    message: error.message,
  }));
};

export const getValidationErrorMessage = (errors: z.ZodError) => {
  const formatted = formatValidationErrors(errors);
  return formatted.map(error => `${error.path}: ${error.message}`).join(', ');
};