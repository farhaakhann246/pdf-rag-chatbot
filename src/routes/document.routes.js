import { Router } from "express";

import {
  uploadDocument,
  listDocuments
} from "../controllers/document.controller.js";

import {
  uploadPdf
} from "../middleware/upload.middleware.js";

const router = Router();

router.get(
  "/",
  listDocuments
);

router.post(
  "/",
  uploadPdf,
  uploadDocument
);

export default router;