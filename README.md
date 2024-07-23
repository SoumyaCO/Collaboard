# Collaboard

## Collaborative Meeting and Drawing Anytime, Anywhere.

## Features:

1. Collaboratively edit and view canvas
2. Video calling
3. Messaging
4. Reactions
5. Authentication (with actual email verification)
6. No need of Google Account
7. Administrator privilege to mute, forbid from drawing or kick a member from a room

## Contribution:

### (for beginners)

1. Pick an issue
2. install the node modules

```bash
cd backend && npm install
cd frontend && npm install
```

3. Spin up the database (mongodb)

```bash
docker-compose up
```

4. Migrate the database

```bash
npx prisma migrate
```

7. run the application

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
