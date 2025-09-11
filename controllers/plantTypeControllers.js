import { prisma } from '../lib/prisma.js';

// Get all plant types
export const getPlantTypes = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    
    const where = {
      deletedAt: null,
      ...(category && { category: { contains: category, mode: 'insensitive' } }),
      ...(difficulty && { difficulty })
    };
    
    const plantTypes = await prisma.plantType.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { plantings: true }
        }
      }
    });
    
    res.status(200).json(plantTypes);
  } catch (error) {
    console.error('Error fetching plant types:', error);
    res.status(500).json({ 
      error: 'Error al obtener los tipos de plantas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get plant type by id
export const getPlantTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const plantType = await prisma.plantType.findFirst({
      where: { 
        id,
        deletedAt: null
      },
      include: {
        plantings: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: { plantings: true }
        }
      }
    });
    
    if (!plantType) {
      return res.status(404).json({ error: 'Tipo de planta no encontrado' });
    }
    
    res.status(200).json(plantType);
  } catch (error) {
    console.error('Error fetching plant type:', error);
    res.status(500).json({ 
      error: 'Error al obtener el tipo de planta',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create plant type (Admin only)
export const createPlantType = async (req, res) => {
  try {
    const { 
      name, 
      scientificName, 
      category, 
      description,
      daysToGerminate,
      daysToHarvest,
      optimalTemp,
      optimalHumidity,
      lightRequirement,
      averageYield,
      marketPrice,
      difficulty
    } = req.body;
    
    const newPlantType = await prisma.plantType.create({
      data: {
        name,
        scientificName,
        category,
        description,
        daysToGerminate: daysToGerminate ? parseInt(daysToGerminate) : null,
        daysToHarvest: daysToHarvest ? parseInt(daysToHarvest) : null,
        optimalTemp: optimalTemp ? parseFloat(optimalTemp) : null,
        optimalHumidity: optimalHumidity ? parseFloat(optimalHumidity) : null,
        lightRequirement,
        averageYield: averageYield ? parseFloat(averageYield) : null,
        marketPrice: marketPrice ? parseFloat(marketPrice) : null,
        difficulty
      }
    });
    
    res.status(201).json(newPlantType);
  } catch (error) {
    console.error('Error creating plant type:', error);
    res.status(500).json({ 
      error: 'Error al crear el tipo de planta',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update plant type (Admin only)
export const updatePlantType = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if exists
    const existingPlantType = await prisma.plantType.findFirst({
      where: { 
        id,
        deletedAt: null
      }
    });
    
    if (!existingPlantType) {
      return res.status(404).json({ error: 'Tipo de planta no encontrado' });
    }
    
    const updatedPlantType = await prisma.plantType.update({
      where: { id },
      data: {
        ...updateData,
        daysToGerminate: updateData.daysToGerminate ? parseInt(updateData.daysToGerminate) : undefined,
        daysToHarvest: updateData.daysToHarvest ? parseInt(updateData.daysToHarvest) : undefined,
        optimalTemp: updateData.optimalTemp ? parseFloat(updateData.optimalTemp) : undefined,
        optimalHumidity: updateData.optimalHumidity ? parseFloat(updateData.optimalHumidity) : undefined,
        averageYield: updateData.averageYield ? parseFloat(updateData.averageYield) : undefined,
        marketPrice: updateData.marketPrice ? parseFloat(updateData.marketPrice) : undefined,
      }
    });
    
    res.status(200).json(updatedPlantType);
  } catch (error) {
    console.error('Error updating plant type:', error);
    res.status(500).json({ 
      error: 'Error al actualizar el tipo de planta',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete plant type (Admin only)
export const deletePlantType = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if exists
    const existingPlantType = await prisma.plantType.findFirst({
      where: { 
        id,
        deletedAt: null
      }
    });
    
    if (!existingPlantType) {
      return res.status(404).json({ error: 'Tipo de planta no encontrado' });
    }
    
    // Check if has active plantings
    const activePlantings = await prisma.planting.count({
      where: {
        plantTypeId: id,
        deletedAt: null
      }
    });
    
    if (activePlantings > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar: existen siembras asociadas a este tipo de planta'
      });
    }
    
    // Soft delete
    await prisma.plantType.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
    
    res.status(200).json({ message: 'Tipo de planta eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting plant type:', error);
    res.status(500).json({ 
      error: 'Error al eliminar el tipo de planta',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};