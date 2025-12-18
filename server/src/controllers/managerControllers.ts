
import { wktToGeoJSON } from "@terraformer/wkt";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";


/* ================= Get Manager ================= */
export const getManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;

    if (!cognitoId) {
      res.status(400).json({ message: "cognitoId is required" });
      return;
    }

    const manager = await prisma.manager.findUnique({
      where: { cognitoId },
    });

    if (!manager) {
      res.status(404).json({ message: "Manager not found" });
      return;
    }

    res.json(manager);
    return;
  } catch (error: any) {
    res.status(500).json({
      message: `Error retrieving manager: ${error?.message || "Server error"}`,
    });
    return;
  }
};

/* ================= Create Manager ================= */
export const createManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;

    const manager = await prisma.manager.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });

    res.status(201).json(manager);
    return;
  } catch (error: any) {
    res.status(500).json({
      message: `Error creating manager: ${error?.message || "Server error"}`,
    });
    return;
  }
};

/* ================= Update Manager ================= */
export const updateManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const { name, email, phoneNumber } = req.body;

    if (!cognitoId) {
      res.status(400).json({ message: "cognitoId is required" });
      return;
    }

    const updatedManager = await prisma.manager.update({
      where: { cognitoId },
      data: {
        name,
        email,
        phoneNumber,
      },
    });

    res.json(updatedManager);
    return;
  } catch (error: any) {
    res.status(500).json({
      message: `Error updating manager: ${error?.message || "Server error"}`,
    });
    return;
  }
};

/* ================= Get Manager Properties ================= */
export const getManagerProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;

    if (!cognitoId) {
      res.status(400).json({ message: "cognitoId is required" });
      return;
    }

    const properties = await prisma.property.findMany({
      where: { managerCognitoId: cognitoId },
      include: {
        location: true,
      },
    });

    const propertiesWithFormattedLocation = await Promise.all(
      properties.map(async (property: any) => {
        if (!property.location) return property;

        const coordinates: { coordinates: string }[] =
          await prisma.$queryRaw`
            SELECT ST_asText(coordinates) as coordinates
            FROM "Location"
            WHERE id = ${property.location.id}
          `;

        const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
        const longitude = geoJSON.coordinates[0];
        const latitude = geoJSON.coordinates[1];

        return {
          ...property,
          location: {
            ...property.location,
            coordinates: {
              longitude,
              latitude,
            },
          },
        };
      })
    );

    res.json(propertiesWithFormattedLocation);
    return;
  } catch (err: any) {
    res.status(500).json({
      message: `Error retrieving manager properties: ${
        err?.message || "Server error"
      }`,
    });
    return;
  }
};
