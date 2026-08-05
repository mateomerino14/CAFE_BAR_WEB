import { Routes, Route } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterRolePage } from '../features/roles/pages/RegisterRolePage';
import { ManageRolesPage } from '../features/roles/pages/ManageRolesPage';
import { RegisterEmployeePage } from '../features/employees/pages/RegisterEmployeePage';
import { ManageEmployeesPage } from '../features/employees/pages/ManageEmployeesPage';
import { EmployeeStatusPage } from '../features/employees/pages/EmployeeStatusPage';
import { RegisterCategoryPage } from '../features/categories/pages/RegisterCategoryPage';
import { ManageCategoriesPage } from '../features/categories/pages/ManageCategoriesPage';
import { CategoryStatusPage } from '../features/categories/pages/CategoryStatusPage';
import { RegisterProductPage } from '../features/products/pages/RegisterProductPage';
import { ConfiguracionPage } from '../features/config/pages/ConfiguracionPage';
import { ManageProductsPage } from '../features/products/pages/ManageProductsPage';
import { ProductStatusPage } from '../features/products/pages/ProductStatusPage';
import { FamilyPage } from '../features/catalog/pages/FamilyPage';
import { SessionExpiredModal } from '../components/organisms/SessionExpiredModal';
import { RegisterStockPage } from '../features/stock/pages/RegisterStockPage';
import { ManageStockPage } from '../features/stock/pages/ManageStockPage';
import { SectionsPage } from '../features/sections/pages/SectionsPage';
import { RegisterPromotionPage } from '../features/promotions/pages/RegisterPromotionPage';
import { ManagePromotionsPage } from '../features/promotions/pages/ManagePromotionsPage';
import { PromotionStatusPage } from '../features/promotions/pages/PromotionStatusPage';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ReportsPage } from '../features/reports/pages/ReportsPage';
import { DailySalesPage } from '../features/config/pages/DailySalesPage';
import { ProtectedRoute } from './ProtectedRoute';
import { CajaPage } from '../features/pos/pages/CajaPage';

export const AppRouter = () => {
  return (
    <>
      <SessionExpiredModal />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute permission="Home"><HomePage /></ProtectedRoute>} />
        <Route path="/empleados/registrar-cargos" element={<ProtectedRoute permission="REGISTRAR_CARGOS"><RegisterRolePage /></ProtectedRoute>} />
        <Route path="/empleados/modificar-cargos" element={<ProtectedRoute permission="MODIFICAR_CARGOS"><ManageRolesPage /></ProtectedRoute>} />
        <Route path="/empleados/registrar" element={<ProtectedRoute permission="REGISTRAR_EMPLEADOS"><RegisterEmployeePage /></ProtectedRoute>} />
        <Route path="/empleados/modificar" element={<ProtectedRoute permission="MODIFICAR_EMPLEADOS"><ManageEmployeesPage /></ProtectedRoute>} />
        <Route path="/empleados/baja" element={<ProtectedRoute permission="BAJA_EMPLEADOS"><EmployeeStatusPage /></ProtectedRoute>} />
        <Route path="/productos/registrar-categoria" element={<ProtectedRoute permission="REGISTRAR_CATEGORIA"><RegisterCategoryPage /></ProtectedRoute>} />
        <Route path="/productos/modificar-categoria" element={<ProtectedRoute permission="MODIFICAR_CATEGORIA"><ManageCategoriesPage /></ProtectedRoute>} />
        <Route path="/productos/baja-categoria" element={<ProtectedRoute permission="BAJA_CATEGORIA"><CategoryStatusPage /></ProtectedRoute>} />
        <Route path="/productos/registrar-producto" element={<ProtectedRoute permission="REGISTRAR_PRODUCTO"><RegisterProductPage /></ProtectedRoute>} />
        <Route path="/productos/modificar-producto" element={<ProtectedRoute permission="MODIFICAR_PRODUCTO"><ManageProductsPage /></ProtectedRoute>} />
        <Route path="/productos/baja-producto" element={<ProtectedRoute permission="BAJA_PRODUCTO"><ProductStatusPage /></ProtectedRoute>} />
        <Route path="/stock/registrar-ingredientes" element={<ProtectedRoute permission="REGISTRAR_INGREDIENTES"><RegisterStockPage /></ProtectedRoute>} />
        <Route path="/stock/modificar-ingredientes" element={<ProtectedRoute permission="MODIFICAR_INGREDIENTES"><ManageStockPage /></ProtectedRoute>} />
        <Route path="/secciones" element={<ProtectedRoute permission="ADMIN_SECCIONES"><SectionsPage /></ProtectedRoute>} />
        <Route path="/promociones/registrar" element={<ProtectedRoute permission="REGISTRAR_PROMOCIONES"><RegisterPromotionPage /></ProtectedRoute>} />
        <Route path="/promociones/modificar" element={<ProtectedRoute permission="MODIFICAR_PROMOCIONES"><ManagePromotionsPage /></ProtectedRoute>} />
        <Route path="/promociones/baja" element={<ProtectedRoute permission="BAJA_PROMOCIONES"><PromotionStatusPage /></ProtectedRoute>} />
        <Route path="/familia" element={<ProtectedRoute permission="VER_FAMILIA"><FamilyPage /></ProtectedRoute>} />
        <Route path="/administracion/configuracion" element={<ProtectedRoute permission="CONFIGURACION"><ConfiguracionPage /></ProtectedRoute>} />
        <Route path="/administracion/ventas-diarias" element={<ProtectedRoute permission="CONFIGURACION"><DailySalesPage /></ProtectedRoute>} />
        <Route path="/caja/registrar-pedido" element={<ProtectedRoute permission="REGISTRAR_PEDIDO"><CajaPage /></ProtectedRoute>} />
        <Route path="/reportes" element={<ProtectedRoute permission="VER_REPORTES"><ReportsPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};