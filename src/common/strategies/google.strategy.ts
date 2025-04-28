import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { CONFIG } from '../../config/config.schema';
import { GoogleUser } from './google.interface';

@Injectable()
export class GoogleAuthStrategy {
  private oAuth2Client: OAuth2Client;

  constructor() {
    this.oAuth2Client = new OAuth2Client(CONFIG.GOOGLE_CLIENT_ID);
  }

  async validate(token: string): Promise<GoogleUser> {
    try {
      const ticket = await this.oAuth2Client.verifyIdToken({
        idToken: token,
        audience: CONFIG.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email_verified) {
        throw new UnauthorizedException('Google account email is not verified');
      }

      return {
        id: payload.sub,
        email: payload.email,
        verified_email: payload.email_verified,
        name: payload.name,
        given_name: payload.given_name,
        family_name: payload.family_name,
        picture: payload.picture,
        locale: payload.locale,
      };
    } catch (error) {
      throw new Error(`Invalid Google token: ${error.message}`);
    }
  }
}
