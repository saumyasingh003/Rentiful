import { wktToGeoJSON } from "@terraformer/wkt";
import { prisma } from "../lib/prisma.js";
/* ================= Get Tenant ================= */
export const getTenant = async (req, res) => {
    try {
        const { cognitoId } = req.params;
        // ✅ Guard: missing param
        if (!cognitoId) {
            res.status(400).json({ message: "cognitoId is required" });
            return;
        }
        const tenant = await prisma.tenant.findUnique({
            where: { cognitoId },
            include: {
                favorites: true,
            },
        });
        if (!tenant) {
            res.status(404).json({ message: "Tenant not found" });
            return;
        }
        res.json(tenant);
        return;
    }
    catch (error) {
        res.status(500).json({
            message: `Error retrieving tenant: ${error?.message || "Server error"}`,
        });
        return;
    }
};
export const createTenant = async (req, res) => {
    try {
        const { cognitoId, name, email, phoneNumber } = req.body;
        const tenant = await prisma.tenant.create({
            data: {
                cognitoId,
                name,
                email,
                phoneNumber,
            },
        });
        res.status(201).json(tenant);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error creating tenant: ${error.message}` });
    }
};
export const updateTenant = async (req, res) => {
    try {
        const { cognitoId } = req.params;
        const { name, email, phoneNumber } = req.body;
        const updateTenant = await prisma.tenant.update({
            where: { cognitoId },
            data: {
                name,
                email,
                phoneNumber,
            },
        });
        res.json(updateTenant);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error updating tenant: ${error.message}` });
    }
};
export const getCurrentResidences = async (req, res) => {
    try {
        const { cognitoId } = req.params;
        const properties = await prisma.property.findMany({
            where: { tenants: { some: { cognitoId } } },
            include: {
                location: true,
            },
        });
        const residencesWithFormattedLocation = await Promise.all(properties.map(async (property) => {
            const coordinates = await prisma.$queryRaw `SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;
            const geoJSON = wktToGeoJSON(coordinates[0]?.coordinates || "");
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
        }));
        res.json(residencesWithFormattedLocation);
    }
    catch (err) {
        res
            .status(500)
            .json({ message: `Error retrieving manager properties: ${err.message}` });
    }
};
export const addFavoriteProperty = async (req, res) => {
    try {
        const { cognitoId, propertyId } = req.params;
        const tenant = await prisma.tenant.findUnique({
            where: { cognitoId },
            include: { favorites: true },
        });
        if (!tenant) {
            res.status(404).json({ message: "Tenant not found" });
            return;
        }
        const propertyIdNumber = Number(propertyId);
        const existingFavorites = tenant.favorites || [];
        if (!existingFavorites.some((fav) => fav.id === propertyIdNumber)) {
            const updatedTenant = await prisma.tenant.update({
                where: { cognitoId },
                data: {
                    favorites: {
                        connect: { id: propertyIdNumber },
                    },
                },
                include: { favorites: true },
            });
            res.json(updatedTenant);
        }
        else {
            res.status(409).json({ message: "Property already added as favorite" });
        }
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error adding favorite property: ${error.message}` });
    }
};
export const removeFavoriteProperty = async (req, res) => {
    try {
        const { cognitoId, propertyId } = req.params;
        const propertyIdNumber = Number(propertyId);
        const updatedTenant = await prisma.tenant.update({
            where: { cognitoId },
            data: {
                favorites: {
                    disconnect: { id: propertyIdNumber },
                },
            },
            include: { favorites: true },
        });
        res.json(updatedTenant);
    }
    catch (err) {
        res
            .status(500)
            .json({ message: `Error removing favorite property: ${err.message}` });
    }
};
//# sourceMappingURL=tenantControllers.js.map