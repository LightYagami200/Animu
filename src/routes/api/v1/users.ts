// ===========================
// SECTION | IMPORTS
// ===========================
import axios from 'axios';
import { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import {
  discordClientID,
  discordClientSecret,
  discordRedirectURI,
  encryptionSecret,
} from '@keys';
import { sign } from 'tweetnacl';
import { validateUser } from '@routes/middlewares';
import { PublicKey } from '@solana/web3.js';
// =========================== !SECTION

// ===========================
// SECTION | INIT
// ===========================
const users = Router();
// =========================== !SECTION

// ===========================
// SECTION | MAIN
// ===========================
// -> Login
users.post(
  '/login',
  [body('code').not().isEmpty().trim()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const params = new URLSearchParams({
        client_id: discordClientID,
        client_secret: discordClientSecret,
        grant_type: 'authorization_code',
        code: req.body.code.toString(),
        redirect_uri: discordRedirectURI,
        scope: 'identify guilds',
      });

      const resp = await axios.post(
        'https://discordapp.com/api/oauth2/token',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const accessToken: string = resp.data.access_token;

      const payload = { accessToken };

      let token = jwt.sign(payload, encryptionSecret, {
        expiresIn: '7d',
      });

      return res.status(200).json({ token });
    } catch (e) {
      console.log(e);
      return res.status(401).json();
    }
  },
);

// -> Authorize user
users.post(
  '/auth',
  [validateUser(true)],
  async (req: Request, res: Response) => {
    return res.status(200).json({ user: req.user });
  },
);

// -> Verify user
users.post(
  '/verify',
  [
    validateUser(true),
    body('publicKey').isArray().not().isEmpty(),
    body('signature').isArray().not().isEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const message = 'Sign below to verify your wallet ≧◡≦';
    const encodedMessage = new TextEncoder().encode(message);
    const publicKey = new PublicKey(req.body.publicKey);
    const signature = new Uint8Array(req.body.signature);

    const valid = sign.detached.verify(
      encodedMessage,
      signature,
      publicKey.toBytes(),
    );

    if (!valid) return res.status(401).json();

    const user = await req.user.user.addPublicKey(publicKey.toString());

    return res.status(200).json({
      user,
    });
  },
);

export default users;
// =========================== !SECTION
