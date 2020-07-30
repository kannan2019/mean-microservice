const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());
const posts = {};

const handleEvents = (type, data) => {
  switch (type) {
    case "PostCreated": {
      const { id, title } = data;
      posts[id] = { id, title, comments: [] };
      break;
    }
    case "CommentCreated": {
      const { id, content, postId, status } = data;

      const post = posts[postId];
      post.comments.push({ id, content, status });
      break;
    }
    case "CommentUpdated": {
      const { id, postId, status, content } = data;
      console.log("postId", postId);
      const post = posts[postId];
      const comment = post.comments.find((x) => x.id === id);
      comment.status = status;
      comment.content = content;
      break;
    }
  }
};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;
  handleEvents(type, data);
  res.send({});
});

app.listen(4002, async () => {
  console.log("Listening on PORT 4002");
  const res = await axios.get("http://localhost:4005/events");
  for (let event of res.data) {
    console.log("Processing Event ", event.type);
    handleEvents(event.type, event.data);
  }
});
