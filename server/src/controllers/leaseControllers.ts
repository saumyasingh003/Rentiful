import { prisma } from "../lib/prisma.js";
import type { Request, Response } from "express";

export const getLeases = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tenantCognitoId } = req.query;

    const whereClause = tenantCognitoId
      ? { tenantCognitoId: String(tenantCognitoId) }
      : {};

    const leases = await prisma.lease.findMany({
      where: whereClause,
      include: {
        tenant: true,
        property: true,
      },
    });
    res.json(leases);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving leases: ${error.message}` });
  }
};

export const getLeasePayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const payments = await prisma.payment.findMany({
      where: { leaseId: Number(id) },
    });
    res.json(payments);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving lease payments: ${error.message}` });
  }
};
