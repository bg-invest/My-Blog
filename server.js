import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3000;

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("."));

let posts = [
     // { id: 1, title: "Buy milk",content: "Remember to buy milk from the store." },
  // { id: 2, title: "Finish homework", content: "Complete math and science assignments." },
];


app.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM blog ORDER BY id ASC");
  posts = result.rows;
  res.render("index.ejs", {
    posts: posts
  });
});

app.post("/posts", async (req, res) => {
  const title = req.body.title;
  const post = req.body.post;
  await db.query("INSERT INTO blog (title, post) VALUES ($1, $2)", [title, post]);
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const deleteItemId = req.body.deleteItemId;
  await db.query("DELETE FROM blog WHERE id = $1", [deleteItemId]);
  res.redirect("/");
});

//to get the edit page for a specific post
app.get("/edit/:id", async (req, res) => {
    const id = req.params.id;

    const result = await db.query(
        "SELECT * FROM blog WHERE id = $1",
        [id]
    );

    res.render("edit.ejs", {
        post: result.rows[0]
    });
});

app.post("/edit", async (req, res) => {
    const id = req.body.id;
    const title = req.body.editedtitle;
    const post = req.body.editedpost;
     console.log(title, post, id);  

    await db.query("UPDATE blog SET title = $1, post = $2 WHERE id = $3", [title, post, id]);
    res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
