import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import type { FieldAccess } from 'payload'
import { createEnrollmentsForOrder } from '@/utils/enrollment'

/**
 * Admin-only field access helper (same pattern as Product.ts).
 */
const adminOnlyFieldAccess: FieldAccess = ({ req }) =>
  (req?.user as { role?: string })?.role === 'admin'


export const OrdersCollection: CollectionOverride = ({ defaultCollection }) => {
  return {
    ...defaultCollection,

    hooks: {
      ...(defaultCollection.hooks || {}),
      afterChange: [
        ...((defaultCollection.hooks && defaultCollection.hooks.afterChange) || []),
        async ({ doc, req }) => {
          if (doc?.paymentStatus === 'paid') {
            await createEnrollmentsForOrder(req.payload, doc)
          }
        },
      ],
    },

    admin: {
      ...defaultCollection.admin,
      defaultColumns: ['createdAt', 'customerEmail', 'paymentMethod', 'paymentStatus', 'status'],
      useAsTitle: 'createdAt',
      group: 'Ecommerce',
    },

    fields: [
      // ── Keep all existing default fields (items tab, shipping tab, customer, etc.) ──
      ...(defaultCollection.fields || []),

      // ─────────────────────────────────────────────────────────────────────────────
      // PAYMENT METHOD (sidebar) — bkash auto | nagad manual
      // ─────────────────────────────────────────────────────────────────────────────
      {
        name: 'paymentMethod',
        type: 'select',
        label: 'পেমেন্ট মেথড',
        defaultValue: 'bkash',
        required: false,
        admin: {
          position: 'sidebar',
          description: 'bKash = অটো ট্রানজেকশন। নগদ = ম্যানুয়াল সাবমিশন।',
        },
        options: [
          { label: 'bKash (অটো)', value: 'bkash' },
          { label: 'নগদ (ম্যানুয়াল)', value: 'nagad' },
        ],
      },

      // ─────────────────────────────────────────────────────────────────────────────
      // PAYMENT STATUS (sidebar) — updated by admin after verification
      // ─────────────────────────────────────────────────────────────────────────────
      {
        name: 'paymentStatus',
        type: 'select',
        label: 'পেমেন্ট স্ট্যাটাস',
        defaultValue: 'pending',
        required: false,
        access: {
          // Anyone can read; only admin can change the status
          update: adminOnlyFieldAccess,
        },
        admin: {
          position: 'sidebar',
          description: 'নগদ ম্যানুয়াল যাচাইয়ের পরে এখানে "paid" করুন।',
        },
        options: [
          { label: '⏳ অপেক্ষমাণ (Pending)', value: 'pending' },
          { label: '✅ পরিশোধিত (Paid)', value: 'paid' },
          { label: '❌ ব্যর্থ (Failed)', value: 'failed' },
        ],
      },

      // ─────────────────────────────────────────────────────────────────────────────
      // bKash GROUP — auto-populated trxID from bKash adapter (admin-only)
      // Mirrors the existing bkashGroup from payload/lib/bkash/bkashPaymentGroup.ts
      // but with admin-only field access so it can't be tampered with by customers.
      // ─────────────────────────────────────────────────────────────────────────────
      {
        name: 'bkash',
        type: 'group',
        label: 'bKash পেমেন্ট তথ্য',
        admin: {
          condition: (data) => data?.paymentMethod === 'bkash',
          description: 'bKash গেটওয়ে দ্বারা স্বয়ংক্রিয়ভাবে পূরণ করা হয়।',
        },
        fields: [
          {
            name: 'paymentID',
            type: 'text',
            label: 'bKash Payment ID',
            access: {
              create: adminOnlyFieldAccess,
              update: adminOnlyFieldAccess,
            },
            admin: {
              readOnly: true,
              description: 'bKash কর্তৃক প্রদত্ত Payment ID।',
            },
          },
          {
            name: 'trxID',
            type: 'text',
            label: 'bKash Transaction ID',
            access: {
              create: adminOnlyFieldAccess,
              update: adminOnlyFieldAccess,
            },
            admin: {
              readOnly: true,
              description: 'সফল পেমেন্টের পরে bKash প্রদত্ত TrxID।',
            },
          },
        ],
      },

      // ─────────────────────────────────────────────────────────────────────────────
      // নগদ GROUP — manual trxId submitted by student, verified by admin
      // ─────────────────────────────────────────────────────────────────────────────
      {
        name: 'nagad',
        type: 'group',
        label: 'নগদ পেমেন্ট তথ্য',
        admin: {
          condition: (data) => data?.paymentMethod === 'nagad',
          description: 'শিক্ষার্থী কর্তৃক সরবরাহকৃত নগদ তথ্য।',
        },
        fields: [
          {
            name: 'manualTrxId',
            type: 'text',
            label: 'নগদ ট্রানজেকশন আইডি',
            required: false,
            admin: {
              placeholder: 'যেমন: 8AXXXXXX',
              description: 'শিক্ষার্থী প্রদত্ত নগদ ট্রানজেকশন নম্বর।',
            },
          },
          {
            name: 'senderNumber',
            type: 'text',
            label: 'নগদ প্রেরকের নম্বর',
            required: false,
            admin: {
              placeholder: '০১XXXXXXXXX',
              description: 'যে নম্বর থেকে পেমেন্ট পাঠানো হয়েছে।',
            },
          },
          {
            name: 'verificationNote',
            type: 'textarea',
            label: 'যাচাই নোট (Admin)',
            access: {
              create: adminOnlyFieldAccess,
              update: adminOnlyFieldAccess,
            },
            admin: {
              description: 'অ্যাডমিন কর্তৃক যাচাইকালীন নোট।',
            },
          },
        ],
      },
    ],
  }
}

