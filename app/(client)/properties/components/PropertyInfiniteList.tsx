// INFINITESCROLL TRADICIONAL, LOS ITEMS EN LA PARTE SUPERIOR NO DESAPARECEN 
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { PropertyItem, fetchMoreProperties } from '../controller/properties-controller';
import { PropertyCard } from './PropertyCard';
import OrderList from './OrderList';
import ScrollToTopButton from './ScrollToTop';
import SearchSummary from './SearchSummary';

export function PropertyInfiniteList({ initialItems, searchParams, userId, totalCount, edit, itemsPage, mode, order }: any) {
  // Inicializamos con los items del servidor para evitar el flash de lista vacía
  const [allProperties, setAllProperties] = useState<PropertyItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length >= itemsPage);
  const [skipState, setSkipState] = useState(itemsPage);

  const observerTarget = useRef<HTMLDivElement>(null);
  const isRestoring = useRef(false);

  const parsedProvData = typeof window !== 'undefined' && sessionStorage.getItem('last_prov_results')
    ? JSON.parse(sessionStorage.getItem('last_prov_results') as string)
    : null;

  // CAMBIO DE ORDEN ORDERLIST
  useEffect(() => {
    if (mode === 'PROV' && searchParams.prov !== parsedProvData?.prov) sessionStorage.removeItem('last_scroll_pos');

    setAllProperties(initialItems);
    setHasMore(initialItems.length >= itemsPage);
    setSkipState(initialItems.length < itemsPage ? initialItems.length : itemsPage);
  }, [initialItems, itemsPage]);

  // PAGINACION INFINITE SCROLL
  // 1. Restauración de scroll y datos
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    if (totalCount === 0) {
      sessionStorage.removeItem('pending_urls');
      sessionStorage.removeItem('last_id_results');
      sessionStorage.removeItem('last_prov_results');
      sessionStorage.removeItem('last_search_results');
      sessionStorage.removeItem('last_scroll_pos');
      sessionStorage.removeItem('last_order');
      return;
    }

    let savedData: string | null = null;
    if (mode === 'ID') savedData = sessionStorage.getItem('last_id_results');
    if (mode === 'PROV') {
      if (searchParams.prov === parsedProvData?.prov) {
        savedData = sessionStorage.getItem('last_prov_results');
      } else {
        sessionStorage.removeItem('last_scroll_pos');
      }
    }
    if (mode === 'FILTER') savedData = sessionStorage.getItem('last_search_results');

    const savedScrollY = sessionStorage.getItem('last_scroll_pos');
    // console.log('mode en infinite', mode, savedScrollY)

    if (savedData) {
      isRestoring.current = true;
      const parsed = JSON.parse(savedData) as { properties: PropertyItem[]; hasMore: boolean };
      // console.log('num properties en infinite', parsed.properties.length)

      // IMPORTANTE: Sobrescribimos con lo guardado solo si hay datos, 
      // esto reemplaza los initialItems del servidor para evitar duplicados
      if (parsed.properties && parsed.properties.length > 0) {
        setAllProperties(parsed.properties);
        setHasMore(parsed.hasMore);
        setSkipState(parsed.properties.length);
      }
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: parseInt(savedScrollY || "0"), behavior: 'smooth' });
        // Damos un margen para que el observer no se dispare durante el salto
        setTimeout(() => { isRestoring.current = false; }, 500);
      });
    });
  }, []); // SE EJECUTA AL MONTAR LA PAGINA, CARGA LOS DATOS DE SESSIONSTORAGE SI EXISTEN

  // Guardar datos acumulados (Separado del scroll para eficiencia)
  useEffect(() => {
    // No guardamos si estamos en medio de una restauración
    if (isRestoring.current) return;

    if (allProperties.length > 0) {
      if (mode === 'ID') {
        // console.log('ID')
        sessionStorage.setItem('last_id_results', JSON.stringify({
          properties: allProperties,
          hasMore
        }));
      }
      if (mode === 'PROV') {
        // console.log('PROV')
        sessionStorage.setItem('last_prov_results', JSON.stringify({
          properties: allProperties,
          prov: searchParams.prov,
          hasMore
        }));
      }
      if (mode === 'FILTER') {
        // console.log('FILTER')
        sessionStorage.setItem('last_search_results', JSON.stringify({
          properties: allProperties,
          hasMore
        }));
      }
    }
  }, [allProperties, hasMore]); // CUANDO CAMBIA ALLPROPERTIES O HASMORE INYECTA LOS NUEVOS DATOS AL SESSIONSTORAGE

  // Guardar posición de scroll (Debounced)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      if (isRestoring.current) return;

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const currentScroll = window.scrollY;
        if (currentScroll > 0) {
          sessionStorage.setItem('last_scroll_pos', currentScroll.toString());
          // console.log('scroll', currentScroll.toString())
        }
      }, 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  // 4. Cargar más
  const loadNextPage = useCallback(async () => {
    if (loading || !hasMore || isRestoring.current) return;

    setLoading(true);
    const currentSkip = allProperties.length;

    const newItems = await fetchMoreProperties(userId, searchParams, currentSkip, itemsPage, mode, order);
    const count = currentSkip + itemsPage <= totalCount ? currentSkip + itemsPage : totalCount;
    setSkipState(count);

    if (newItems) {
      if (newItems.length < itemsPage) setHasMore(false);
      if (newItems.length > 0) {
        setAllProperties(prev => {
          const existingIds = new Set(prev.map(p => p.itemId));
          const filteredNew = newItems.filter(item => !existingIds.has(item.itemId));
          return [...prev, ...filteredNew];
        });
      }
    }
    setLoading(false);
  }, [loading, hasMore, allProperties.length, searchParams, itemsPage, mode, order]);

  // Observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading && !isRestoring.current) {
        loadNextPage();
      }
    }, { threshold: 0.1 });

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loadNextPage, hasMore, loading]);

  // console.log('searchParams', searchParams)
  // console.log('allProperties', allProperties)

  let noItems = '';
  if (mode === 'ID') {
    noItems = "This user doesn't have any property";
  }
  if (mode === 'PROV') {
    noItems = `The province ${searchParams.prov} doesn't have any property`;
  }
  if (mode === 'FILTER') {
    noItems = "No matches found. Try broadening your search area or price range";
  }

  const tsxml =
    <div className="flex flex-col gap-2">
      <ScrollToTopButton totalCount={totalCount} skipState={skipState} />
      <header className='w-full'>
        <div className="mt-8 mx-5 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          {totalCount === 0 && (
            <div className="title-head bgprimary w-full py-6">
              {noItems}
            </div>
          )}
          {totalCount > 0 && (
            <>
              <div className='grid grid-row'>
                {edit && (
                  <div>
                    <span className="text-3xl" style={{ color: "var(--app-text)" }}>You are managing</span>
                    <span className="text-3xl pl-3" style={{ color: "var(--app-text-faded)" }}>
                      {totalCount} {totalCount === 1 ? 'property' : 'properties'}
                    </span>
                  </div>
                )}
                {!edit && (
                  <>
                    <div>
                      <span className="text-3xl" style={{ color: "var(--app-text)" }}>The pursuit of your dreams</span>
                      <span className="text-3xl pl-3" style={{ color: "var(--app-text-faded)" }}>
                        {totalCount} {totalCount === 1 ? 'desire' : 'desires'}
                      </span>
                    </div>
                    <SearchSummary params={searchParams} />
                  </>
                )}
              </div>
              <OrderList loading={loading} />
            </>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allProperties.map((item) => (
          <PropertyCard key={item.itemId} item={item} userId={userId} edit={edit} />
        ))}
      </div>
      <div ref={observerTarget} className="h-40 w-full flex items-center justify-center">
        <div className="py-6 text-center w-full min-h-25">
          {loading && <div className="animate-pulse text-(--app-text-faded)">Loading more desires...</div>}
          {!hasMore && allProperties.length > 0 && (
            <div className="text-(--app-text-faded) italic">No more properties found.</div>
          )}
        </div>
      </div>
    </div>

  return tsxml;
}
