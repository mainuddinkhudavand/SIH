import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ response: "No message received." });
  }
  res.json({ response: `Bot reply: You said "${message}"` });
});

export default router;