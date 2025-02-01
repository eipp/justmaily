import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: number;
}

let contacts: Contact[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ contacts });
  } else if (req.method === 'POST') {
    const { name, email, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Missing required contact fields (name and email).' });
    }
    const newContact: Contact = {
      id: uuidv4(),
      name,
      email,
      phone: phone || '',
      createdAt: Date.now()
    };
    contacts.push(newContact);
    return res.status(201).json(newContact);
  } else if (req.method === 'PUT') {
    const { id, name, email, phone } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Missing contact id.' });
    }
    const index = contacts.findIndex(contact => contact.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Contact not found.' });
    }
    contacts[index] = { ...contacts[index], name, email, phone };
    return res.status(200).json(contacts[index]);
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Missing contact id.' });
    }
    contacts = contacts.filter(contact => contact.id !== id);
    return res.status(200).json({ message: 'Contact deleted successfully.' });
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 