# Bitespeed Backend Task: Identity Reconciliation 🚀

This is a backend web service to handle identity reconciliation. It collects customer contact details and intelligently links different orders made with various email addresses and phone numbers to the same individual.

## 🌐 Live Web Service
**Base URL:** [Visit my backend](https://bitespeed-assignment-yv6u.onrender.com)


## 🛠️ Tech Stack
* **Runtime Environment:** Node.js
* **Language:** TypeScript
* **Framework:** Express.js
* **Database:** SQLite

## 🧠 Core Logic
The service maintains a relational database table named `Contact`. It processes incoming customer data to group related information using the following rules:
1. **Primary Contacts:** The oldest record associated with a customer. If a completely new customer arrives, a new primary contact is created.

2. **Secondary Contacts:** If an incoming request contains new information but shares a common email or phone number with an existing contact, it is saved as a secondary contact linked to the primary one.

3. **Primary to Secondary Conversion:** If an incoming request links two previously separate primary contacts, the newer primary contact is converted into a secondary contact and linked to the older primary contact .



## 📖 API Documentation

### Identify Customer
Consolidates contact information based on incoming email and phone numbers.

* **Endpoint:** `/identify` 
* **Method:** `POST` 
* **Headers:** `Content-Type: application/json`

#### Request Payload
The endpoint expects a JSON body containing an `email`, a `phoneNumber`, or both.
```json
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": "123456"
}
```
#### Outputs

<img width="938" height="807" alt="image" src="https://github.com/user-attachments/assets/009463d0-46af-49db-a4b2-763b74898bf9" />


<img width="880" height="780" alt="image" src="https://github.com/user-attachments/assets/a0df17b8-4627-4088-9364-2c64de193429" />



