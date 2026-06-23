import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "expensedb",
  password: "12345",
  port: 5432
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", async (req, res) => {

  const search = req.query.search || "";

  const result = await db.query(
    "SELECT * FROM expenses WHERE category ILIKE $1 ORDER BY id",
    [`%${search}%`]
  );

  const total = await db.query(
    "SELECT SUM(amount) FROM expenses"
  );

  res.render("home", {
    expenses: result.rows,
    search,
    total: total.rows[0].sum || 0
  });

});

app.get("/add", (req, res) => {
  res.render("add");
});

app.post("/add", async (req, res) => {

  await db.query(
    "INSERT INTO expenses(title,amount,category) VALUES($1,$2,$3)",
    [
      req.body.title,
      req.body.amount,
      req.body.category
    ]
  );

  res.redirect("/");

});

app.get("/edit/:id", async (req, res) => {

  const result = await db.query(
    "SELECT * FROM expenses WHERE id=$1",
    [req.params.id]
  );

  res.render("edit", {
    expense: result.rows[0]
  });

});

app.post("/edit/:id", async (req, res) => {

  await db.query(
    "UPDATE expenses SET title=$1, amount=$2, category=$3 WHERE id=$4",
    [
      req.body.title,
      req.body.amount,
      req.body.category,
      req.params.id
    ]
  );

  res.redirect("/");

});

app.get("/delete/:id", async (req, res) => {

  await db.query(
    "DELETE FROM expenses WHERE id=$1",
    [req.params.id]
  );

  res.redirect("/");

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});