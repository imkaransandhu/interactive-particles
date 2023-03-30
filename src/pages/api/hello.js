// // // Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// // export default function handler(req, res) {
// //   res.status(200).json({ name: 'John Doe' })
// // }

// import { Server } from "Socket.IO";
// const SocketHandler = (req, res) => {
//   //console.log(req);
//   if (res.socket.server.io) {
//     console.log("Socket is already running");
//   } else {
//     console.log("Socket is initializing", res.socket);
//     const io = new Server(res.socket.server);
//     res.socket.server.io = io;

//     io.on("connection", (socket) => {
//       socket.on("input-change", (msg) => {
//         socket.broadcast.emit("update-input", msg);
//       });
//     });
//   }
//   res.end();
// };

// export default SocketHandler;
