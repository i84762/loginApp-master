var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var configAuth = require('./auth');
var RememberMeStrategy = require('passport-remember-me-extended').Strategy;

const gConfig = require('./../_modules/config');
const mqUtil = require('./../_modules/mq/mq-util');
const utils = require('./../_modules/util/utils');

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user[0]._id);
    });

    passport.deserializeUser(function (id, done) {

        let findbyId = gConfig.get('/queue/findById');
        mqUtil.sendAndWait(findbyId,
            id,
            { 'replyTo': id + Date.now() + '-loginById' },
            (response, headers) => {
                response = JSON.parse(response);
                done(null, response.body);
            }
        );
    });
    passport.use(new LocalStrategy({
        passReqToCallback: true
    },
        function (req, email, password, done) {
            let queueName = gConfig.get('/queue/login');
            let user = { 'email': email, 'password': password };
            mqUtil.sendAndWait(queueName,
                user,
                { 'replyTo': req.id + '-login' },
                (response, headers) => {
                    response = JSON.parse(response);
                    if (response.status == 200)
                        return done(null, response.body);
                    else
                        return done(null, false, { message: response.message });
                }
            );
        }));
    // code for login (use('local-login', new LocalStategy))
    // code for signup (use('local-signup', new LocalStategy))

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        profileFields: ['id', 'emails', 'first_name', 'last_name', 'displayName', 'link']

    },

        // facebook will send back the token and profile
        function (token, refreshToken, profile, done) {

            console.log(profile.id);
            // asynchronous
            process.nextTick(function () {

                let findOrCreate = gConfig.get('/queue/findOrCreate');
                const package = {
                    filter: { originId: profile.id, origin: 'facebook' },
                    data: {
                        origin: 'facebook',
                        originId: profile.id,
                        originToken: token,
                        originDisplayName: profile.name.givenName + ' ' + profile.name.familyName,
                        name: profile.name.givenName + ' ' + profile.name.familyName,
                        email: profile.emails[0].value,
                    }
                }
                mqUtil.sendAndWait(findOrCreate,
                    package,
                    { 'replyTo': profile.id + Date.now() + '-findOrCreate', 'type': '', 'tempQueue': false },
                    (response, headers) => {
                        response = JSON.parse(response);
                        console.log([response.body]);
                        done(null, [response.body]);
                    }
                );
            });

        }));



    // =========================================================================
    // GOOGLE ================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        // pull in our app id and secret from our auth.js file
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL,
        profileFields: ['id', 'emails', 'first_name', 'last_name', 'displayName', 'link']

    },

        // Google will send back the token and profile
        function (token, refreshToken, profile, done) {

            console.log(profile);
            // asynchronous
            process.nextTick(function () {

                let findOrCreate = gConfig.get('/queue/findOrCreate');
                const package = {
                    filter: { originId: profile.id, origin: 'google' },
                    data: {
                        origin: 'google',
                        originId: profile.id,
                        originToken: token,
                        originDisplayName: profile.displayName,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                    }
                }
                mqUtil.sendAndWait(findOrCreate,
                    package,
                    { 'replyTo': profile.id + Date.now() + '-findOrCreate', 'type': '', 'tempQueue': false },
                    (response, headers) => {
                        response = JSON.parse(response);
                        console.log([response.body]);
                        done(null, [response.body]);
                    }
                );
            });

        }));

    passport.use(new RememberMeStrategy(
        function (token, done) {
            Token.consume(token, function (err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false); }
                return done(null, user);
            });
        },
        function (user, done) {
            var token = utils.generateToken(64);
            Token.save(token, { userId: user._id }, function (err) {
                if (err) { return done(err); }
                return done(null, token);
            });
        }
    ));

};