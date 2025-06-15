import {Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt';
import passport from 'passport';
import pool from '../../db.js';
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY || 'binance', // Use environment variable in production
};
passport.use(new JwtStrategy(opts, async (jwtPayload, done) => {
  try {
    const result = await pool.query('SELECT * FROM crypto_users WHERE id = $1', [jwtPayload.userId]);
    const user = result.rows[0];

    if (user) {
      return done(null, user); // User found, pass user object to next middleware
    } else {
      return done(null, false); // User not found
    }
  } catch (error) {
    return done(error, false); // Error occurred during database query
  }
}));
export default passport;