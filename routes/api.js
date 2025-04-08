"use strict";

const BoardModel = require("../models/board-model").BoardModel;
const ReplyModel = require("../models/reply-model").ReplyModel;
const ThreadModel = require("../models/thread-model").ThreadModel;

module.exports = function (app) {
  app
    // threads
    .route("/api/threads/:board")
    // create
    .post((req, res) => {
      const { board, text, delete_password } = req.body;

      if (!board) {
        board = req.params.board;
      }

      console.log("Incoming request ->", req.body);

      const Thread = new ThreadModel({
        text: text,
        delete_password: delete_password,
        replies: [],
      });

      console.log("New Thread Created ->", Thread);

      BoardModel.findOne({ name: board }, (err, boardData) => {
        if (!boardData) {
          console.log("Board does not exist\nCreating a new one");

          const Board = new BoardModel({
            name: board,
            threads: [],
          });

          console.log("New Board Created ->", Board);

          Board.threads.push(Thread);

          Board.save((err, data) => {
            console.log("Saving data ->", data);

            if (err || !data) {
              console.err(err);

              res.send("Error -> Failed saving to Board");
            } else {
              res.json(Thread);
            }
          });
        } else {
          boardData.threads.push(Thread);

          boardData.save((err, data) => {
            if (err || !data) {
              console.err(err);

              res.send("Error -> Failed saving to Board");
            } else {
              res.json(Thread);
            }
          });
        }
      });
    })
    // read
    .get((req, res) => {
      const board = req.params.board;

      BoardModel.findOne({ name: board }, (err, data) => {
        if (!data) {
          console.log("Error -> Board does not exist");

          res.json({ error: "No board with this name" });
        } else {
          console.log("Board\n-----\n", data);

          const threads = data.threads.map((thread) => {
            const {
              _id,
              text,
              created_on,
              bumped_on,
              reported,
              delete_password,
              replies,
            } = thread;
            return {
              _id,
              text,
              created_on,
              bumped_on,
              reported,
              delete_password,
              replies,
              replycount: thread.replies.length,
            };
          });
          res.json(threads);
        }
      });
    })
    // update
    .put((req, res) => {
      const { report_id } = req.body;
      const board = req.params.board;

      console.log("Incoming request ->", req.body);

      BoardModel.findOne({ name: board }, (err, boardData) => {
        if (!boardData) {
          res.json("error", "Board not found");
        } else {
          const date = new Date();

          let reportedThread = boardData.threads.id(report_id);
          reportedThread.reported = true;
          reportedThread.bumped_on = date;
          boardData.save((err, updatedData) => {
            res.send("Success");
          });
        }
      });
    })
    // delete
    .delete((req, res) => {
      const { thread_id, delete_password } = req.body;
      const board = req.params.board;

      console.log("Icoming request ->", req.body);

      BoardModel.findOne({ name: board }, (err, boardData) => {
        if (!boardData) {
          res.json("error", "Board not found");
        } else {
          let threadToDelete = boardData.threads.id(thread_id);

          if (threadToDelete.delete_password != delete_password) {
            res.send("Incorrect Password");
            return;
          }

          threadToDelete.remove();

          boardData.save((err, updatedData) => {
            res.send("Success");
          });
        }
      });
    });

  // replies
  app
    .route("/api/replies/:board")
    // create
    .post((req, res) => {
      const { thread_id, text, delete_password } = req.body;
      const board = req.params.board;

      const Reply = new ReplyModel({
        text: text,
        delete_password: delete_password,
      });

      console.log("Incoming request ->", req.body);

      console.log("Created new Reply ->", Reply);

      BoardModel.findOne({ name: board }, (err, boardData) => {
        if (!boardData) {
          res.json("error", "Board not found");
        } else {
          const date = new Date();

          let threadToAddReply = boardData.threads.id(thread_id);
          threadToAddReply.bumped_on = date;
          threadToAddReply.replies.push(Reply);

          boardData.save((err, updatedData) => {
            res.json(updatedData);
          });
        }
      });
    })
    // read
    .get((req, res) => {
      const board = req.params.board;
      BoardModel.findOne({ name: board }, (err, data) => {
        if (!data) {
          console.log("Error -> Board does not exist");

          res.json({ error: "No board with this name" });
        } else {
          console.log("Board\n-----\n", data);

          const thread = data.threads.id(req.query.thread_id);
          res.json(thread);
        }
      });
    })
    // update
    .put((req, res) => {
      const { thread_id, reply_id } = req.body;
      const board = req.params.board;

      BoardModel.findOne({ name: board }, (err, data) => {
        if (!data) {
          console.log("Board does not exist\nCreating a new one");

          res.json({ error: "No board with this name" });
        } else {
          console.log("Board\n-----\n", data);

          let thread = data.threads.id(thread_id);
          let reply = thread.replies.id(reply_id);
          reply.reported = true;
          reply.bumped_on = new Date();

          data.save((err, updatedData) => {
            if (!err) {
              res.send("Success");
            }
          });
        }
      });
    })
    // delete
    .delete((req, res) => {
      const { thread_id, reply_id, delete_password } = req.body;
      const board = req.params.board;

      console.log("Incoming request ->", req.body);

      BoardModel.findOne({ name: board }, (err, data) => {
        if (!data) {
          console.log("Board does not exist\nCreating a new one");

          res.json({ error: "No board with this name" });
        } else {
          console.log("Board\n-----\n", data);

          let thread = data.threads.id(thread_id);
          let reply = thread.replies.id(reply_id);

          if (reply.delete_password === delete_password) {
            reply.remove();
          } else {
            res.send("Incorrect Password");
            return;
          }
          data.save((err, updatedData) => {
            if (!err) {
              res.send("Success");
            }
          });
        }
      });
    });
};
