import { Router } from "express";
import { 
  crearProducto, 
  obtenerProductos, 
  obtenerProductoPorId,
  obtenerProductoPorCodigo,
  actualizarProducto, 
  eliminarProducto,
  obtenerProductosMasVendidos
} from "../controllers/producto.controller.js";
import { authGuard } from "../middlewares/auth.middleware.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authGuard);

// CRUD de productos
router.post("/", crearProducto);
router.get("/", obtenerProductos);
router.get("/mas-vendidos", obtenerProductosMasVendidos);
router.get("/codigo/:codigo", obtenerProductoPorCodigo);
router.get("/:id", obtenerProductoPorId);
router.put("/:id", actualizarProducto);
router.delete("/:id", eliminarProducto);

export default router;

