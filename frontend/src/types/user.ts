export type UserSummary = {
  id: string;
  username: string;
  profilePictureUrl: string | null;
};

export type UpdateUserRequest = {
  username: string;
  profilePictureUrl: string | null;
};
