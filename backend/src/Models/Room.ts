interface Room {
    id: string;
    date: Date;
    AdminName: string;
    adminUserID: string;
    board: Board;
}

// array of RoomData
const Rooms: Room[] = []