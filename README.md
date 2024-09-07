# Collaboard

## Collaborative Meeting and Drawing Anytime, Anywhere.

## Features:

1. Collaboratively edit and view canvas
2. Video calling
3. Messaging
4. Authentication (with actual email verification)
6. No need of Google Account
7. Administrator privilege to mute, forbid from drawing or kick a member from a room

## Documentations

Here is our explanations on various parts of the application that are challenging (or at least we've found challenging).
We're constantly improving the documentation.

| Serial No   | Title                                                                          | Author                 |
|-------------|--------------------------------------------------------------------------------|------------------------|
| 01          | [Realtime communication implementation](./docs/socket-implementation.md)       | Soumyadip Bhattacharjya|
| 02          | System Design of the application                                               | *Pending...*           |


## Contribution:

To Contribute to this repo and setup this locally follow these steps.

1. Pick an issue
2. install the node modules

```bash
cd backend && npm install
cd frontend && npm install
```

3. Spin up the database locally (mongodb)

```bash
docker compose up
```

4. run the application

start the **backend**

```bash
cd backend
npm run start
```

start the **frontend**

```bash
cd frontend
npm run dev
```

Everyone's Contribution is highly welcomed!
