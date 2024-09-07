# Socket Events and Their Life Cycles

To Understand only the events and callbacks over the socket.io will require a great deal of attention, it's complicated, because it's made by me, and I love to do things in a complicated way.

> **NOTE**: If you are not familiar with socket.io, then first check it with some patient.
> Key points to remember 1. It's not websocket 2. websocket and socket.io speaks different languages. (like one speaks "Hindi" and the other speaks "Bangla")

## Events list and their possible works in one place

After setting up the socket.io server with proper _cors configurations_ and express, we've used one middleware function so far, which is **<font color="cyan">validation middleware.</font>**

```javascript
...
import jwt from 'jsonwebtoken'
...

// verify jwt token upon each emit
function isvalidToken(token: string) {
  const verified = jwt.verify(token, process.env.JWT_PASS as string) as User;
  return verified;
}

...
// middleware function
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      throw new Error("Missing Token");
    }
    if (!isvalidToken(token)) {
      throw new Error("Invalid Token");
    }
    next();
  } catch (error) {
    console.error("Authentication error", error);
    next(new Error("Authentication error"));
  }
});
```

> References:
>
> 1.  [Socket.io middlewares (official docs)](https://socket.io/docs/v4/middlewares/)
> 2.  [DhiWise Blog Post > Ensuring Secure Data Exchange in Real-Time Application](https://www.dhiwise.com/post/socket.io-authentication-ensuring-secure-data-exchange)

##### That's it, no more setup. Here are the list of events.

1. Standard Events (predefined by socket.io)
   1. **connection**: when a new socket connection initiates.
   2. **disconnect**: when a socket disconnects.
   3. **connect_error**: when socket throws any error and disconnects the client. this trigger and gives back the error to the client.
2. Custom Events (Defined by none other than us)
   1. **create-room**: Creates new room and adds the details to the database.
   2. **join-room**: Joins to a room if it already exists
   3. **send-current-data**: Sends this event to the admin to give the current stack data back to server (to give the new joiner)
   4. **new-joiner-alert**: It will inform the admin that a new joiner wants to join.
   5. **permission**: It will give back the permission (accepted or not) which can only be set by the admin.
   6. **on-drawing**: It listens for new drawing on canvas.
   7. **draw-on-canvas**: It sends the data to the client.

> <font color="red">NOTE:</font> The _send-current-data_ will be replaced by 4th and 5th event.
> _"send-current-data"_ waits for the callback which comes from the admin often leads to <font color="orange">timeout error</font>
> TO AVOID that we've split that one event into two. (which does not wait for a callback)

##### Here is a socket event map

<img src="./Assets/socket-impl-diagram.png" width="640px"/>

> <font color="gray">Coming Soon: Detailed explanation on socket.io implementation in this project, also the client side code.</font>
