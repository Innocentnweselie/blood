import crypto from "crypto";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

const configurePassport = (passport) => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientID || !clientSecret) {
    console.warn(
      "Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
    );
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile?.emails?.[0]?.value;
          if (!email) {
            return done(new Error("Google account has no email."), null);
          }

          const avatarUrl = profile?.photos?.[0]?.value;
          let user = await User.findOne({ email });
          if (user) {
            let needsSave = false;
            if (user.isVerified === false) {
              user.isVerified = true;
              user.otp = undefined;
              user.otpExpires = undefined;
              needsSave = true;
            }
            if (avatarUrl && !user.avatarUrl) {
              user.avatarUrl = avatarUrl;
              needsSave = true;
            }
            if (needsSave) {
              await user.save();
            }
            return done(null, user);
          }

          const verifiedAdminExists = await User.exists({ role: "admin", isVerified: true });
          if (verifiedAdminExists) {
            return done(new Error("Google signup is disabled."), null);
          }

          const randomPassword = crypto.randomBytes(24).toString("hex");
          user = await User.create({
            name: profile.displayName || "Google User",
            email,
            password: randomPassword,
            isVerified: true,
            avatarUrl,
            role: "admin",
          });

          return done(null, user);
        } catch (err) {
          console.error("Google auth error:", err);
          return done(err, null);
        }
      }
    )
  );
};

export default configurePassport;
