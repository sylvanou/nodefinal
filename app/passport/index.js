// load all the things we need
var LocalStrategy = require("passport-local").Strategy;

//load the crypto module.
var crypto = require("crypto");
var User = require("../models/user");

module.exports = function(passport) {
  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // =========================================================================
  // LOCAL ADMIN SIGNIN ======================================================
  // =========================================================================
  passport.use(
    "local-login",
    new LocalStrategy(
      {
        // by default, local strategy uses username and password, we will override with email
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
      },
      function(req, email, password, done) {
        if (email) email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
        // asynchronous
        process.nextTick(function() {
          User.findOne(
            {
              email: email
            },
            function(err, user) {
              // if there are any errors, return the error
              if (err) return done(err);
              // if no user is found, return the message
              else if (!user) {
                return done(
                  null,
                  false,
                  req.flash("loginMessage", "No user found.")
                );
              }

              // if password is invalid, return message
              else if (!user.validPassword(password)) {
                return done(
                  null,
                  false,
                  req.flash("loginMessage", "Oops! Wrong password.")
                );
              }

              // all is well, return user
              else return done(null, user);
            }
          );
        });
      }
    )
  );

  // =========================================================================
  // LOCAL ADMIN SIGNUP ======================================================
  // =========================================================================
  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        // by default, local strategy uses username and password, we will override with email
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
      },
      function(req, email, password, done) {
        if (email) email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
        // asynchronous
        process.nextTick(function() {
          // if the user is not already logged in:
          if (!req.user) {
            User.findOne(
              {
                email: email
              },
              function(err, user) {
                // if there are any errors, return the error
                if (err) return done(err);

                // check to see if theres already a user with that email
                if (user) {
                  return done(
                    null,
                    false,
                    req.flash("signupMessage", "That email is already taken.")
                  );
                } else if (password !== req.body.password_confirmation) {
                  return done(
                    null,
                    false,
                    req.flash("signupMessage", "Passwords do not match.")
                  );
                }
                // if everything is good register the user information and wait for email verification
                else {
                  var emailHash = crypto.randomBytes(20).toString("hex");
                  // create the user
                  var newUser = new User();
                  newUser.email = email;
                  newUser.password = newUser.generateHash(password);
                  newUser.name = req.body.name;

                  newUser.save(function(err) {
                    if (err) {
                      return done(err);
                    }
                    //Sets it to false to redirect the user to the login page.
                    return done(null, newUser);
                  });
                }
              }
            );
            // if the user is logged in but has no local account...
          } else {
            // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)

            return done(null, req.user);
          }
        });
      }
    )
  );
};
