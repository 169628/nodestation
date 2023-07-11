const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");

const { query } = require("../connection/mysql");
const errorMessage = require("./errorMessage");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/google/callback",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const googleUser = {
          google_id: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
        };

        // 檢查是否已註冊
        let searchResult = await query(
          `select * from users where google_id = ${googleUser.google_id}`
        );

        // 註冊
        if (searchResult.length == 0) {
          // object 變 array
          let dbData = [];
          for (let key in googleUser) {
            dbData.push(googleUser[key]);
          }

          const insertResult = await query(
            "insert into users(google_id,username,email) value(?,?,?)",
            dbData
          );

          if (insertResult.insertId) {
            googleUser._id = insertResult.insertId;
            return cb(null, googleUser);
          }
        }

        // 已註冊
        const { _id, username } = searchResult[0];
        return cb(null, { _id, username });
      } catch (err) {
        console.log(err);
      }
    }
  )
);
