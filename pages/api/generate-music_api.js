export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const response = await fetch('http://localhost:5000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      throw new Error('Failed to generate music');
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error generating music:', error);
    return res.status(500).json({ message: 'Error generating music' });
  }
}
