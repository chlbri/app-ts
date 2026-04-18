import { typings } from '#utils';

export const pphoneNumber = typings.any({
  countryCode: 'number',
  number: 'string',
  network: typings.optional('string'),
});

export const personality = typings.litterals('individual', 'company');

export const social = typings.any({
  platform: 'string',
  url: 'string',
});

export const intermediary = typings.intersection(
  {
    id: 'string',
    wallet: 'string',
    sacrifice: typings.optional('number'),
    contacts: typings.any({
      phoneNumbers: typings.array(pphoneNumber),
      emails: typings.optional(typings.array('string')),
      socials: typings.optional(typings.array(social)),
      websites: typings.optional(typings.array('string')),
    }),
  },
  typings.discriminatedUnion(
    'personality',
    {
      personality: typings.litterals('individual'),
      nationalID: 'string',
      name: typings.any({
        firstName: typings.optional('string'),
        lastName: typings.optional('string'),
      }),
    },
    {
      personality: typings.litterals('company'),
      companyName: 'string',
      registrationNumber: 'string',
    },
  ),
);

export const location = typings.partial({
  address: 'string',
  city: 'string',
  country: 'string',
  coordinates: {
    lat: 'number',
    lng: 'number',
  },
  googleMapsLink: 'string',
});

export const currency = typings.any({
  display: 'string',
  bank: 'string',
  description: typings.optional('string'),
});

export const asset = typings.any({
  id: 'string',
  description: 'string',
  value: 'number',
  currency,
  location: typings.optional(location),

  medias: typings.partial({
    photos: typings.array('string'),
    videos: typings.array('string'),
    documents: typings.array('string'),
  }),
});
