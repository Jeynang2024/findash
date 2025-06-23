import {Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt';
import passport from 'passport';
import pool from '../../db.js';
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY || 'binance',
};
passport.use("jwt",new JwtStrategy(opts, async (jwtPayload, done) => {
  try {
    const result = await pool.query('SELECT * FROM crypto_users WHERE id = $1', [jwtPayload.userId]);
    const user = result.rows[0];

    if (user) {
      return done(null, user);
    } else {
      return done(null, false); 
    }
  } catch (error) {
    return done(error, false); 
  }
}));
export default passport;