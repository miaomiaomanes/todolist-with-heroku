//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { redirect } = require("express/lib/response");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

mongoose.connect(
  "mongodb+srv://miaomiao:valentin520%40@todolist.c3zwr.mongodb.net/"
);

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const Item1 = new Item({
  name: "welcome to your todolist",
});
const Item2 = new Item({
  name: "hit this button to add a new item",
});
const Item3 = new Item({
  name: "hit this button to delete an item",
});

const defaultItems = [Item1, Item2, Item3];

const listSchema = {
  name: String,
  items: [itemsSchema], // what's itemschema here ?
};
console.log(itemsSchema);

const List = mongoose.model("List", listSchema);

// Item.deleteMany({}, (err) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("sucessfully deleted items to database");
//   }
// });

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("sucessfully save defaulted items to database");
        }
      });
      // res.render("list", { newListItems: defaultItems });

      res.redirect("/");
    } else {
      res.render("list", { listTitle: "today", newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "today") {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (!err) {
        console.log("successfully deleted");
        res.redirect("/");
      } else {
        console.log(err);
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
//   console.log(newlistItems);
// });

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  console.log(customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server started on port:", port);
});
