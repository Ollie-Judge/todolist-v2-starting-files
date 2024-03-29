const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

require("dotenv").config();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//mongoose.connect("mongodb://localhost:27017/todolistDB")
const connectDB = require("./connectMongo");

connectDB()
  .then(() => {
    let port = process.env.PORT;
    if (port == null || port == "") {
      port = 3000;
    }

    app.listen(port, async () => {
      console.log(`Server started successfully on ${port}`);
    });
  })
  .catch((err) => console.log("ERROR :", err));

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({ name: "Welcome to your todo list" });

const item2 = new Item({ name: "Hit the + button to add a new item" });

const item3 = new Item({ name: "<-- hit this to delete an item" });

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

const day = date.getDate();

app.get("/", async (req, res) => {
  Item.find({}).then((foundItem) => {
    if (foundItem.length === 0) {
      try {
        Item.insertMany(defaultItems);
        console.log("Item successfully saved to the database");
      } catch (err) {
        console.log("ERROR :", err);
      }
      res.redirect("/");
    } else {
      res.render("list.ejs", { listTitle: day, newListItems: foundItem });
    }
  });
});

app.get("/:customListName", async (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list.ejs", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch((err) => console.log("ERROR :", err));
});

app.post("/", async (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then((foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch((err) => console.log("ERROR :", err));
  }
});

app.post("/delete", async (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === day) {
    Item.findByIdAndDelete(checkedItemId)
      .then(console.log("Item successfully deleted"))
      .catch((err) => console.log("ERROR :", err));
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    )
      .then(res.redirect("/" + listName))
      .catch((err) => console.log("ERROR :", err));
  }
});

app.get("/work", async (req, res) => {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", async (req, res) => {
  res.render("about");
});
