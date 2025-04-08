// config/passport.js
const { Strategy, ExtractJwt } = require('passport-jwt');
const Users = require('../models/usermodel.js'); // Adjust the path as necessary
const passport = require('passport');

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'codexlab', // Replace with your actual secret
};

passport.use(new Strategy(opts, async (jwt_payload, done) => {
    try {
        const user = await Users.findById(jwt_payload.user._id); // Adjust as necessary
        console.log("users",user)
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (err) {
        return done(err, false);
    }
}));

module.exports = passport;
