export class IssueJWTPayloadDto {
  subject: string;
  role: string;
}

export class HeaderAuthorizationDto {
  header: string;
  value: string;
}

export class BasicAuthorizationDto {
  username: string;
  password: string;
}
