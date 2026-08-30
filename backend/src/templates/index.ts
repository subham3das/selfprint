/**
 * Email & Notification HTML/Text Template Builders
 */
export const emailTemplates = {
  welcomeStore: (storeName: string, ownerName: string) => ({
    subject: `Welcome to Self Print Partner - ${storeName}`,
    body: `Hello ${ownerName}, your store ${storeName} has been registered successfully.`
  }),
  jobReceipt: (jobCode: string, amount: number) => ({
    subject: `Self Print Receipt - Job ${jobCode}`,
    body: `Thank you for printing with Self Print. Amount paid: ₹${amount.toFixed(2)}.`
  })
};

export default emailTemplates;
