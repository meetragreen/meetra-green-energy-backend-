import express from "express";
import ProjectData from "../models/ProjectData.js";

const router = express.Router();

/* CREATE PROJECT */
router.post("/staff/create-project", async (req, res) => {
  const { clientRef, clientName, siteLocation, systemSize } = req.body;

  const project = new ProjectData({
    clientRef,
    clientName,
    siteLocation,
    systemSize
  });

  await project.save();
  res.json(project);
});

/* UPDATE PROJECT STATUS */
router.patch("/staff/update-progress/:projectId", async (req, res) => {
  const { stage, value } = req.body;

  const updated = await ProjectData.findByIdAndUpdate(
    req.params.projectId,
    { [`progressFlow.${stage}`]: value },
    { new: true }
  );

  res.json(updated);
});

/* FETCH PROJECT FOR CUSTOMER */
router.get("/client/project/:clientId", async (req, res) => {
  const project = await ProjectData.findOne({
    clientRef: req.params.clientId
  });
  res.json(project);
});

export default router;
