import { typings } from '#utils';

export const pphoneNumber = typings.any({
  countryCode: 'number',
  number: 'string',
  network: typings.maybe('string'),
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
    sacrifice: typings.maybe('number'),
    contacts: typings.any({
      phoneNumbers: [pphoneNumber],
      emails: typings.maybe(['string']),
      socials: typings.maybe([social]),
      websites: typings.maybe(['string']),
    }),
  },
  typings.discriminatedUnion(
    'personality',
    {
      personality: typings.litterals('individual'),
      nationalID: 'string',
      name: typings.any({
        firstName: typings.maybe('string'),
        lastName: typings.maybe('string'),
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
  description: typings.maybe('string'),
});

export const asset = typings.any({
  id: 'string',
  description: 'string',
  value: 'number',
  currency,
  location: typings.maybe(location),

  medias: typings.partial({
    photos: ['string'],
    videos: ['string'],
    documents: ['string'],
  }),
});
