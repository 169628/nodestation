const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGOOSE)
  .then(() => {
    console.log("mongodb connected!!");
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = mongoose;
