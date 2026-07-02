export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type DeleteAccountPayload = {
  password: string;
};