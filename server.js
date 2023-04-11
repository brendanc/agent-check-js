const express = require("express");
const exphbs = require("express-handlebars");
const request = require("request");
const db = require("./sqlite.js");
const app = express();

app.use(express.static("public"));
app.engine(
  "hbs",
  exphbs.engine({
    defaultLayout: "main",
    extname: ".hbs",
  })
);

app.set("view engine", "hbs");

app.get("/", async (req, res) => {
  let hits = await db.getHits();
  res.render("index", { hits: hits });
});

app.get("/hit", async function (req, res) {
  let hit = await db.addHit(req.get("user-agent"), req.get("referrer"), req.originalUrl);

  const url =
    "https://cdn.glitch.global/6ea99393-cb44-4ca6-9786-55e85dfbefa7/mail-icon.png?v=1674005388524";
  res.setHeader("Content-Type", "image/png");
  request.get(url).pipe(res);
});

app.get("/clear", async function (req, res) {
  let result = await db.deleteAllHits();
  res.redirect("/");
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
