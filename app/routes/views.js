var Task = require("../models/task");

module.exports = function(app) {
  //
  // HOME PAGE (with login links)
  //
  app.get("/", function(req, res) {
    if (req.user) {
      res.redirect("/profile");
    } else {
      res.render("index.ejs"); // load the index.ejs file
    }
  });

  //
  // LOGIN
  //
  // show the login form
  app.get("/login", function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render("login.ejs", { message: req.flash("loginMessage") });
  });

  //
  // SIGNUP
  //
  // show the signup form
  app.get("/signup", function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render("signup.ejs", { message: req.flash("signupMessage") });
  });

  //
  // PROFILE SECTION
  //
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  app.get("/profile", isLoggedIn, function(req, res) {
    res.render("profile.ejs", {
      user: req.user // get the user out of session and pass to template
    });
  });

  // View Tasks
  app.get("/tasks", isLoggedIn, function(req, res) {
    console.log("user-email:", req.user.email);

    // var tasks = ;
    // console.log(tasks);
    res.render("tasks.ejs", {
      user: req.user,
      tasks: Task.find({
        email: req.user.email
      }).then(function (tasks) {
        res
          .json(tasks)
          .then(task => console.log("task", task))
          .catch(function (err) {
            res.status(404).json({ notasksfound: "No tasks found with that ID" });
          });
      })
    });
  });

  // Add Tasks
  app.post("/add-task", isLoggedIn, function(req, res) {
    console.log(req.body.header, req.body.body);
    var newTask = new Task();
    newTask.email = req.user.email;
    newTask.task = req.body.header;
    newTask.taskBody = req.body.body;
    newTask.save();
    res.redirect("/tasks");
  });

  //
  // LOGOUT
  //
  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/login");
  });

  app.get("*", function(req, res) {
    res.render("404.ejs");
  });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) return next();

  // if they aren't redirect them to the home page
  res.redirect("/");
}
