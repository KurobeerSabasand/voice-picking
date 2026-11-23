import express from "express";
import cors from "cors";
import { getPicks, savePicks } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/api/picks/next", (req, res) => {
  const picks = getPicks();
  const nextPick = picks.find((p) => p.status === "waiting");
  res.json(nextPick || null);
});

app.post("/api/picks/:id/complete", (req, res) => {
  const id = Number(req.params.id);
  const picks = getPicks();
  const target = picks.find((p) => p.id === id);
  if (!target) {
    return res.status(404).json({
      message: "not found",
    });
  }
  target.status = "completed";
  savePicks(picks);
  res.json({
    success: true,
  });
});

app.post("/api/check-location", (req, res) => {
  const { id, checkDigit } = req.body;
  const picks = getPicks();
  const pick = picks.find((p) => p.id === id);
  if (!pick) {
    return res.status(404).json({
      success: false,
    });
  }
  const valid = pick.checkDigit === checkDigit;
  res.json({
    success: valid,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});