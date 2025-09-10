import { prisma } from '../lib/prisma.js';

export const createPlanting = async (req, res) => {
  try {
    const { 
      plantName, 
      datePlanted, 
      expectedHarvest, 
      domeDate, 
      lightDate, 
      quantity, 
      yield: plantYield, 
      notes 
    } = req.body;
    
    const newPlanting = await prisma.planting.create({
      data: {
        plantName,
        datePlanted: new Date(datePlanted),
        expectedHarvest: expectedHarvest ? new Date(expectedHarvest) : null,
        domeDate: domeDate ? new Date(domeDate) : null,
        lightDate: lightDate ? new Date(lightDate) : null,
        quantity: quantity ? parseInt(quantity) : null,
        yield: plantYield ? parseFloat(plantYield) : null,
        notes: notes || null,
      },
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
    const { page = 1, limit = 10, plantName } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = plantName 
      ? { 
          plantName: { 
            contains: plantName, 
            mode: 'insensitive' 
          },
          deletedAt: null
        }
      : { deletedAt: null };
    
    const [plantings, total] = await Promise.all([
      prisma.planting.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
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
      datePlanted, 
      expectedHarvest, 
      domeDate, 
      lightDate, 
      quantity, 
      yield: plantYield, 
      notes 
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
    
    const updatedPlanting = await prisma.planting.update({
      where: { id },
      data: {
        plantName,
        datePlanted: datePlanted ? new Date(datePlanted) : undefined,
        expectedHarvest: expectedHarvest ? new Date(expectedHarvest) : undefined,
        domeDate: domeDate ? new Date(domeDate) : undefined,
        lightDate: lightDate ? new Date(lightDate) : undefined,
        quantity: quantity !== undefined ? parseInt(quantity) : undefined,
        yield: plantYield !== undefined ? parseFloat(plantYield) : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
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
