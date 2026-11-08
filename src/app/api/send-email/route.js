import nodemailer from "nodemailer";
import { createDamageEmailHandler } from "../../../lib/damage-email.mjs";

export const runtime = "nodejs";
export const POST = createDamageEmailHandler({
  createTransport: (options) => nodemailer.createTransport(options),
});
