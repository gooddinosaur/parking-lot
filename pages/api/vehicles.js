import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db();
  
  if (req.method === 'GET') {
    // Get all parked vehicles
    const vehicles = await db.collection('vehicles')
      .find({ isParked: true })
      .toArray();
      
    return res.json(vehicles);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}