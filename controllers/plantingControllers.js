import { prisma } from '../lib/prisma.js';

export const createPlanting = async (req, res) => {
  try {
    const {
      plantName,
      plantTypeId,
      datePlanted,
      expectedHarvest,
      domeDate,
      lightDate,
      quantity,
      yield: plantYield,
      notes,
      status,
      trayNumber,
      // New growing condition fields
      substrate,
      irrigationMl,
      soakingHours
    } = req.body;
    
    // Obtener userId del token o usar usuario demo hardcodeado para desarrollo
    let userId = req.user?.userId;
    
    if (!userId) {
      // Para desarrollo: usar usuario demo específico
      // Debe existir en la base de datos (crear con seed_demo_user.sql)
      userId = 'demo-user-12345678901234567890';
    }

    // Initialize expected harvest calculation
    let calculatedExpectedHarvest = expectedHarvest;

    // Validate plantType if provided
    if (plantTypeId) {
      const plantType = await prisma.plantType.findUnique({
        where: { id: plantTypeId }
      });

      if (!plantType || plantType.deletedAt) {
        return res.status(400).json({ error: 'Tipo de planta no válido' });
      }

      // Auto-calculate expectedHarvest if not provided
      if (!calculatedExpectedHarvest && plantType.daysToHarvest) {
        try {
          const plantedDate = new Date(datePlanted);
          const expectedDate = new Date(plantedDate);
          expectedDate.setDate(plantedDate.getDate() + plantType.daysToHarvest);
          calculatedExpectedHarvest = expectedDate.toISOString().split('T')[0]; // Solo fecha, no hora
        } catch (error) {
          console.error('Error calculating expectedHarvest:', error);
          // Continue without auto-calculation
        }
      }
    }
    
    const plantingData = {
      plantName: plantName || null, // Legacy field
      plantTypeId: plantTypeId || null,
      datePlanted: new Date(datePlanted),
      expectedHarvest: calculatedExpectedHarvest ? new Date(calculatedExpectedHarvest) : null,
      domeDate: domeDate ? new Date(domeDate) : null,
      lightDate: lightDate ? new Date(lightDate) : null,
      quantity: quantity ? parseInt(quantity) : null,
      yield: plantYield ? parseFloat(plantYield) : null, // Legacy field
      notes: notes || null,
      status: status || 'PLANTED',
      trayNumber: trayNumber || null,
      // New growing condition fields
      substrate: substrate || null,
      irrigationMl: irrigationMl ? parseInt(irrigationMl) : null,
      soakingHours: soakingHours ? parseInt(soakingHours) : null,
    };

    // userId siempre existe ahora (autenticado o usuario por defecto)
    plantingData.userId = userId;
    
    const newPlanting = await prisma.planting.create({
      data: plantingData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        plantType: {
          select: {
            id: true,
            name: true,
            daysToHarvest: true,
            averageYield: true
          }
        },
        harvests: {
          where: { deletedAt: null },
          orderBy: { harvestDate: 'desc' }
        }
      }
    });
    
    res.status(201).json(newPlanting);
  } catch (error) {
    console.error('Error creating planting:', error);
    res.status(500).json({ 
      error: 'Error al crear el registro de siembra',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getPlantings = async (req, res) => {
  try {
    const { page = 1, limit = 10, plantName, status, plantTypeId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      deletedAt: null,
      ...(plantName && {
        OR: [
          { plantName: { contains: plantName, mode: 'insensitive' } },
          { plantType: { name: { contains: plantName, mode: 'insensitive' } } }
        ]
      }),
      ...(status && { status }),
      ...(plantTypeId && { plantTypeId })
    };
    
    const [plantings, total] = await Promise.all([
      prisma.planting.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          plantType: {
            select: {
              id: true,
              name: true,
              category: true,
              daysToHarvest: true,
              averageYield: true
            }
          },
          harvests: {
            where: { deletedAt: null },
            select: {
              id: true,
              harvestDate: true,
              weight: true,
              quality: true
            },
            orderBy: { harvestDate: 'desc' }
          },
          _count: {
            select: { harvests: true }
          }
        }
      }),
      prisma.planting.count({ where })
    ]);
    
    res.status(200).json({
      data: plantings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching plantings:', error);
    res.status(500).json({ 
      error: 'Error al obtener los registros de siembra',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getPlantingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const planting = await prisma.planting.findFirst({
      where: { 
        id,
        deletedAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        plantType: {
          select: {
            id: true,
            name: true,
            scientificName: true,
            category: true,
            description: true,
            daysToGerminate: true,
            daysToHarvest: true,
            optimalTemp: true,
            optimalHumidity: true,
            lightRequirement: true,
            averageYield: true,
            marketPrice: true,
            difficulty: true
          }
        },
        harvests: {
          where: { deletedAt: null },
          orderBy: { harvestDate: 'desc' }
        }
      }
    });
    
    if (!planting) {
      return res.status(404).json({ error: 'Registro de siembra no encontrado' });
    }
    
    res.status(200).json(planting);
  } catch (error) {
    console.error('Error fetching planting:', error);
    res.status(500).json({ 
      error: 'Error al obtener el registro de siembra',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updatePlanting = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      plantName,
      plantTypeId,
      datePlanted,
      expectedHarvest,
      domeDate,
      lightDate,
      quantity,
      yield: plantYield,
      notes,
      status,
      trayNumber,
      // New growing condition fields
      substrate,
      irrigationMl,
      soakingHours
    } = req.body;
    
    // Verificar si existe
    const existingPlanting = await prisma.planting.findFirst({
      where: { 
        id,
        deletedAt: null
      }
    });
    
    if (!existingPlanting) {
      return res.status(404).json({ error: 'Registro de siembra no encontrado' });
    }
    
    // Validate plantType if provided
    if (plantTypeId) {
      const plantType = await prisma.plantType.findFirst({
        where: { id: plantTypeId, deletedAt: null }
      });
      
      if (!plantType) {
        return res.status(400).json({ error: 'Tipo de planta no válido' });
      }
    }
    
    const updatedPlanting = await prisma.planting.update({
      where: { id },
      data: {
        plantName: plantName !== undefined ? plantName : undefined,
        plantTypeId: plantTypeId !== undefined ? plantTypeId : undefined,
        datePlanted: datePlanted ? new Date(datePlanted) : undefined,
        expectedHarvest: expectedHarvest ? new Date(expectedHarvest) : undefined,
        domeDate: domeDate ? new Date(domeDate) : undefined,
        lightDate: lightDate ? new Date(lightDate) : undefined,
        quantity: quantity !== undefined ? parseInt(quantity) : undefined,
        yield: plantYield !== undefined ? parseFloat(plantYield) : undefined,
        notes: notes !== undefined ? notes : undefined,
        status: status !== undefined ? status : undefined,
        trayNumber: trayNumber !== undefined ? trayNumber : undefined,
        // New growing condition fields
        substrate: substrate !== undefined ? substrate : undefined,
        irrigationMl: irrigationMl !== undefined ? parseInt(irrigationMl) : undefined,
        soakingHours: soakingHours !== undefined ? parseInt(soakingHours) : undefined,
      },
      include: {
        plantType: {
          select: {
            id: true,
            name: true,
            daysToHarvest: true,
            averageYield: true
          }
        },
        harvests: {
          where: { deletedAt: null },
          orderBy: { harvestDate: 'desc' }
        }
      }
    });
    
    res.status(200).json(updatedPlanting);
  } catch (error) {
    console.error('Error updating planting:', error);
    res.status(500).json({ 
      error: 'Error al actualizar el registro de siembra',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deletePlanting = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si existe
    const existingPlanting = await prisma.planting.findFirst({
      where: { 
        id,
        deletedAt: null
      }
    });
    
    if (!existingPlanting) {
      return res.status(404).json({ error: 'Registro de siembra no encontrado' });
    }
    
    // Soft delete
    await prisma.planting.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
    
    res.status(200).json({ message: 'Registro de siembra eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting planting:', error);
    res.status(500).json({ 
      error: 'Error al eliminar el registro de siembra',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
