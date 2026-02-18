import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AppError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';
import { DealStage, DealStatus, DealType, ActivityType } from '@prisma/client';

const dealSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  stage: z.nativeEnum(DealStage).optional(),
  status: z.nativeEnum(DealStatus).optional(),
  dealType: z.nativeEnum(DealType).optional(),
  companyId: z.string(),
  valuation: z.number().optional(),
  dealAmount: z.number().optional(),
  closeDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  probability: z.number().int().min(0).max(100).optional(),
});

export const getAllDeals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deals = await prisma.deal.findMany({
      include: {
        company: {
          select: { id: true, name: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: {
          select: { documents: true, checklists: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      status: 'success',
      data: { deals },
    });
  } catch (error) {
    next(error);
  }
};

export const getDealById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;

    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        company: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        checklists: {
          include: {
            items: {
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!deal) {
      throw new AppError('Deal not found', 404);
    }

    res.json({
      status: 'success',
      data: { deal },
    });
  } catch (error) {
    next(error);
  }
};

export const createDeal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const data = dealSchema.parse(req.body);

    const deal = await prisma.deal.create({
      data: {
        ...data,
        userId: req.user.userId,
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: ActivityType.NOTE,
        description: `Deal "${deal.name}" created`,
        userId: req.user.userId,
        dealId: deal.id,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { deal },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const updateDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const data = dealSchema.partial().parse(req.body);

    const deal = await prisma.deal.update({
      where: { id },
      data,
      include: {
        company: {
          select: { id: true, name: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    res.json({
      status: 'success',
      data: { deal },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const updateDealStage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const id = req.params.id as string;
    const { stage } = z
      .object({ stage: z.nativeEnum(DealStage) })
      .parse(req.body);

    const deal = await prisma.deal.update({
      where: { id },
      data: { stage },
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: ActivityType.STAGE_CHANGE,
        description: `Deal moved to ${stage}`,
        userId: req.user.userId,
        dealId: deal.id,
      },
    });

    res.json({
      status: 'success',
      data: { deal },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const deleteDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;

    await prisma.deal.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getDealStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dealsByStage = await prisma.deal.groupBy({
      by: ['stage'],
      _count: true,
    });

    const dealsByStatus = await prisma.deal.groupBy({
      by: ['status'],
      _count: true,
    });

    const totalDealValue = await prisma.deal.aggregate({
      _sum: {
        dealAmount: true,
      },
      where: {
        status: DealStatus.ACTIVE,
      },
    });

    res.json({
      status: 'success',
      data: {
        dealsByStage,
        dealsByStatus,
        totalDealValue: totalDealValue._sum.dealAmount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
