import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { setupSwagger } from "./docs/swagger.js";

/* Routes */
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import facturaRoutes from "./routes/factura.routes.js";
import productoRoutes from "./routes/producto.routes.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 👉 Configuración Swagger
setupSwagger(app); 

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/facturas", facturaRoutes);
app.use("/api/productos", productoRoutes);

// Ruta de prueba
app.get("/", (req: any, res: any) => {
  res.json({ message: "TrackMyExpenses API funcionando 🚀" });
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT} 🚀`);
});
