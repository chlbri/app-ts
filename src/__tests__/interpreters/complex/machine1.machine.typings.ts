import { helpers } from '@bemedev/typings';

export const pphoneNumber = helpers.any({
  countryCode: 'number',
  number: 'string',
  network: helpers.optional('string'),
});

export const personality = helpers.litterals('individual', 'company');

export const social = helpers.primitiveObject({
  platform: 'string',
  url: 'string',
});

export const intermediary = helpers.intersection(
  {
    id: 'string',
    wallet: 'string',
    sacrifice: helpers.optional('number'),
    contacts: helpers.primitiveObject({
      phoneNumbers: helpers.array(pphoneNumber),
      emails: helpers.optional(helpers.array('string')),
      socials: helpers.optional(helpers.array(social)),
      websites: helpers.optional(helpers.array('string')),
    }),
  },
  helpers.union.discriminated(
    'personality',
    {
      personality: helpers.litterals('individual'),
      nationalID: 'string',
      name: helpers.primitiveObject({
        firstName: helpers.optional('string'),
        lastName: helpers.optional('string'),
      }),
    },
    {
      personality: helpers.litterals('company'),
      companyName: 'string',
      registrationNumber: 'string',
    },
  ),
);

export const location = helpers.partial({
  address: 'string',
  city: 'string',
  country: 'string',
  coordinates: {
    lat: 'number',
    lng: 'number',
  },
  googleMapsLink: 'string',
});

export const currency = helpers.any({
  display: 'string',
  bank: 'string',
  description: helpers.optional('string'),
});

export const asset = helpers.any({
  id: 'string',
  description: 'string',
  value: 'number',
  currency,
  location: helpers.optional(location),

  medias: helpers.partial({
    photos: helpers.array('string'),
    videos: helpers.array('string'),
    documents: helpers.array('string'),
  }),
});
