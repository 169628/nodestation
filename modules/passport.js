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
        const { id, displayName, emails } = profile;
        // 檢查是否已註冊
        let searchResult = await query(
          `select * from users where google_id = ${id}`
        );
        // 已註冊，直接到 callback function
        if (searchResult.length != 0) {
          const { _id, username } = searchResult[0];
          return cb(null, { _id, username });
        }
        // 未註冊，新増
        const insertResult = await query(
          `insert into users(google_id,username,email) value("${id}","${displayName}","${emails[0].value}")`
        );
        if (!insertResult.protocol41) {
          return next(errorMessage(400, "insert new user failed"));
        }
        const user = {
          _id: insertResult.insertId,
          google_id: id,
          username: displayName,
          email: emails[0].value,
        };
        return cb(null, user);
      } catch (err) {
        console.log(err);
      }
    }
  )
);
