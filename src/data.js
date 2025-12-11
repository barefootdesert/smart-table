// data.js
import { makeIndex } from "./lib/utils.js";

const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

export function initData(sourceData) {
    let sellers = makeIndex(sourceData.sellers, 'id', v => `${v.first_name} ${v.last_name}`);
    let customers = makeIndex(sourceData.customers, 'id', v => `${v.first_name} ${v.last_name}`);

    let lastResult = null;
    let lastQuery = null;

    const mapRecords = (data) => data.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id] ?? item.seller_id,
        customer: customers[item.customer_id] ?? item.customer_id,
        total: item.total_amount
    }));

    const getIndexes = async () => {
        if (sellers && customers) {
            return { sellers, customers };
        }

        try {
            const [sRes, cRes] = await Promise.all([
                fetch(`${BASE_URL}/sellers`).then(r => r.json()),
                fetch(`${BASE_URL}/customers`).then(r => r.json())
            ]);
            const toIndex = arr => Array.isArray(arr)
                ? arr.reduce((acc, it) => { acc[it.id] = `${it.first_name ?? ''} ${it.last_name ?? ''}`.trim(); return acc; }, {})
                : arr;

            sellers = toIndex(sRes);
            customers = toIndex(cRes);

            return { sellers, customers };
        } catch (e) {
            return { sellers, customers };
        }
    };

    const getRecords = async (query = {}, isUpdated = false) => {
        const qs = new URLSearchParams(query);
        const nextQuery = qs.toString();

        if (lastQuery === nextQuery && !isUpdated && lastResult) {
            return lastResult;
        }

        // Попытка сделать реальный запрос к серверу
        try {
            const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
            if (!response.ok) throw new Error('Network response not ok');
            const records = await response.json();

            lastQuery = nextQuery;
            lastResult = {
                total: records.total,
                items: mapRecords(records.items)
            };
            return lastResult;
        } catch (e) {
            const localItems = sourceData.purchase_records.slice(); 
            let items = localItems.map(item => ({
                receipt_id: item.receipt_id,
                date: item.date,
                seller_id: item.seller_id,
                customer_id: item.customer_id,
                total_amount: item.total_amount
            }));

            Object.keys(query).forEach(k => {
                if (k.startsWith('filter[')) {
                    const field = k.slice(7, -1); 
                    const val = query[k].toLowerCase();
                    items = items.filter(it => {
                        const v = String(
                            field === 'seller' ? (sellers[it.seller_id] ?? '') :
                            field === 'customer' ? (customers[it.customer_id] ?? '') :
                            it[field] ?? ''
                        ).toLowerCase();
                        return v.includes(val);
                    });
                }
            });


            if (query.search) {
                const q = query.search.toLowerCase();
                items = items.filter(it => {
                    const s = (sellers[it.seller_id] ?? '').toLowerCase();
                    const c = (customers[it.customer_id] ?? '').toLowerCase();
                    const d = (it.date ?? '').toLowerCase();
                    return s.includes(q) || c.includes(q) || d.includes(q);
                });
            }

            if (query.sort) {
                const [field, dir] = query.sort.split(':');
                items.sort((a, b) => {
                    let va = a[field === 'seller' ? 'seller_id' : (field === 'customer' ? 'customer_id' : (field === 'total' ? 'total_amount' : field))];
                    let vb = b[field === 'seller' ? 'seller_id' : (field === 'customer' ? 'customer_id' : (field === 'total' ? 'total_amount' : field))];
                    if (field === 'seller') { va = sellers[va]; vb = sellers[vb]; }
                    if (field === 'customer') { va = customers[va]; vb = customers[vb]; }
                    if (typeof va === 'string') va = va.toLowerCase();
                    if (typeof vb === 'string') vb = vb.toLowerCase();
                    if (va < vb) return dir === 'asc' ? -1 : 1;
                    if (va > vb) return dir === 'asc' ? 1 : -1;
                    return 0;
                });
            }

            // Пагинация: limit и page (page — 1-based в UI, в инструкции выглядит так же)
            const limit = Number(query.limit) || items.length;
            const page = Number(query.page) || 1;
            const total = items.length;
            const offset = (page - 1) * limit;
            const pageItems = items.slice(offset, offset + limit);

            lastQuery = nextQuery;
            lastResult = {
                total,
                items: mapRecords(pageItems)
            };

            return lastResult;
        }
    };

    // отдаём API-методы
    return {
        getIndexes,
        getRecords
    };
}
