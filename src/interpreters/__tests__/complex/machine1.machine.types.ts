export type PhoneNumber = {
  countryCode: number;
  number: string;
  network?: string;
};

export type Personality = 'individual' | 'company';

export type Social = {
  platform: string;
  url: string;
};

// An intermediary in the chain

// #region type Intermediary
export type Intermediary = {
  id: string;
  wallet: string;
  sacrifice?: number;
  contacts: {
    // At least one phone number
    phoneNumbers: PhoneNumber[];
    emails?: string[];
    socials?: Social[];
    websites?: string[];
  };
} & (
  | {
      personality: 'individual';
      nationalID: string;
      name: {
        firstName?: string;
        lastName: string;
      };
    }
  | {
      personality: 'company';
      companyName: string;
      registrationNumber: string;
    }
);
// #endregion

export type CommissionType =
  | { mode: 'fixed'; amount: number }
  | { mode: 'percentage'; percentage: number };

// Commission procedure defined by the first intermediary
export type CommissionProcedure = {
  type: CommissionType;
  // Distribution formula: array of percentages or custom function

  repartitions: number[][];
};

export type Currency = {
  display: string;
  bank: string;
  description?: string;
};

// An asset for sale
export type Asset = {
  id: string;
  description: string;
  value: number;
  currency: Currency;
  medias: {
    photos?: string[];
    videos?: string[];
    documents?: string[];
  };
  location?: {
    address?: string;
    city?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    googleMapsLink?: string;
  };
};

// A contract transaction
export type Contract = {
  asset: Asset;
  intermediaries: Intermediary[];
  procedure: CommissionProcedure;
  date: Date;
};
