import { GroupField } from 'payload'

export const nagadGroup: GroupField = {
  name: 'nagad',
  type: 'group',

  admin: {
    condition: (data) => data?.paymentMethod === 'nagad',
  },

  fields: [
    {
      name: 'manualTrxId',
      type: 'text',
      label: 'নগদ ট্রানজেকশন আইডি (Manual)',
      required: true,
      admin: {
        placeholder: 'যেমন: 8AXXXXXX',
        description:
          'শিক্ষার্থী কর্তৃক সরবরাহকৃত নগদ ট্রানজেকশন নম্বর।',
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
  ],
}

