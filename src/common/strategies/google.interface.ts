export interface GoogleUser {
  id: string | null;
  email: string | undefined;
  verified_email: boolean;
  name: string | undefined;
  given_name: string | undefined;
  family_name: string | undefined;
  picture: string | undefined;
  locale: string | undefined;
}
