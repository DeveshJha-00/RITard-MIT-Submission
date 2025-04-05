declare module "@/data/transactions.json" {
  interface Transaction {
    externalId: string;
    aisType: string;
    accountId: string;
    accountName: string;
    accountIdentity: string;
    currency: string;
    amount: number;
    bookingDate: string;
    valueDate: string;
    bankTransactionCode: string;
    proprietaryBankTransactionCode: string;
    remittanceInformationUnstructured: string;
    creditorAccount: Record<string, never>;
    debtorAccount: {
      identity: string;
      iban: string;
      bban: string;
      currency: string;
    };
    accountIban: string;
    operationId: string;
    entryReference: string;
    endToEndId: string;
    debtorBic: string;
    purposeCode: string;
  }

  const data: Transaction[];
  export default { data };
} 