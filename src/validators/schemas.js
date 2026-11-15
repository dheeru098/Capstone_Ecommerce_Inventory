const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID');
const safeText = (min, max) => z.string().trim().min(min).max(max);
const positiveInt = z.number().int().min(1);
const nonnegativeInt = z.number().int().min(0);
const price = z.number().finite().min(0).refine((value) => Math.abs(Math.round(value * 100) - value * 100) < 0.000001, 'Use up to 2 decimal places');
const email = z.string().trim().toLowerCase().email().max(160);
const password = z.string().min(8).max(100);
const body = (schema) => z.object({ body: schema });
const params = (schema) => z.object({ params: schema });
const query = (schema) => z.object({ query: schema });
const paging = { page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(10) };
const id = z.object({ id: objectId });

const register = body(z.object({ name: safeText(2, 80), email, password, role: z.enum(['customer', 'seller']).default('customer') }).strict());
const login = body(z.object({ email, password: z.string().min(1) }).strict());
const refresh = body(z.object({ refreshToken: z.string().min(10) }).strict());
const editProfile = body(z.object({ name: safeText(2, 80).optional() }).strict().refine((value) => Object.keys(value).length, 'Provide at least one field'));
const roleUpdate = z.object({ params: id, body: z.object({ role: z.enum(['customer', 'seller', 'admin']), isActive: z.boolean().optional() }).strict() });
const listUsers = query(z.object({ ...paging, role: z.enum(['customer', 'seller', 'admin']).optional() }));
const categoryData = z.object({ name: safeText(2, 80) }).strict();
const categoryCreate = body(categoryData);
const categoryEdit = z.object({ params: id, body: categoryData });
const productData = z.object({
  name: safeText(2, 120), description: safeText(2, 1000), price,
  category: objectId, stock: nonnegativeInt,
  lowStockThreshold: nonnegativeInt.optional()
}).strict();
const productCreate = body(productData);
const productEdit = z.object({ params: id, body: productData.omit({ stock: true }).partial().extend({ isActive: z.boolean().optional() }).refine((data) => Object.keys(data).length, 'Provide at least one field') });
const stockEdit = z.object({ params: id, body: z.object({ change: z.number().int().refine((n) => n !== 0) }).strict() });
const listProducts = query(z.object({
  ...paging, q: z.string().trim().max(100).optional(), category: objectId.optional(),
  seller: objectId.optional(), sort: z.enum(['newest', 'price_asc', 'price_desc', 'name']).default('newest')
}));
const cartAdd = body(z.object({ productId: objectId, quantity: positiveInt.max(100) }).strict());
const cartEdit = z.object({ params: z.object({ productId: objectId }), body: z.object({ quantity: positiveInt.max(100) }).strict() });
const address = z.object({
  fullName: safeText(2, 100), line1: safeText(4, 200), city: safeText(2, 80),
  state: safeText(2, 80), postalCode: safeText(4, 12), phone: z.string().regex(/^\+?[0-9 -]{8,16}$/)
}).strict();
const checkout = body(z.object({ address }).strict());
const statusChange = z.object({ params: id, body: z.object({ status: z.enum(['processing', 'shipped', 'delivered', 'cancelled']) }).strict() });
const listOrders = query(z.object({ ...paging, status: z.enum(['placed', 'processing', 'shipped', 'delivered', 'cancelled']).optional() }));
const salesReport = query(z.object({ from: z.coerce.date().optional(), to: z.coerce.date().optional() }));

module.exports = {
  objectId, id, params, register, login, refresh, editProfile, roleUpdate, listUsers,
  categoryCreate, categoryEdit, productCreate, productEdit, stockEdit, listProducts,
  cartAdd, cartEdit, checkout, statusChange, listOrders, salesReport
};
