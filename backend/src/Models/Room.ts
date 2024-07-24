interface Room {
    id: string;
    AdminName: string;
    adminUserID: string;
    members: User[];
    boards: Board[];
}

// array of RoomData
const Rooms: Room[] = []