import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import prisma from '../config/database';
import { AppError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';
import { ActivityType } from '@prisma/client';

export const getDealDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dealId = req.params.dealId as string;

    const documents = await prisma.document.findMany({
      where: { dealId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      status: 'success',
      data: { documents },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const dealId = req.params.dealId as string;
    const { folder, tags } = req.body;

    // Verify deal exists
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
    });

    if (!deal) {
      throw new AppError('Deal not found', 404);
    }

    const document = await prisma.document.create({
      data: {
        name: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        path: req.file.path,
        folder: folder || null,
        tags: tags ? JSON.parse(tags) : [],
        dealId,
        userId: req.user.userId,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: ActivityType.DOCUMENT_UPLOAD,
        description: `Document "${document.originalName}" uploaded`,
        userId: req.user.userId,
        dealId,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { document },
    });
  } catch (error) {
    next(error);
  }
};

export const getDocumentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
        deal: {
          select: { id: true, name: true },
        },
      },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    res.json({
      status: 'success',
      data: { document },
    });
  } catch (error) {
    next(error);
  }
};

export const downloadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (!fs.existsSync(document.path)) {
      throw new AppError('File not found on server', 404);
    }

    res.download(document.path, document.originalName);
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Delete file from filesystem
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    // Delete from database
    await prisma.document.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
