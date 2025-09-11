import { prisma } from '../lib/prisma.js';

// Get all harvests
export const getHarvests = async (req, res) => {
  try {
    const { page = 1, limit = 10, plantingId, quality } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      deletedAt: null,
      ...(plantingId && { plantingId }),
      ...(quality && { quality })
    };
    
    const [harvests, total] = await Promise.all([
      prisma.harvest.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { harvestDate: 'desc' },
        include: {
          planting: {
            select: {
              id: true,
              plantName: true,
              plantType: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      }),
      prisma.harvest.count({ where })
    ]);
    
    res.status(200).json({
      data: harvests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching harvests:', error);
    res.status(500).json({ 
      error: 'Error al obtener las cosechas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get harvests by planting
export const getHarvestsByPlanting = async (req, res) => {
  try {
    const { plantingId } = req.params;
    
    const harvests = await prisma.harvest.findMany({
      where: {
        plantingId,
        deletedAt: null
      },
      orderBy: { harvestDate: 'desc' },
      include: {
        planting: {
          select: {
            id: true,
            plantName: true,
            plantType: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    
    res.status(200).json(harvests);
  } catch (error) {
    console.error('Error fetching harvests for planting:', error);
    res.status(500).json({ 
      error: 'Error al obtener las cosechas de la siembra',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get harvest by id
export const getHarvestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const harvest = await prisma.harvest.findFirst({
      where: { 
        id,
        deletedAt: null
      },
      include: {
        planting: {
          select: {
            id: true,
            plantName: true,
            datePlanted: true,
            plantType: {
              select: {
                name: true,
                marketPrice: true
              }
            }
          }
        }
      }
    });
    
    if (!harvest) {
      return res.status(404).json({ error: 'Cosecha no encontrada' });
    }
    
    res.status(200).json(harvest);
  } catch (error) {
    console.error('Error fetching harvest:', error);
    res.status(500).json({ 
      error: 'Error al obtener la cosecha',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create harvest
export const createHarvest = async (req, res) => {
  try {
    const { 
      plantingId,
      harvestDate,
      weight,
      quality,
      notes,
      pricePerGram,
      appearance,
      taste,
      freshness
    } = req.body;
    
    // Verify planting exists
    const planting = await prisma.planting.findFirst({
      where: {
        id: plantingId,
        deletedAt: null
      }
    });
    
    if (!planting) {
      return res.status(404).json({ error: 'Siembra no encontrada' });
    }
    
    // Calculate total value if price provided
    const totalValue = pricePerGram ? parseFloat(weight) * parseFloat(pricePerGram) : null;
    
    const newHarvest = await prisma.harvest.create({
      data: {
        plantingId,
        harvestDate: new Date(harvestDate),
        weight: parseFloat(weight),
        quality,
        notes,
        pricePerGram: pricePerGram ? parseFloat(pricePerGram) : null,
        totalValue,
        appearance: appearance ? parseInt(appearance) : null,
        taste: taste ? parseInt(taste) : null,
        freshness: freshness ? parseInt(freshness) : null,
      },
      include: {
        planting: {
          select: {
            id: true,
            plantName: true,
            plantType: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    
    // Update planting status to HARVESTED if this is the first harvest
    const harvestCount = await prisma.harvest.count({
      where: {
        plantingId,
        deletedAt: null
      }
    });
    
    if (harvestCount === 1) {
      await prisma.planting.update({
        where: { id: plantingId },
        data: { status: 'HARVESTED' }
      });
    }
    
    res.status(201).json(newHarvest);
  } catch (error) {
    console.error('Error creating harvest:', error);
    res.status(500).json({ 
      error: 'Error al crear la cosecha',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update harvest
export const updateHarvest = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      harvestDate,
      weight,
      quality,
      notes,
      pricePerGram,
      appearance,
      taste,
      freshness
    } = req.body;
    
    // Check if exists
    const existingHarvest = await prisma.harvest.findFirst({
      where: { 
        id,
        deletedAt: null
      }
    });
    
    if (!existingHarvest) {
      return res.status(404).json({ error: 'Cosecha no encontrada' });
    }
    
    // Calculate total value if weight or price changed
    const newWeight = weight !== undefined ? parseFloat(weight) : existingHarvest.weight;
    const newPricePerGram = pricePerGram !== undefined ? parseFloat(pricePerGram) : existingHarvest.pricePerGram;
    const totalValue = newPricePerGram ? newWeight * newPricePerGram : null;
    
    const updatedHarvest = await prisma.harvest.update({
      where: { id },
      data: {
        harvestDate: harvestDate ? new Date(harvestDate) : undefined,
        weight: weight !== undefined ? parseFloat(weight) : undefined,
        quality,
        notes,
        pricePerGram: pricePerGram !== undefined ? parseFloat(pricePerGram) : undefined,
        totalValue,
        appearance: appearance !== undefined ? parseInt(appearance) : undefined,
        taste: taste !== undefined ? parseInt(taste) : undefined,
        freshness: freshness !== undefined ? parseInt(freshness) : undefined,
      },
      include: {
        planting: {
          select: {
            id: true,
            plantName: true,
            plantType: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    
    res.status(200).json(updatedHarvest);
  } catch (error) {
    console.error('Error updating harvest:', error);
    res.status(500).json({ 
      error: 'Error al actualizar la cosecha',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete harvest
export const deleteHarvest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if exists
    const existingHarvest = await prisma.harvest.findFirst({
      where: { 
        id,
        deletedAt: null
      }
    });
    
    if (!existingHarvest) {
      return res.status(404).json({ error: 'Cosecha no encontrada' });
    }
    
    // Soft delete
    await prisma.harvest.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
    
    res.status(200).json({ message: 'Cosecha eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting harvest:', error);
    res.status(500).json({ 
      error: 'Error al eliminar la cosecha',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};