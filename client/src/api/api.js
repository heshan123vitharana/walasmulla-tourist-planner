import client from './client';

export const getCategories = ()             => client.get('/categories').then(r => r.data);
export const getPlaces     = (params = {})  => client.get('/places', { params }).then(r => r.data);
export const getPlace      = (slugOrId)     => client.get(`/places/${slugOrId}`).then(r => r.data);

/* Auth */
export const register      = (data)         => client.post('/auth/register', data).then(r => r.data);
export const login         = (data)         => client.post('/auth/login', data).then(r => r.data);
export const me            = ()             => client.get('/auth/me').then(r => r.data);

/* Plans */
export const generatePlan  = (data)         => client.post('/plans/generate', data).then(r => r.data);
export const getMyPlans    = ()             => client.get('/plans').then(r => r.data);
export const getSavedPlan  = (id)           => client.get(`/plans/${id}`).then(r => r.data);
export const savePlan      = (data)         => client.post('/plans', data).then(r => r.data);
export const updatePlan    = (id, data)     => client.put(`/plans/${id}`, data).then(r => r.data);
export const deletePlan    = (id)           => client.delete(`/plans/${id}`).then(r => r.data);

/* Admin */
export const adminGetPlaces         = ()            => client.get('/admin/places').then(r => r.data);
export const adminCreatePlace       = (data)        => client.post('/admin/places', data).then(r => r.data);
export const adminUpdatePlace       = (id, data)    => client.put(`/admin/places/${id}`, data).then(r => r.data);
export const adminDeletePlace       = (id)          => client.delete(`/admin/places/${id}`);
export const adminCreateCategory    = (data)        => client.post('/admin/categories', data).then(r => r.data);
export const adminUpdateCategory    = (id, data)    => client.put(`/admin/categories/${id}`, data).then(r => r.data);
export const adminDeleteCategory    = (id)          => client.delete(`/admin/categories/${id}`);
export const adminGetUsers          = ()            => client.get('/admin/users').then(r => r.data);
export const adminSetUserStatus     = (id, status)  => client.patch(`/admin/users/${id}/status`, { status }).then(r => r.data);
export const adminDeleteUser        = (id)          => client.delete(`/admin/users/${id}`);
