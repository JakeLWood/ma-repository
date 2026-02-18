import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AppError } from '../utils/errors';

const checklistSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
});

const checklistItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  checklistId: z.string(),
});

export const getDealChecklists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { dealId } = req.params;

    const checklists = await prisma.checklist.findMany({
      where: { dealId },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      status: 'success',
      data: { checklists },
    });
  } catch (error) {
    next(error);
  }
};

export const getChecklistById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const checklist = await prisma.checklist.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
        deal: {
          select: { id: true, name: true },
        },
      },
    });

    if (!checklist) {
      throw new AppError('Checklist not found', 404);
    }

    res.json({
      status: 'success',
      data: { checklist },
    });
  } catch (error) {
    next(error);
  }
};

export const createChecklist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { dealId } = req.params;
    const data = checklistSchema.parse(req.body);

    // Verify deal exists
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
    });

    if (!deal) {
      throw new AppError('Deal not found', 404);
    }

    const checklist = await prisma.checklist.create({
      data: {
        ...data,
        dealId,
      },
      include: {
        items: true,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { checklist },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const updateChecklist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = checklistSchema.partial().parse(req.body);

    const checklist = await prisma.checklist.update({
      where: { id },
      data,
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    res.json({
      status: 'success',
      data: { checklist },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const deleteChecklist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.checklist.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const createChecklistItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = checklistItemSchema.parse(req.body);

    const item = await prisma.checklistItem.create({
      data,
    });

    res.status(201).json({
      status: 'success',
      data: { item },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const updateChecklistItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = checklistItemSchema.partial().parse(req.body);

    const item = await prisma.checklistItem.update({
      where: { id },
      data,
    });

    res.json({
      status: 'success',
      data: { item },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const deleteChecklistItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.checklistItem.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
