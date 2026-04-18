import type { Asset, Intermediary } from './machine1.machine.types';

export const ASSET_1: Asset = {
  id: 'asset-001',
  description: 'A beautiful house',
  value: 300000,
  currency: {
    display: 'USD',
    bank: 'Bank of America',
  },
  medias: {
    photos: ['photo1.jpg', 'photo2.jpg'],
  },
  location: {
    address: '123 Main St',
    city: 'Anytown',
    country: 'USA',
    coordinates: {
      lat: 40.7128,
      lng: -74.006,
    },
    googleMapsLink: 'https://maps.google.com/?q=40.7128,-74.006',
  },
};

export const INTERMEDIARY_1: Intermediary = {
  id: 'intermediary-001',
  wallet: '0xintermediary123456',
  personality: 'individual',
  name: {
    firstName: 'Alice',
    lastName: 'Smith',
  },
  contacts: {
    phoneNumbers: [{ countryCode: +1, number: '0555123456' }],
    emails: ['alice.smith@example.com'],
  },
  nationalID: 'A123456789',
};

export const INTERMEDIARY_2: Intermediary = {
  id: 'intermediary-002',
  wallet: '0xintermediary654321',
  personality: 'company',
  companyName: 'Real Estate Co',
  registrationNumber: 'RECO-001',
  contacts: {
    phoneNumbers: [{ countryCode: +1, number: '0555987654' }],
    emails: ['info@realestateco.com'],
  },
};
