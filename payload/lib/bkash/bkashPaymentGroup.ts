import { GroupField } from "payload";

export const bkashGroup: GroupField = {
  name: 'bkash',
  type: 'group',

  admin: {
    condition: (data) => data?.paymentMethod === 'bkash',
  },

  fields: [
    {
      name: 'paymentID',
      type: 'text',
      label: 'bKash Payment ID',
      required: true,
    },
    {
      name: 'trxID',
      type: 'text',
      label: 'bKash Transaction ID',
      required: false,
    },
  ],
}