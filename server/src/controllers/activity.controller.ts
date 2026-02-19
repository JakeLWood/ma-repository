import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AppError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';
import { ActivityType } from '@prisma/client';

const activitySchema = z.object({
  type: z.nativeEnum(ActivityType),
  description: z.string().min(1),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
});

export const getAllActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
        contact: {
          select: { id: true, firstName: true, lastName: true },
        },
        deal: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({
      status: 'success',
      data: { activities },
    });
  } catch (error) {
    next(error);
  }
};

export const createActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const data = activitySchema.parse(req.body);

    const activity = await prisma.activity.create({
      data: {
        ...data,
        userId: req.user.userId,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
        contact: {
          select: { id: true, firstName: true, lastName: true },
        },
        deal: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      data: { activity },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const getDealActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dealId = req.params.dealId as string;

    const activities = await prisma.activity.findMany({
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
      data: { activities },
    });
  } catch (error) {
    next(error);
  }
};

export const getContactActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contactId = req.params.contactId as string;

    const activities = await prisma.activity.findMany({
      where: { contactId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      status: 'success',
      data: { activities },
    });
  } catch (error) {
    next(error);
  }
};
