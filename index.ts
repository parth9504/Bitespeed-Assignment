//handles the api endpoint for managing the identity reconciliation process..

import express, { Request, Response } from 'express';
import db from './database';

const app = express();
app.use(express.json());


//  /identify api
app.post('/identify', async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;


  //if no email or phone , return error..
  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "Email or phoneNumber is required" });
  }

  //Find existing contacts matching either email or phone
  const findMatchesQuery = `SELECT * FROM Contact WHERE email = ? OR phoneNumber = ?`;
  
  db.all(findMatchesQuery, [email, phoneNumber], (err, matches: any[]) => {
    if (err) return res.status(500).json({ error: err.message });

    //No existing contacts. 
    //create a new contact->primary type..
    if (matches.length === 0) {
      const insertPrimary = `INSERT INTO Contact (email, phoneNumber, linkPrecedence) VALUES (?, ?, 'primary')`;
      db.run(insertPrimary, [email, phoneNumber], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json({
          contact: {
            primaryContatctId: this.lastID,
            emails: email ? [email] : [],
            phoneNumbers: phoneNumber ? [phoneNumber] : [],
            secondaryContactIds: []
          }
        });
      });
      return;
    }

    // Matches exist. Find the root primary contact(s).
    // Extract unique linked ids...
    const primaryIds = new Set(matches.map(m => m.linkedId ? m.linkedId : m.id));

    // Fetch the actual primary contact rows to determine the oldest one
    const fetchPrimaries = `SELECT * FROM Contact WHERE id IN (${Array.from(primaryIds).join(',')}) ORDER BY createdAt ASC`;
    
    db.all(fetchPrimaries, [], (err, primaryContacts: any[]) => {
      if (err) return res.status(500).json({ error: err.message });

      const oldestPrimary = primaryContacts[0];
      const otherPrimaries = primaryContacts.slice(1);

      //Primary contacts turn into secondary
      // If the incoming request links two separate existing primary contacts.
      if (otherPrimaries.length > 0) {
        const idsToUpdate = otherPrimaries.map(p => p.id);
        const updateToSecondary = `UPDATE Contact SET linkPrecedence = 'secondary', linkedId = ?, updatedAt = CURRENT_TIMESTAMP WHERE id IN (${idsToUpdate.join(',')}) OR linkedId IN (${idsToUpdate.join(',')})`;
        
        db.run(updateToSecondary, [oldestPrimary.id], (err) => {
          if (err) console.error("Error updating primaries to secondary:", err);
        });
      }

      //Create a secondary contact if new information is provided...
      const hasExactEmail = matches.some(m => m.email === email);
      const hasExactPhone = matches.some(m => m.phoneNumber === phoneNumber);
      
      let newSecondaryPromise = Promise.resolve();
      if ((email && !hasExactEmail) || (phoneNumber && !hasExactPhone)) {
        const insertSecondary = `INSERT INTO Contact (email, phoneNumber, linkedId, linkPrecedence) VALUES (?, ?, ?, 'secondary')`;
        newSecondaryPromise = new Promise((resolve) => {
          db.run(insertSecondary, [email, phoneNumber, oldestPrimary.id], resolve);
        });
      }

      //combine the data for final response...
      newSecondaryPromise.then(() => {
        const fetchAllRelated = `SELECT * FROM Contact WHERE id = ? OR linkedId = ?`;
        db.all(fetchAllRelated, [oldestPrimary.id, oldestPrimary.id], (err, allRelated: any[]) => {
          
          const emails = new Set([oldestPrimary.email]); // Primary email first 
          const phones = new Set([oldestPrimary.phoneNumber]); // Primary phone first 
          const secondaryIds: number[] = []; 

          allRelated.forEach(contact => {
            if (contact.email) emails.add(contact.email);
            if (contact.phoneNumber) phones.add(contact.phoneNumber);
            if (contact.id !== oldestPrimary.id) secondaryIds.push(contact.id);
          });

          res.status(200).json({
            contact: {
              primaryContatctId: oldestPrimary.id, 
              emails: Array.from(emails).filter(Boolean),
              phoneNumbers: Array.from(phones).filter(Boolean),
              secondaryContactIds: secondaryIds
            }
          });
        });
      });
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});