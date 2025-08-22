import { Router } from "express";
import { 
  crearFactura, 
  obtenerFacturas, 
  obtenerFacturaPorId, 
  actualizarFactura, 
  eliminarFactura,
  obtenerEstadisticas
} from "../controllers/factura.controller.js";
import { authGuard } from "../middlewares/auth.middleware.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authGuard);

// CRUD de facturas
router.post("/", crearFactura);
router.get("/", obtenerFacturas);
router.get("/estadisticas", obtenerEstadisticas);
router.get("/:id", obtenerFacturaPorId);
router.put("/:id", actualizarFactura);
router.delete("/:id", eliminarFactura);

export default router;