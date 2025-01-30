interface TwilioCredentials {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

let twilioCredentials: TwilioCredentials | null = null;

export const setTwilioCredentials = (credentials: TwilioCredentials) => {
  twilioCredentials = credentials;
};

export const getTwilioCredentials = () => {
  return twilioCredentials;
};