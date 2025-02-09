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

// Helper function to get all contacts
function getContacts() {
  return contacts;
}

// Helper function to validate POST contact request and create a new contact
function validatePostContactRequest(req: NextApiRequest): { name: string; email: string; phone?: string } {
  const { name, email, phone } = req.body;
  if (!name || !email) throw new Error('Missing required contact fields (name and email).');
  return { name, email, phone };
}

function createContact({ name, email, phone }: { name: string; email: string; phone?: string }) {
  const newContact: Contact = {
    id: uuidv4(),
    name,
    email,
    phone: phone || '',
    createdAt: Date.now()
  };
  contacts.push(newContact);
  return newContact;
}

// Helper function to validate PUT contact request
function validatePutContactRequest(req: NextApiRequest): { id: string; name?: string; email?: string; phone?: string } {
  const { id, name, email, phone } = req.body;
  if (!id) throw new Error('Missing contact id.');
  return { id, name, email, phone };
}

function updateContact({ id, name, email, phone }: { id: string; name?: string; email?: string; phone?: string }) {
  const index = contacts.findIndex(contact => contact.id === id);
  if (index === -1) throw new Error('Contact not found.');
  contacts[index] = { ...contacts[index], name, email, phone };
  return contacts[index];
}

// Helper function to validate DELETE contact request
function validateDeleteContactRequest(req: NextApiRequest): string {
  const { id } = req.body;
  if (!id) throw new Error('Missing contact id.');
  return id;
}

function deleteContact(id: string) {
  contacts = contacts.filter(contact => contact.id !== id);
  return { message: 'Contact deleted successfully.' };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json({ contacts: getContacts() });
    } else if (req.method === 'POST') {
      const { name, email, phone } = validatePostContactRequest(req);
      const newContact = createContact({ name, email, phone });
      return res.status(201).json(newContact);
    } else if (req.method === 'PUT') {
      const { id, name, email, phone } = validatePutContactRequest(req);
      const updatedContact = updateContact({ id, name, email, phone });
      return res.status(200).json(updatedContact);
    } else if (req.method === 'DELETE') {
      const id = validateDeleteContactRequest(req);
      const result = deleteContact(id);
      return res.status(200).json(result);
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    if (error.message === 'Missing required contact fields (name and email).') {
      return res.status(400).json({ error: error.message });
    } else if (error.message === 'Missing contact id.') {
      return res.status(400).json({ error: error.message });
    } else if (error.message === 'Contact not found.') {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || 'Internal server error.' });
  }
} 