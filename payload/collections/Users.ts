// src/collections/Users/index.ts
import type { CollectionConfig } from 'payload'
import { betterAuthStrategy } from '@delmaredigital/payload-better-auth'




export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    group: 'Users',
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
  },
  auth: {
    disableLocalStrategy: true,
    strategies: [betterAuthStrategy()],
  },

  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if ((req.user as typeof req.user & { role?: string }).role === 'admin') return true
      return { id: { equals: req.user.id } }
    },
    create: ({ req }) => (req.user as (typeof req.user & { role?: string }) | undefined)?.role === 'admin',
    update: ({ req }) => {
      if (!req.user) return false
      if ((req.user as typeof req.user & { role?: string }).role === 'admin') return true
      return { id: { equals: req.user.id } }
    },
    delete: ({ req }) =>
      (req.user as (typeof req.user & { role?: string }) | undefined)?.role === 'admin',
    admin: ({ req }) =>
      (req.user as (typeof req.user & { role?: string }) | undefined)?.role === 'admin',
  },

  fields: [
    { name: 'email', type: 'email', required: true, unique: true },
    { name: 'emailVerified', type: 'checkbox', defaultValue: false },
    { name: 'name', type: 'text' },
    { name: 'image', type: 'text' },
    { name: 'phone', type: 'text', label: 'মোবাইল নম্বর (Phone Number)' },
    { name: 'sscBatch', type: 'text', label: 'এসএসসি ব্যাচ (SSC Batch)' },
    { name: 'hscBatch', type: 'text', label: 'এইচএসসি ব্যাচ (HSC Batch)' },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'user',
      access: {
        update: ({ req }) =>
          (req.user as (typeof req.user & { role?: string }) | undefined)?.role === 'admin',
      },
      options: [
        { label: 'User', value: 'user' },
        { label: 'Admin', value: 'admin' },
        { label: 'Teacher', value: 'teacher' },
        { label: 'Coordinator', value: 'coordinator' },
      ],
    },
    {
      name: 'orders',
      type: 'join',
      collection: 'orders',
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id', 'createdAt', 'total', 'currency', 'items'],
      },
    },
    {
      name: 'cart',
      type: 'join',
      collection: 'carts',
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id', 'createdAt', 'total', 'currency', 'items'],
      },
    },
    {
      name: 'addresses',
      type: 'join',
      collection: 'addresses',
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id'],
      },
    },
  ],
}