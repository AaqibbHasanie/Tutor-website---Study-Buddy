const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");

require("./db/conn");
// Databases connected (All collections)
const tutor_db = require("./models/tutor");
const student_db = require("./models/student");
const admin_db = require("./models/admin");

const ad_db = require("./models/ad");
const ann_db = require("./models/ann");
const appt_db = require("./models/appt");
const notif_db = require("./models/notif");
const resources_db = require("./models/resources");
const review_db = require("./models/review");

// check if admin_db collection is empty or not
// add an admin if it is empty
admin_db
  .find()
  .then((result) => {
    if (result.length == 0) {
      // add an admin
      const admin = new admin_db({
        email: "admin123@gmail.com",
        password: "admin123",
      });
      admin.save().then((result) => {
        console.log(result);
      });
    }
  })
  .catch((error) => {
    console.log(error);
  });

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../frontend/pages");
const partials_path = path.join(__dirname, "../frontend/components");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./signup_uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

app.get("/", (request, resolve) => {
  resolve.render("index");
});

app.get("/signup_follow", (request, resolve) => {
  resolve.render("signup_follow");
});


const crypto = require('crypto');
const cipher_key = 'secret password'; //our secret key for encryption and decryption
function encrypt(text, password) {
const iv = crypto.randomBytes(16);
const key = crypto.scryptSync(password, 'salt', 32);
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
let encrypted = cipher.update(text);
encrypted = Buffer.concat([encrypted, cipher.final()]);
return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text, password) {
const parts = text.split(':');
const iv = Buffer.from(parts.shift(), 'hex');
const encryptedText = Buffer.from(parts.join(':'), 'hex');
const key = crypto.scryptSync(password, 'salt', 32);
const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
let decrypted = decipher.update(encryptedText);
decrypted = Buffer.concat([decrypted, decipher.final()]);
return decrypted.toString();
}


function isValidEmail(email) {
  // Regular expression to validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Test email against the regex and return result
  return emailRegex.test(email);
}

// Example usage
// const email = "example@example";
// if (isValidEmail(email)) {
//   console.log("Valid email address");
// } else {
//   console.log("Invalid email address");
// }


// async function hunter_api(given_email) {
//   const apiKey = `3cbd2dbe8939a64e599f3a8ad85f7b21138628dd` //cater this in future
//   const url = `https://api.hunter.io/v2/email-verifier?email=${given_email}&api_key=${apiKey}`;
//   const response = await fetch(url);
//   const data = await response.json();
//   console.log(data.data);

//   if (data.data === undefined){
//     console.log("This is an Invalid Email");
//     return true;
//   }else{
//     if (data.data.status === "valid"){
//       console.log("This email already exists");
//       return false;
//     } else {
//       console.log("This is a new Email Address");
//       return true;
//     }
//   }
// }

// testing hunter_api
// const given_email = "shehryarsohail77@gmail.com";
// hunter_api(given_email).then(result => {
//   console.log(result,2);
// });

app.get("/signup_student", (request, resolve) => {
  //to go to that page
  resolve.render("signup_student");
});

// create a new user for our database
app.post(
  "/signup_student",
  upload.single("photo"),
  async (request, resolve) => {
    try {
      if (isValidEmail(request.body.email) === false) {
        console.log("Invalid email address");
        const message = "Invalid email address, please try again";
        const script = `<script>alert('${message}'); window.location.href = '/signup_student';</script>`;
        resolve.send(script);
        return;
      }

        // const result = await hunter_api(request.body.email); //hunter_api in action
        // console.log(result);
        // if (result) {
        //   const message = "This is not a valid email account, please enter an email that exists";
        //   const script = `<script>alert('${message}'); window.location.href = '/signup_student';</script>`;
        //   resolve.send(script);
        //   return;
        // }

  const capture_data = new student_db({
        name: request.body.name,
        email: request.body.email,
        // password: request.body.password,
        password: encrypt(request.body.password, cipher_key),
        photo: request.file
          ? request.file.path
          : "signup_uploads\\default123.jpg",
      });
      const signup_saved = await capture_data.save();
      const message = "Sign up as student Successful";
      const script = `<script>alert('${message}'); window.location.href = '/';</script>`;

      // resolve.status(201).render(script)
      resolve.send(script);
    } catch (error) {
      //error response design
      if (error.code === 11000) {
        // display an alert message to the user
        const message = "Email already exists";
        const script = `<script>alert('${message}'); window.location.href = '/signup_student';</script>`;
        resolve.send(script);
      } else {
        // display an alert message to the user
        const message = "Signup failed";
        const script = `<script>alert('${message}'); window.location.href = '/signup_student';</script>`;
        resolve.send(script);
      }
    }
  }
);

app.get("/signup_tutor", (request, resolve) => {
  //to go to that page
  resolve.render("signup_tutor");
});

// create a new user for our database
app.post("/signup_tutor", upload.single("photo"), async (request, resolve) => {
  try {

    if (isValidEmail(request.body.email) === false) {
      console.log("Invalid email address");
      const message = "Invalid email address, please try again";
      const script = `<script>alert('${message}'); window.location.href = '/signup_tutor';</script>`;
      resolve.send(script);
      return;
    }

    // const result = await hunter_api(request.body.email); //hunter_api in action
    // console.log(result);
    // if (result) {
    //   const message = "This is not a valid email account, please enter an email that exists";
    //   const script = `<script>alert('${message}'); window.location.href = '/signup_tutor';</script>`;
    //   resolve.send(script);
    //   return;
    // }

    // console.log(request.file);
    const capture_data = new tutor_db({
      name: request.body.name,
      email: request.body.email,
      // password: request.body.password,
      password: encrypt(request.body.password, cipher_key),
      photo: request.file
        ? request.file.path
        : "signup_uploads\\default123.jpg",
    });
    const signup_saved = await capture_data.save();
    const message = "Sign up as Tutor Successful";
    const script = `<script>alert('${message}'); window.location.href = '/';</script>`;

    // resolve.status(201).render(script)
    resolve.send(script);
  } catch (error) {
    //error response design
    if (error.code === 11000) {
      // display an alert message to the user
      const message = "Email already exists";
      const script = `<script>alert('${message}'); window.location.href = '/signup_tutor';</script>`;
      resolve.send(script);
    } else {
      // display an alert message to the user
      const message = "Signup failed";
      const script = `<script>alert('${message}'); window.location.href = '/signup_tutor';</script>`;
      resolve.send(script);
    }
  }
});

app.get("/login", (request, resolve) => {
  resolve.render("login");
});

app.get("/student_landing", (request, resolve) => {
  resolve.render("student_landing");
});

// create a new user for our database
app.post("/login", async (request, resolve) => {
  try {
    const { email, password, confirm_password, user_type } = request.body;
    if (user_type === "student") {
      student_db.find({ email }).then((result) => {
        // const matchingEmails = result.filter((result) => result.email === email);
        // const emails = matchingEmails.map((matchingEmail) => matchingEmail.email);
        // if (password !== confirm_password) {
        //   const message = "your password and confirm password are different";
        //   const script = `<script>alert('${message}'); window.location.href = '/login';</script>`;
        //   resolve.send(script);
        // } else {
        if (result.length === 0) {
          const message = "no such email exists";
          const script = `<script>alert('${message}'); window.location.href = '/login';</script>`;
          resolve.send(script);
        } else {
          const pass = result[0];
          decrypt_pass = decrypt(pass.password, cipher_key)
          if (decrypt_pass !== password) {
            const message = "password is incorrect";
            const script = `<script>alert('${message}'); window.location.href = '/login';</script>`;
            resolve.send(script);
          } else {
            //storing login details
            store_email = pass.email;
            store_password = decrypt_pass;
            console.log(store_email);
            console.log(store_password);
            // transfer of variables to another file
            module.exports = {
              store_email: store_email,
              store_password: store_password,
              user_type: user_type,
            };
            // const { store_email, store_password } = require('./app');
            const message =
              " ==>Student login successful-here we enter the student terminal";
            // resolve.send(email + message); //change this to render to new webpage (student terminal)
            // resolve.render("student_landing");
            resolve.render("student_landing");
          }
        }
        //}
      });
    } else if (user_type === "tutor") {
      tutor_db.find({ email }).then((result) => {
        // const matchingEmails = result.filter((result) => result.email === email);
        // const emails = matchingEmails.map((matchingEmail) => matchingEmail.email);
        // if (password !== confirm_password) {
        //   const message = "your password and confirm password are different";
        //   const script = `<script>alert('${message}'); window.location.href = '/login';</script>`;
        //   resolve.send(script);
        // } else {
        if (result.length === 0) {
          const message = "no such email exists";
          const script = `<script>alert('${message}'); window.location.href = '/login';</script>`;
          resolve.send(script);
        } else {
          const pass = result[0];
          decrypt_pass = decrypt(pass.password, cipher_key)
          if (decrypt_pass !== password) {
            const message = "password is incorrect";
            const script = `<script>alert('${message}'); window.location.href = '/login';</script>`;
            resolve.send(script);
          } else {
            store_email = pass.email;
            store_password = decrypt_pass;
            console.log(store_email);
            console.log(store_password);
            // transfer of variables to another file
            module.exports = {
              store_email: store_email,
              store_password: store_password,
              user_type: user_type,
            };
            const message =
              " ==>Tutor login successful-here we enter the Tutor terminal";
            // resolve.send(email + message); //change this to render to new webpage (tutor terminal)
            resolve.render("tutor_terminal");
          }
        }
        //}
      });
    } else if (user_type === "admin") {
      admin_db.find({ email }).then((result) => {
        // const matchingEmails = result.filter((result) => result.email === email);
        // const emails = matchingEmails.map((matchingEmail) => matchingEmail.email);
        // if (password !== confirm_password) {
        //   const message = "your password and confirm password are different";
        //   const script = `<script>alert('${message}'); window.location.href = '/login';</script>`;
        //   resolve.send(script);
        // } else {
        if (result.length === 0) {
          const message = "no such email exists";
          const script = `<script>alert('${message}'); window.location.href = '/login';</script>`;
          resolve.send(script);
        } else {
          const pass = result[0];
          if (pass.password !== password) {
            const message = "password is incorrect";
            const script = `<script>alert('${message}'); window.location.href = '/login';</script>`;
            resolve.send(script);
          } else {
            store_email = pass.email;
            store_password = pass.password;
            console.log(store_email);
            console.log(store_password);
            // transfer of variables to another file
            module.exports = {
              store_email: store_email,
              store_password: store_password,
              user_type: user_type,
            };
            const message =
              " ==>Admin login successful-here we enter the Admin terminal";
            // resolve.send(email + message); //change this to render to new webpage (tutor terminal)
            resolve.render("admin_terminal");
          }
        }
        //}
      });
    }
  } catch (error) {
    // Handle any errors
    resolve.status(500).send(error);
  }
});

// app.get ("/settings" , (request,resolve) => {
//     resolve.render("settings")
//     })

app.get("/settings", (req, res) => {
  const { store_password, store_email, user_type } = require("./app");
  const userType = user_type; // e.g. "student", "tutor", or "admin"
  res.render("settings", {
    userTypeIsStudent: userType === "student",
    userTypeIsTutor: userType === "tutor",
    userTypeIsAdmin: userType === "admin",
  });
});

// ad_db // code to delete ads
//   .find()
//   .then((ads) => {
//     if (ads.length > 0) {
//       ad_db
//         .deleteMany({})
//         .then(() => {
//           console.log("All ads have been deleted");
//         })
//         .catch((error) => {
//           console.error(error);
//         });
//     }
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// ad_db
//   .find()
//   .then((result) => {
//     let count = -1;

//     count += 1;

//     // Add ads
//     const ads = [
//       {
//         subject: "math",
//         class: "grade 7",
//         time: "Aaqib Hasanie",
//         price: "$50 per hour",
//         image:
//           "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bWFsZSUyMHByb2ZpbGV8ZW58MHx8MHx8&w=1000&q=80",
//       },
//       {
//         subject: "english",
//         class: "grade 12",
//         time: "Nawal sidique",
//         price: "$60 per hour",
//         image:
//           "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bWFsZSUyMHByb2ZpbGV8ZW58MHx8MHx8&w=1000&q=80",
//       },
//       {
//         subject: "biology",
//         class: "grade 8",
//         time: "Amna Sahar",
//         price: "$100 per hour",
//         image:
//           "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bWFsZSUyMHByb2ZpbGV8ZW58MHx8MHx8&w=1000&q=80",
//       },
//       {
//         subject: "sat",
//         class: "all grades",
//         time: "Shehryar",
//         price: "$10 per hour",
//         image:
//           "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bWFsZSUyMHByb2ZpbGV8ZW58MHx8MHx8&w=1000&q=80",
//       },
//       {
//         subject: "matric",
//         class: "grade 9",
//         time: "Shehryar",
//         price: "$5 per hour",
//         image:
//           "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bWFsZSUyMHByb2ZpbGV8ZW58MHx8MHx8&w=1000&q=80",
//       },
//       {
//         subject: "olevels",
//         class: "grade 10",
//         time: "Shafay",
//         price: "$50 per hour",
//         image:
//           "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bWFsZSUyMHByb2ZpbGV8ZW58MHx8MHx8&w=1000&q=80",
//       },
//       {
//         subject: "alevels",
//         class: "grade 11",
//         time: "Nafay",
//         price: "$50 per hour",
//         image:
//           "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bWFsZSUyMHByb2ZpbGV8ZW58MHx8MHx8&w=1000&q=80",
//       },
//       {
//         subject: "fsc",
//         class: "grade 10",
//         time: "Sumair",
//         price: "$5 per hour",
//         image:
//           "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bWFsZSUyMHByb2ZpbGV8ZW58MHx8MHx8&w=1000&q=80",
//       },
//     ];

//     ad_db
//       .insertMany(ads)
//       .then((result) => {
//         console.log("Ads added successfully");
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   })
//   .catch((error) => {
//     console.log(error);
//   });

app.get("/tutor_terminal", (request, resolve) => {
  resolve.render("tutor_terminal");
});
app.get("/student_terminal", (request, resolve) => {
  resolve.render("student_terminal");
});
app.get("/admin_terminal", (request, resolve) => {
  resolve.render("admin_terminal");
});

// app.get ("/update_password" , (request,resolve) => {
//     resolve.render("update_password")
//     })

app.get("/reviews", async (req, res) => {
  // making to check reviews of the tutor
  try {
    const tutors = await tutor_db.find({}).populate("reviews");
    const ads = tutors.flatMap((tutor) => tutor.ads);
    res.send(ads);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching ads");
  }
});

// ann_db // code to delete announcementes
//   .find()
//   .then((ann) => {
//     if (ann.length > 0) {
//       ann_db
//         .deleteMany({})
//         .then(() => {
//           console.log("All anns have been deleted");
//         })
//         .catch((error) => {
//           console.error(error);
//         });
//     }
//   })
//   .catch((error) => {
//     console.error(error);
//   });

app.post("/addann", async (req, res) => {
  try {
    const newAnnouncement = new ann_db({
      content: req.body.contentt,
      createdAt: new Date(),
    });

    await newAnnouncement.save();

    res.status(201).json({ message: "Announcement added successfully." });
  } catch (err) {
    // Send a response indicating an error occurred
    res.status(500).json({ message: "Failed to add announcement." });
  }
});

app.post("/addrec", async (req, res) => {
  // addrec just like add ann
  try {
    const newAnnouncement = new resources_db({
      content: req.body.contentt,
      createdAt: new Date(),
    });

    await newAnnouncement.save();

    res.status(201).json({ message: "resource added successfully." });
  } catch (err) {
    // Send a response indicating an error occurred
    console.log(err);
    res.status(500).json({ message: "Failed to add resource." });
  }
});

app.get("/viewann", async (req, res) => {
  try {
    // Find all the announcements in the database and sort them by createdAt date in descending order
    const announcements = await ann_db
      .find()
      .select("content createdAt")
      .sort({ createdAt: -1 });

    // Send the announcements back as a response
    res.status(200).json({ announcements });
  } catch (err) {
    // Send a response indicating an error occurred
    res.status(500).json({ message: "Failed to get announcements." });
  }
});

app.get("/viewrec", async (req, res) => {
  // just like viewann
  try {
    // Find all the announcements in the database and sort them by createdAt date in descending order
    const announcements = await resources_db
      .find()
      .select("content createdAt")
      .sort({ createdAt: -1 });

    // Send the announcements back as a response
    res.status(200).json({ announcements });
  } catch (err) {
    // Send a response indicating an error occurred
    res.status(500).json({ message: "Failed to get resources." });
  }
});

app.delete("/deleteann", async (req, res) => {
  // works greatly with id
  try {
    const adId = req.body._id;
    const deletedAd = await ann_db.findByIdAndDelete(adId);
    if (!deletedAd) {
      return res.status(404).send("announcement not found");
    }
    res.send("announcement deleted successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

app.delete("/deleterec", async (req, res) => {
  // delete resource like delete announcement
  // works greatly with id
  try {
    const adId = req.body._id;
    const deletedAd = await resources_db.findByIdAndDelete(adId);
    if (!deletedAd) {
      return res.status(404).send("resource not found");
    }
    res.send("resource deleted successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

// app.get("/ads", async (req, res) => {
//   // gives all ads
//   try {
//     const tutors = await ad_db.find({});
//     res.send(tutors);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error fetching ads");
//   }
// });

app.get("/ads", async (req, res) => {
  try {
    const tutors = await ad_db.find({}).sort({ createdAt: -1 }); // sort ads by descending order of createdAt field
    res.send(tutors);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching ads");
  }
});

app.post("/postad", async (req, res) => {
  try {
    // Create a new Ads object with data from the request body
    const newAds = new ad_db({
      subject: req.body.subject,
      class: req.body.class,
      time: req.body.time,
      price: req.body.price,
      image: req.body.image,
    });

    // Save the new Ads object to the database
    const savedAds = await newAds.save();

    // Send a success response with the saved object
    res.status(201).json("Ad added successfully");
  } catch (err) {
    // Handle any errors and send an error response
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/tutors", async (req, res) => {
  ///
  // function to return all tutors
  try {
    const tutors = await tutor_db.find({});
    res.send(tutors);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching tutors");
  }
});

app.get("/students", async (req, res) => {
  ///
  // function to return all tutors
  try {
    const tutors = await student_db.find({});
    res.send(tutors);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching tutors");
  }
});

app.get("/tutor/:name", async (req, res) => {
  // returns specific tutor
  const name = req.params.name;
  try {
    const tutor = await tutor_db.findOne({ name: name });
    if (!tutor) {
      res.status(404).send("username not found");
      return;
    }
    res.send(`The name of the tutor with email ${name} is ${tutor.name}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/username/:email", async (req, res) => {
  // receives an email, returns a username
  try {
    const { email } = req.params;
    const tutor = await tutor_db.findOne({ email }, "name");
    if (!tutor) {
      return res.status(404).send("Tutor not found");
    }
    const { name } = tutor;
    return res.status(200).json({ name });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/emailTutor/:username", async (req, res) => {
  // receives a username, returns an email
  try {
    const { username } = req.params;
    const tutor = await tutor_db.findOne({ name: username }, "email");
    if (!tutor) {
      return res.status(404).send("Tutor not found");
    }
    const { email } = tutor;
    return res.status(200).json({ email });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/usernameStudent/:email", async (req, res) => {
  // receives an email, returns a username
  try {
    const { email } = req.params;
    const tutor = await student_db.findOne({ email }, "name");
    if (!tutor) {
      return res.status(404).send("Student not found");
    }
    const { name } = tutor;
    return res.status(200).json({ name });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/adss/:username", async (req, res) => {
  // returns all ads associated to a particular email
  try {
    const { username } = req.params;
    const ads = await ad_db.find({ time: username });
    if (!ads) {
      return res.status(404).send("No ads found for this username");
    }
    return res.status(200).json({ ads });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

////////////////////////////// appt field ////////////////////////////////////////////////////////////////////appt field ////////////////////

// app.delete("/appointments", async (req, res) => {
//   // code to delete all appoint objects of tutors
//   try {
//     const result = await tutor_db.updateMany({}, { $set: { appoint: [] } }); // Set the 'appoint' field to an empty array for all documents
//     res.json({ message: "All appointments deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error deleting appointments" });
//   }
// });

// app.delete("/appointments", async (req, res) => {
//   // delete all appoint objects of students
//   // code to delete all requests
//   try {
//     const result = await student_db.updateMany({}, { $set: { appoint: [] } }); // Set the 'appoint' field to an empty array for all documents
//     res.json({ message: "All appointments deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error deleting appointments" });
//   }
// });

// app.delete("/appointments", async (req, res) => {
//   // function to delete all ads objects of students
//   // delete all ads objects of students
//   // code to delete all requests
//   try {
//     const result = await tutor_db.updateMany({}, { $set: { ads: [] } }); // Set the 'appoint' field to an empty array for all documents
//     res.json({ message: "All appointments deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error deleting appointments" });
//   }
// });

app.post("/addappt", async (req, res) => {
  // gets an email and adds relevant object which is the request to the appoint field of that object
  const { email, appoint } = req.body;

  try {
    // Find the tutor by email
    const tutor = await tutor_db.findOne({ email });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    // Update the tutor's appoint field with the passed object
    tutor.appoint.push(appoint);
    await tutor.save();

    return res.status(200).json({ message: "Tutor updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/apptviaemail/:email", async (req, res) => {
  // sends appointment to relevant email ig
  const { email } = req.params;

  try {
    const tutor = await tutor_db.findOne({ email });
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const appointments = tutor.appoint;
    res.status(200).json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/requestsappt/:email/:id", async (req, res) => {
  /// deletes a particular appointment after getting email of tutor and id of appt.
  try {
    const { email, id } = req.params;
    const tutor = await tutor_db.findOne({ email });

    let index = -1;
    for (let i = 0; i < tutor.appoint.length; i++) {
      if (tutor.appoint[i]._id == id) {
        index = i;
        break;
      }
    }

    if (index === -1) {
      res.status(404).json({ message: "Appointment not found" });
    } else {
      tutor.appoint.splice(index, 1);
      await tutor.save();
      res.json({ message: "Appointment deleted successfully" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/confirmedappts/:email/ads", async (req, res) => {
  // takes an email and adds an entire appointment object to the ads field of that email  (for tutor)
  try {
    const tutor = await tutor_db.findOneAndUpdate(
      { email: req.params.email },
      { $push: { ads: req.body } },
      { new: true }
    );
    if (!tutor) {
      return res.status(404).json({ error: "Tutor not found" });
    }
    return res.json(tutor);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

//// keep in mind that we are storing confirmed appts for both students and tutors in ads field of their db.

app.post("/confirmedapptsStudent/:email/ads", async (req, res) => {
  // takes an email of a student and adds an entire appointment object to the ads field of that email (for student)
  try {
    const student = await student_db.findOneAndUpdate(
      { email: req.params.email },
      { $push: { ads: req.body } },
      { new: true }
    );
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    return res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/returningConfirmedAppts/:email", async (req, res) => {
  /// returns all confirmed appts of tutors
  try {
    const tutor = await tutor_db.findOne({ email: req.params.email });
    if (!tutor) {
      return res.status(404).json({ error: "Tutor not found" });
    }
    const ads = tutor.ads;
    res.json({ ads });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.get("/returningConfirmedApptsStudents/:email", async (req, res) => {
  // returns all confirmed appts of students
  try {
    const tutor = await student_db.findOne({ email: req.params.email });
    if (!tutor) {
      return res.status(404).json({ error: "student not found" });
    }
    const ads = tutor.ads;
    res.json({ ads });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
//////////////////////// appt field ended ////////////////////////////////////////////////////////////////////// appt field ended //////////////

/////////////////////// reviews field started //////////////////////////////////////////////////////////////////// review field started ////////

app.get("/returnRelevantReviews/:email", async (req, res) => {
  // takes an email of tutor and returns all reviews
  try {
    const reviews = await review_db.find({ tutorEmail: req.params.email });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});
app.get("/returnRelevantReviewsStudent/:email", async (req, res) => {
  // takes an email of student and returns all reviews
  try {
    const reviews = await review_db.find({ studentEmail: req.params.email });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.delete("/deleteReviewById/:id", async (req, res) => {
  // takes an id and deletes the review
  try {
    const result = await review_db.deleteOne({ _id: req.params.id });
    console.log(result);
    res.status(200).send("Review deleted successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred while deleting the review");
  }
});

app.post("/addreview", async (req, res) => {
  // simply adds a review to the db (for student)
  try {
    const { tutorEmail, studentEmail, content } = req.body;

    const newReview = new review_db({
      content,
      tutorEmail,
      studentEmail,
    });

    const savedReview = await newReview.save();
    res.json("Review posted successfully");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.get("/viewallreviews", async (req, res) => {
  // returns all reviews - for admin
  try {
    const reviews = await review_db.find({});
    res.json({ reviews });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching reviews");
  }
});

app.delete("/deleteallreviews", async (req, res) => {
  /// deletes all reviews in the db
  try {
    const result = await review_db.deleteMany({});
    res.json({ message: `${result.deletedCount} reviews deleted.` });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting reviews");
  }
});

/////////////////////// reviews field ended //////////////////////////////////////////////////////////////////// review field ended ////////

app.delete("/deleteads", async (req, res) => {
  /// deletes an ad when given an id
  // works greatly with id
  try {
    const adId = req.body._id;
    const deletedAd = await ad_db.findByIdAndDelete(adId);
    if (!deletedAd) {
      return res.status(404).send("Ad not found");
    }
    res.send("Ad deleted successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

app.get("/search", async (req, res) => {
  // suggested one
  try {
    const searchQuery = String(req.query.q).toLowerCase(); // change req.body.q to req.query.q
    const ads = await ad_db.find({
      $or: [
        { subject: searchQuery },
        { class: searchQuery },
        { time: searchQuery },
        { price: searchQuery },
        { image: searchQuery },
      ],
    });
    res.send(ads);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

app.get("/update_password", (req, res) => {
  const { store_password, store_email, user_type } = require("./app");
  const userType = user_type; // e.g. "student", "tutor", or "admin"
  res.render("update_password", {
    userTypeIsStudent: userType === "student",
    userTypeIsTutor: userType === "tutor",
    userTypeIsAdmin: userType === "admin",
  });
});

app.post("/update_password", async (request, resolve) => {
  try {
    const { old_pass, new_pass, confirm_pass } = request.body;
    console.log(old_pass, new_pass, confirm_pass);
    const { store_password, store_email, user_type } = require("./app");
    console.log(store_email);
    console.log(store_password);
    if (store_password !== old_pass) {
      const message = "the old password you typed in is incorrect";
      const script = `<script>alert('${message}'); window.location.href = '/update_password';</script>`;
      resolve.send(script);
    } else {
      if (new_pass !== confirm_pass) {
        const message = "your new password and confirm password are different";
        const script = `<script>alert('${message}'); window.location.href = '/update_password';</script>`;
        resolve.send(script);
      } else {
        if (user_type === "student") {
          const updatedStudent = await student_db.findOneAndUpdate(
            { email: store_email },
            // { password: new_pass },
            { password: encrypt(new_pass, cipher_key) },
            { new: true } // Return the updated document
          );
        } else if (user_type === "tutor") {
          const updatedTutor = await tutor_db.findOneAndUpdate(
            { email: store_email },
            // { password: new_pass },
            { password: encrypt(new_pass, cipher_key) },
            { new: true } // Return the updated document
          );
        } else if (user_type === "admin") {
          const updatedAdmin = await admin_db.findOneAndUpdate(
            { email: store_email },
            { password: new_pass },
            { new: true } // Return the updated document
          );
        }
        const message =
          "password successfully updated, please login again with your new password";
        const script = `<script>alert('${message}'); window.location.href = '/login';</script>`;
        resolve.send(script);
      }
    }
  } catch (error) {
    // Handle any errors
    resolve.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`server is running at ${port}`);
});
